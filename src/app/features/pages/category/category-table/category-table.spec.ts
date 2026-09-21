import { TestBed } from '@angular/core/testing';
import { CategoryTable } from './category-table';
import { ConfirmationService } from 'primeng/api';
import { MockConfirmationService } from '../../../../shared/utils/test-helpers';
import { vi } from 'vitest';

describe('CategoryTable', () => {
  let component: CategoryTable;
  let mockConfirmationService: MockConfirmationService;

  beforeEach(async () => {
    mockConfirmationService = new MockConfirmationService();

    await TestBed.configureTestingModule({
      imports: [CategoryTable],
      providers: [
        { provide: ConfirmationService, useValue: mockConfirmationService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(CategoryTable);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate computed properties correctly', () => {
    const fixture = TestBed.createComponent(CategoryTable);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('categorias', [
      { idCategory: 1, name: 'Cat A', status: 'Activo' },
      { idCategory: 2, name: 'Cat B', status: 'Inactivo' },
      { idCategory: 3, name: 'Cat C', status: 'Activo' }
    ]);

    component.filasPorPagina.set(2);
    component.paginaActual.set(0);

    expect(component.totalPaginas()).toBe(2);
    expect(component.primerRegistro()).toBe(1);
    expect(component.ultimoRegistro()).toBe(2);
    expect(component.paginadas().length).toBe(2);

    component.paginaActual.set(1);
    expect(component.primerRegistro()).toBe(3);
    expect(component.ultimoRegistro()).toBe(3);
    expect(component.paginadas().length).toBe(1);
  });

  it('should emit status toggle when confirmed', () => {
    const fixture = TestBed.createComponent(CategoryTable);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('categorias', [
      { idCategory: 1, name: 'Cat A', status: 'Activo' }
    ]);

    let toggledCat: any = null;
    component.onToggleStatus.subscribe(cat => toggledCat = cat);

    const dummyEvent = new Event('click');
    component.confirmarCambioEstado(dummyEvent, { idCategory: 1, name: 'Cat A', status: 'Activo' });

    expect(mockConfirmationService.confirm).toHaveBeenCalled();
    expect(toggledCat).toEqual({ idCategory: 1, name: 'Cat A', status: 'Activo' });
  });

  it('should change page when event triggers', () => {
    component.onPageChange({ page: 2, rows: 5 });
    expect(component.paginaActual()).toBe(2);
    expect(component.filasPorPagina()).toBe(5);
  });
});
