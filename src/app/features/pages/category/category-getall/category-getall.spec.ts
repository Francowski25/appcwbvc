import { TestBed } from '@angular/core/testing';
import { CategoryGetall } from './category-getall';
import { Api } from '../../../../api/api';
import { MessageService } from 'primeng/api';
import { MockApi, MockMessageService } from '../../../../shared/utils/test-helpers';
import { vi } from 'vitest';

describe('CategoryGetall', () => {
  let component: CategoryGetall;
  let mockApi: MockApi;
  let mockMessageService: MockMessageService;

  beforeEach(async () => {
    mockApi = new MockApi();
    mockMessageService = new MockMessageService();

    mockApi.invoke$Response.mockImplementation((fn: any) => {
      if (fn && (fn.name === 'categoryGetall' || fn.toString().includes('categoryGetall'))) {
        return Promise.resolve({
          body: {
            type: 'success',
            listCategories: [
              { idCategory: 1, name: 'Electro', status: 'Activo' },
              { idCategory: 2, name: 'Hogar', status: 'Inactivo' }
            ]
          }
        });
      }
      if (fn && (fn.name === 'productGetall' || fn.toString().includes('productGetall'))) {
        return Promise.resolve({
          body: {
            type: 'success',
            listProducts: [
              { idProduct: 10, name: 'Licuadora', idCategory: 1 }
            ]
          }
        });
      }
      return Promise.resolve({ body: { type: 'success' } });
    });

    await TestBed.configureTestingModule({
      imports: [CategoryGetall],
      providers: [
        { provide: Api, useValue: mockApi },
        { provide: MessageService, useValue: mockMessageService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(CategoryGetall);
    component = fixture.componentInstance;
  });

  it('should create and initialize data', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(component.loading()).toBe(false);
    expect(component.categorias().length).toBe(2);
    expect(component.productos().length).toBe(1);

    expect(component.totalCategorias()).toBe(2);
    expect(component.totalActivas()).toBe(1);
    expect(component.totalInactivas()).toBe(1);
  });

  it('should filter categories correctly by name and status', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    component.onBusquedaChange('hog');
    expect(component.filtrados().length).toBe(1);
    expect(component.filtrados()[0].name).toBe('Hogar');

    component.onBusquedaChange('');
    component.onEstadoChange('activo');
    expect(component.filtrados().length).toBe(1);
    expect(component.filtrados()[0].name).toBe('Electro');
  });

  it('should toggle dialog states', () => {
    component.onCrearCategoria();
    expect(component.showInsertDialog()).toBe(true);

    component.onCategoriaRegistrada();
    expect(component.showInsertDialog()).toBe(false);

    component.onEditar({ idCategory: 1, name: 'Electro' });
    expect(component.selectedCategory()).toEqual({ idCategory: 1, name: 'Electro' });
    expect(component.showDetailDialog()).toBe(true);

    component.onCategoriaDetallada();
    expect(component.showDetailDialog()).toBe(false);
    expect(component.selectedCategory()).toBeNull();
  });

  it('should toggle status successfully', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    mockApi.invoke$Response.mockResolvedValue({
      body: {
        type: 'success',
        listMessage: ['Estado cambiado exitosamente.']
      }
    });

    const category = component.categorias()[0]; // Electro (Activo)
    component.onToggleStatus(category);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(category.status).toBe('inactivo');
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Estado actualizado',
      detail: 'Estado cambiado exitosamente.',
      life: 4000
    });
  });
});
