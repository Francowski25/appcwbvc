import { TestBed } from '@angular/core/testing';
import { LaboratoryInsert } from './laboratory-insert';
import { Api } from '../../../../api/api';
import { MessageService } from 'primeng/api';
import { MockApi, MockMessageService } from '../../../../shared/utils/test-helpers';
import { vi } from 'vitest';

describe('LaboratoryInsert', () => {
  let component: LaboratoryInsert;
  let mockApi: MockApi;
  let mockMessageService: MockMessageService;

  beforeEach(async () => {
    mockApi = new MockApi();
    mockMessageService = new MockMessageService();

    await TestBed.configureTestingModule({
      imports: [LaboratoryInsert],
      providers: [
        { provide: Api, useValue: mockApi },
        { provide: MessageService, useValue: mockMessageService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(LaboratoryInsert);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate form and show error if name is empty', async () => {
    await component.onSubmit();
    expect(component.nameError()).toBe('El nombre es requerido.');
    expect(mockApi.invoke$Response).not.toHaveBeenCalled();
  });

  it('should submit successfully if form is valid', async () => {
    component.name.set('Lab X');

    mockApi.invoke$Response.mockResolvedValue({
      body: {
        type: 'success',
        listMessage: ['Laboratorio creado']
      }
    });

    let registered = false;
    component.laboratorioRegistrado.subscribe(() => registered = true);

    await component.onSubmit();

    expect(mockApi.invoke$Response).toHaveBeenCalled();
    expect(registered).toBe(true);
    expect(mockMessageService.add).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'success',
      summary: 'Éxito'
    }));
  });

  it('should handle API failure response', async () => {
    component.name.set('Lab X');

    mockApi.invoke$Response.mockResolvedValue({
      body: {
        type: 'error',
        listMessage: ['Name already exists']
      }
    });

    await component.onSubmit();
    expect(component.error()).toBe('Name already exists');
  });

  it('should handle API rejection', async () => {
    component.name.set('Lab X');
    mockApi.invoke$Response.mockRejectedValue(new Error('Connection error'));

    await component.onSubmit();
    expect(component.error()).toBe('No se pudo conectar con el servidor.');
  });
});
