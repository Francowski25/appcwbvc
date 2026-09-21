import { TestBed } from '@angular/core/testing';
import { ProductInsert } from './product-insert';
import { Api } from '../../../../api/api';
import { MessageService, ConfirmationService } from 'primeng/api';
import { MockApi, MockMessageService, MockConfirmationService } from '../../../../shared/utils/test-helpers';
import { vi } from 'vitest';

describe('ProductInsert', () => {
  let component: ProductInsert;
  let mockApi: MockApi;
  let mockMessageService: MockMessageService;
  let mockConfirmationService: MockConfirmationService;

  beforeEach(async () => {
    mockApi = new MockApi();
    mockMessageService = new MockMessageService();
    mockConfirmationService = new MockConfirmationService();

    mockApi.invoke$Response.mockImplementation((fn: any) => {
      if (fn && (fn.name === 'categoryGetall' || fn.toString().includes('categoryGetall'))) {
        return Promise.resolve({
          body: {
            type: 'success',
            listCategories: [{ idCategory: '1', name: 'Fármacos' }]
          }
        });
      }
      if (fn && (fn.name === 'laboratoryGetall' || fn.toString().includes('laboratoryGetall'))) {
        return Promise.resolve({
          body: {
            type: 'success',
            listLaboratories: [{ idLaboratory: '1', name: 'Lab A' }]
          }
        });
      }
      return Promise.resolve({ body: { type: 'success' } });
    });

    await TestBed.configureTestingModule({
      imports: [ProductInsert],
      providers: [
        { provide: Api, useValue: mockApi },
        { provide: MessageService, useValue: mockMessageService },
        { provide: ConfirmationService, useValue: mockConfirmationService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ProductInsert);
    component = fixture.componentInstance;
  });

  it('should create and load catalogs', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(component.isLoadingCatalogos()).toBe(false);
    expect(component.catalogoCategorias()).toEqual([{ label: 'Fármacos', value: '1' }]);
    expect(component.catalogoLaboratorios()).toEqual([{ label: 'Lab A', value: '1' }]);
  });

  it('should filter category and laboratory suggestions', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 50));

    component.onFocusCategory();
    expect(component.showCategoryDropdown()).toBe(true);

    component.onSearchCategory({ target: { value: 'fár' } } as any);
    expect(component.categorySuggestions().length).toBe(1);

    component.selectCategory({ label: 'Fármacos', value: '1' });
    expect(component.categoryFb.value).toEqual({ label: 'Fármacos', value: '1' });

    component.onFocusLaboratory();
    expect(component.showLaboratoryDropdown()).toBe(true);

    component.onSearchLaboratory({ target: { value: 'lab' } } as any);
    expect(component.laboratorySuggestions().length).toBe(1);

    component.selectLaboratory({ label: 'Lab A', value: '1' });
    expect(component.laboratoryFb.value).toEqual({ label: 'Lab A', value: '1' });
  });

  it('should call confirm on insert when form is valid', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 50));

    component.frmInsertProduct.setValue({
      name: 'Prod A',
      barcode: '123456',
      category: { label: 'Fármacos', value: '1' },
      laboratory: { label: 'Lab A', value: '1' },
      priceSale: 10.5,
      totalStock: 100,
      stockMinimum: 5,
      nextExpiration: '',
      requiresPrescription: false,
      description: 'Desc A'
    });

    mockApi.invoke$Response.mockResolvedValue({
      body: {
        type: 'success',
        listMessage: ['Producto registrado']
      }
    });

    let registered = false;
    component.productoRegistrado.subscribe(() => registered = true);

    component.sendInsertProduct(new Event('click'));

    expect(mockConfirmationService.confirm).toHaveBeenCalled();
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(registered).toBe(true);
  });

  it('should show error message if form is invalid', () => {
    component.sendInsertProduct(new Event('click'));
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Formulario incompleto',
      detail: 'Complete y corrija todos los campos requeridos.',
      life: 4000
    });
  });

  it('should handle category and laboratory blurs', async () => {
    component.onFocusCategory();
    component.onBlurCategory();
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(component.showCategoryDropdown()).toBe(false);

    component.onFocusLaboratory();
    component.onBlurLaboratory();
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(component.showLaboratoryDropdown()).toBe(false);
  });

  it('should handle file selected', () => {
    const file = new File([''], 'prod.png', { type: 'image/png' });
    component.onFileSelected({ target: { files: [file] } } as any);
    expect(component.selectedFile).toBe(file);
    expect(component.selectedFileName()).toBe('prod.png');
  });
});
