import { TestBed } from '@angular/core/testing';
import { UserDetails } from './user-details';

describe('UserDetails', () => {
  let component: UserDetails;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDetails]
    }).compileComponents();

    const fixture = TestBed.createComponent(UserDetails);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load initial data using effect when input changes', async () => {
    const fixture = TestBed.createComponent(UserDetails);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('usuario', {
      firstName: 'Juan',
      surName: 'Perez',
      dni: '12345678',
      cellPhone: '999888777',
      email: 'juan@test.com',
      image: 'pic.png'
    });

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.editFirstName()).toBe('Juan');
    expect(component.editSurName()).toBe('Perez');
    expect(component.editDni()).toBe('12345678');
    expect(component.editCellPhone()).toBe('999888777');
    expect(component.editEmail()).toBe('juan@test.com');
    expect(component.editImage()).toBe('pic.png');
  });

  it('should restore preview image', () => {
    component.previewImage.set('data:image/png;base64,...');
    component.restaurarImagen();
    expect(component.previewImage()).toBe('');
  });

  it('should emit onSave when saving changes', async () => {
    const fixture = TestBed.createComponent(UserDetails);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('usuario', {
      idUser: 1,
      firstName: 'Juan',
      surName: 'Perez',
      email: 'juan@test.com'
    });

    fixture.detectChanges();
    await fixture.whenStable();

    component.editFirstName.set('Juan-edited');

    let savedData: any = null;
    component.onSave.subscribe(data => savedData = data);

    component.guardarCambios();

    expect(savedData.idUser).toBe(1);
    expect(savedData.firstName).toBe('Juan-edited');
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
