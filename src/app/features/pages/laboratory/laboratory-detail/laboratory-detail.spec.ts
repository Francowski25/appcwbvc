import { TestBed } from '@angular/core/testing';
import { LaboratoryDetail } from './laboratory-detail';

describe('LaboratoryDetail', () => {
  let component: LaboratoryDetail;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaboratoryDetail]
    }).compileComponents();

    const fixture = TestBed.createComponent(LaboratoryDetail);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle edit mode and emit updates on guardarCambios', () => {
    const fixture = TestBed.createComponent(LaboratoryDetail);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('laboratorio', {
      idLaboratory: 1,
      name: 'Lab A',
      image: 'pic.png'
    });
    fixture.detectChanges();

    component.activarEdicion();
    expect(component.isEditing()).toBe(true);
    expect(component.editName()).toBe('Lab A');

    component.editName.set('Lab A edited');

    let editedData: any = null;
    component.onEditar.subscribe(val => editedData = val);

    component.guardarCambios();

    expect(editedData.idLaboratory).toBe(1);
    expect(editedData.name).toBe('Lab A edited');
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
  });

  it('should emit onClose when closing', () => {
    let closed = false;
    component.onClose.subscribe(() => closed = true);
    component.closeDialog();
    expect(closed).toBe(true);
  });
});
