import { TestBed } from '@angular/core/testing';
import { SupplierNew } from './supplier-new';
import { Api } from '../../../../api/api';
import { MockApi } from '../../../../shared/utils/test-helpers';
import { vi } from 'vitest';

describe('SupplierNew', () => {
  let component: SupplierNew;
  let mockApi: MockApi;

  beforeEach(async () => {
    mockApi = new MockApi();

    await TestBed.configureTestingModule({
      imports: [SupplierNew],
      providers: [
        { provide: Api, useValue: mockApi }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(SupplierNew);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle to edit mode if proveedor input is set', () => {
    const fixture = TestBed.createComponent(SupplierNew);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('proveedor', {
      idSupplier: 's1',
      name: 'Supplier A',
      ruc: '12345678901',
      phone: '999888777',
      address: 'Calle 123',
      email: 'a@b.com'
    });
    fixture.detectChanges();

    expect(component.esEdicion()).toBe(true);
    expect(component.form().name).toBe('Supplier A');
  });

  it('should validate form and reject empty names', () => {
    component.onGuardar();
    expect(component.error()).toBe('El nombre es obligatorio.');
    expect(mockApi.invoke$Response).not.toHaveBeenCalled();
  });

  it('should invoke update API in edit mode', async () => {
    const fixture = TestBed.createComponent(SupplierNew);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('proveedor', {
      idSupplier: 's1',
      name: 'Supplier A'
    });
    fixture.detectChanges();

    mockApi.invoke$Response.mockResolvedValue({
      body: {
        type: 'success'
      }
    });

    let saved = false;
    component.guardado.subscribe(() => saved = true);

    component.updateField('name', 'Supplier A Modified');
    component.onGuardar();

    await new Promise(resolve => setTimeout(resolve, 50));

    expect(mockApi.invoke$Response).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      body: expect.objectContaining({
        idSupplier: 's1',
        name: 'Supplier A Modified'
      })
    }));
    expect(saved).toBe(true);
  });

  it('should invoke insert API in insert mode', async () => {
    mockApi.invoke$Response.mockResolvedValue({
      body: {
        type: 'success'
      }
    });

    let saved = false;
    component.guardado.subscribe(() => saved = true);

    component.updateField('name', 'New Supplier');
    component.onGuardar();

    await new Promise(resolve => setTimeout(resolve, 50));

    expect(mockApi.invoke$Response).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      body: expect.objectContaining({
        name: 'New Supplier'
      })
    }));
    expect(saved).toBe(true);
  });
});
