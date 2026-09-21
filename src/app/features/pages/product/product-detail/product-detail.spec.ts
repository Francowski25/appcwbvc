import { TestBed } from '@angular/core/testing';
import { ProductDetail } from './product-detail';

describe('ProductDetail', () => {
  let component: ProductDetail;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetail]
    }).compileComponents();

    const fixture = TestBed.createComponent(ProductDetail);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open and close edit mode correctly', () => {
    const fixture = TestBed.createComponent(ProductDetail);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('producto', {
      name: 'Prod A',
      barcode: '123456',
      priceSale: '10.5',
      stockMinimum: '5',
      description: 'Test description'
    });
    fixture.detectChanges();

    component.activarEdicion();
    expect(component.isEditing()).toBe(true);
    expect(component.editName()).toBe('Prod A');

    component.cancelarEdicion();
    expect(component.isEditing()).toBe(false);
  });

  it('should emit onSave when saving edited fields', () => {
    const fixture = TestBed.createComponent(ProductDetail);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('producto', {
      idProduct: 1,
      name: 'Prod A'
    });
    fixture.detectChanges();

    component.activarEdicion();
    component.editName.set('Prod A edited');

    let savedData: any = null;
    component.onSave.subscribe(val => savedData = val);

    component.guardarCambios();

    expect(savedData.idProduct).toBe(1);
    expect(savedData.name).toBe('Prod A edited');
    expect(component.isEditing()).toBe(false);
  });

  it('should calculate severity and labels correctly', () => {
    expect(component.getStockLabel(0, 5)).toBe('Agotado');
    expect(component.getStockLabel(3, 5)).toBe('Bajo Stock');
    expect(component.getStockLabel(10, 5)).toBe('En Stock');

    expect(component.getStockSeverity(0, 5)).toBe('danger');
    expect(component.getStockSeverity(3, 5)).toBe('warn');
    expect(component.getStockSeverity(10, 5)).toBe('success');
  });

  it('should handle file selection', () => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    const dummyEvent = {
      target: {
        files: [file]
      }
    } as unknown as Event;

    component.onFileSelected(dummyEvent);
  });
});
