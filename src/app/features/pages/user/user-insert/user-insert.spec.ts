import { TestBed } from '@angular/core/testing';
import { UsersInsert } from './user-insert';
import { Api } from '../../../../api/api';
import { MessageService, ConfirmationService } from 'primeng/api';
import { MockApi, MockMessageService, MockConfirmationService } from '../../../../shared/utils/test-helpers';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';

describe('UsersInsert', () => {
  let component: UsersInsert;
  let mockApi: MockApi;
  let mockMessageService: MockMessageService;
  let mockConfirmationService: MockConfirmationService;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    mockApi = new MockApi();
    mockMessageService = new MockMessageService();
    mockConfirmationService = new MockConfirmationService();

    await TestBed.configureTestingModule({
      imports: [UsersInsert],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Api, useValue: mockApi },
        { provide: MessageService, useValue: mockMessageService },
        { provide: ConfirmationService, useValue: mockConfirmationService }
      ]
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(UsersInsert);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create and have initial form states', () => {
    expect(component).toBeTruthy();
    expect(component.frmInsertUser.valid).toBe(false);
    expect(component.firstNameFb.disabled).toBe(true);
  });

  it('should trigger reniec search when DNI has 8 digits', async () => {
    component.dniFb.setValue('12345678');
    await new Promise(resolve => setTimeout(resolve, 450));

    const req = httpTestingController.expectOne(req => req.url.includes('/api/reniec/12345678'));
    expect(req.request.method).toBe('GET');
    req.flush({
      first_name: 'Ana',
      first_last_name: 'Torres',
      second_last_name: 'Silva'
    });

    expect(component.firstNameFb.value).toBe('Ana');
    expect(component.surNameFb.value).toBe('Torres Silva');
  });

  it('should submit successfully when form is valid and confirmation accepted', async () => {
    component.firstNameFb.enable();
    component.surNameFb.enable();

    component.frmInsertUser.setValue({
      firstName: 'Juan',
      surName: 'Perez',
      dni: '12345678',
      cellPhone: '999888777',
      email: 'juan@test.com',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'Vendedor',
      image: ''
    });

    mockApi.invoke$Response.mockResolvedValue({
      body: {
        type: 'success',
        listMessage: ['Usuario registrado.']
      }
    });

    let registered = false;
    component.usuarioRegistrado.subscribe(() => registered = true);

    const dummyEvent = new Event('click');
    component.sendInsertUser(dummyEvent);

    expect(mockConfirmationService.confirm).toHaveBeenCalled();
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(mockApi.invoke$Response).toHaveBeenCalled();
    expect(registered).toBe(true);
  });

  it('should not submit if form is invalid', () => {
    const dummyEvent = new Event('click');
    component.sendInsertUser(dummyEvent);
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Formulario incompleto',
      detail: 'Complete y corrija todos los campos requeridos.',
      life: 4000
    });
    expect(mockConfirmationService.confirm).not.toHaveBeenCalled();
  });
});
