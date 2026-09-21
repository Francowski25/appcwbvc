import { TestBed } from '@angular/core/testing';
import { Warehouse } from './warehouse';

describe('Warehouse', () => {
  let component: Warehouse;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Warehouse]
    }).compileComponents();

    const fixture = TestBed.createComponent(Warehouse);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter items by search and status correctly', () => {
    component.searchTerm = 'Paracetamol';
    let filtered = component.getFilteredInventario();
    expect(filtered.length).toBe(1);
    expect(filtered[0].nombre).toBe('Paracetamol 500mg');

    component.searchTerm = '';
    component.filtroEstado = 'Quiebre de Stock';
    filtered = component.getFilteredInventario();
    expect(filtered.length).toBe(1);
    expect(filtered[0].nombre).toBe('Amoxicilina 500mg');
  });

  it('should register new stock entry', () => {
    component.abrirModalIngreso();
    expect(component.displayModalIngreso).toBe(true);

    component.nuevoIngreso = {
      codigo: 'PROD-777',
      nombre: 'Test Medicine',
      laboratorio: 'Portugal',
      lote: 'L-11111',
      cantidad: 15,
      vencimiento: '2028-01-01'
    };

    component.registrarIngreso();
    expect(component.displayModalIngreso).toBe(false);
    expect(component.inventario.length).toBe(5);
    expect(component.inventario[4].estado).toBe('Quiebre de Stock'); // quantity <= 20
  });

  it('should return correct severity levels', () => {
    expect(component.getSeverity('Normal')).toBe('success');
    expect(component.getSeverity('Por Vencer')).toBe('warn');
    expect(component.getSeverity('Quiebre de Stock')).toBe('danger');
    expect(component.getSeverity('Unknown')).toBe('success');
  });

  it('should count total counts by status', () => {
    expect(component.getTotalNormal()).toBe(2);
    expect(component.getTotalPorVencer()).toBe(1);
    expect(component.getTotalQuiebre()).toBe(1);
  });
});
