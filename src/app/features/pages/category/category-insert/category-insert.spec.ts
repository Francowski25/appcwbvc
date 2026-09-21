import { TestBed } from '@angular/core/testing';
import { CategoryInsert } from './category-insert';
import { Api } from '../../../../api/api';
import { MessageService } from 'primeng/api';
import { MockApi, MockMessageService } from '../../../../shared/utils/test-helpers';
import { vi } from 'vitest';

describe('CategoryInsert', () => {
  let component: CategoryInsert;
  let mockApi: MockApi;
  let mockMessageService: MockMessageService;

  beforeEach(async () => {
    mockApi = new MockApi();
    mockMessageService = new MockMessageService();

    await TestBed.configureTestingModule({
      imports: [CategoryInsert],
      providers: [
        { provide: Api, useValue: mockApi },
        { provide: MessageService, useValue: mockMessageService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(CategoryInsert);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate form and set nameError if empty', async () => {
    component.name.set('');
    await component.onSubmit();
    expect(component.nameError()).toBe('El nombre es requerido.');
  });

  it('should submit successfully and reset form', async () => {
    component.name.set('Fármacos');
    component.previewUrl.set('data:image/png;base64,123');

    mockApi.invoke$Response.mockResolvedValue({
      body: {
        type: 'success',
        listMessage: ['Categoría creada']
      }
    });

    let registered = false;
    component.categoriaRegistrada.subscribe(() => registered = true);

    await component.onSubmit();

    expect(mockApi.invoke$Response).toHaveBeenCalled();
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Categoría creada',
      life: 4000
    });
    expect(component.name()).toBe('');
    expect(registered).toBe(true);
  });

  it('should show warning on default responses', async () => {
    component.name.set('Fármacos');
    mockApi.invoke$Response.mockResolvedValue({
      body: {
        type: 'warning',
        listMessage: ['Ya existe la categoría']
      }
    });

    await component.onSubmit();
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Ya existe la categoría',
      life: 5000
    });
  });

  it('should handle API exceptions', async () => {
    component.name.set('Fármacos');
    mockApi.invoke$Response.mockRejectedValue(new Error('Connection failure'));

    await component.onSubmit();
    expect(component.error()).toBe('No se pudo conectar con el servidor.');
  });
});
