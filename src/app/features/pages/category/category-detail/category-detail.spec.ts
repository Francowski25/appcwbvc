import { TestBed } from '@angular/core/testing';
import { CategoryDetail } from './category-detail';

describe('CategoryDetail', () => {
  let component: CategoryDetail;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryDetail]
    }).compileComponents();

    const fixture = TestBed.createComponent(CategoryDetail);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger closeDialog', () => {
    let closed = false;
    component.onClose.subscribe(() => closed = true);
    component.closeDialog();
    expect(closed).toBe(true);
  });

  it('should activate and cancel editing', () => {
    const fixture = TestBed.createComponent(CategoryDetail);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('categoria', { name: 'Electro' });

    component.activarEdicion();
    expect(component.isEditing()).toBe(true);
    expect(component.editName()).toBe('Electro');

    component.cancelarEdicion();
    expect(component.isEditing()).toBe(false);
  });

  it('should emit onEditar when saving changes', () => {
    const fixture = TestBed.createComponent(CategoryDetail);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('categoria', { idCategory: 1, name: 'Electro' });

    component.activarEdicion();
    component.editName.set('Electro-new');

    let savedData: any = null;
    component.onEditar.subscribe(data => savedData = data);

    component.guardarCambios();
    expect(savedData.name).toBe('Electro-new');
    expect(component.isEditing()).toBe(false);
  });

  it('should handle file selection', () => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    const dummyEvent = {
      target: {
        files: [file]
      }
    } as unknown as Event;

    component.onFileSelected(dummyEvent);
    expect(component.selectedFile()).toBe(file);
  });
});
