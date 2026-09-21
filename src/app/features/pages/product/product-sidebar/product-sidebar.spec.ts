import { TestBed } from '@angular/core/testing';
import { ProductSidebar } from './product-sidebar';

describe('ProductSidebar', () => {
  let component: ProductSidebar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductSidebar]
    }).compileComponents();

    const fixture = TestBed.createComponent(ProductSidebar);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter and handle selection exact match', () => {
    const fixture = TestBed.createComponent(ProductSidebar);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('categorias', [{ name: 'Fármacos', count: 10 }]);
    fixture.componentRef.setInput('laboratorios', [{ name: 'Lab A', count: 5 }]);
    fixture.detectChanges();

    component.busquedaCategoria.set('fár');
    expect(component.categoriasFiltradas().length).toBe(1);
    expect(component.categoriasFiltradas()[0].name).toBe('Fármacos');

    component.busquedaLaboratorio.set('lab');
    expect(component.laboratoriosFiltrados().length).toBe(1);
    expect(component.laboratoriosFiltrados()[0].name).toBe('Lab A');

    component.busquedaCategoria.set('Fármacos');
    expect(component.esSeleccionExactaCategoria()).toBe(true);

    component.busquedaLaboratorio.set('Lab A');
    expect(component.esSeleccionExactaLaboratorio()).toBe(true);
  });

  it('should emit changes on search/category/lab changes', () => {
    let search = '';
    let cat = '';
    let lab = '';
    component.searchChange.subscribe(v => search = v);
    component.categoriaChange.subscribe(v => cat = v);
    component.laboratorioChange.subscribe(v => lab = v);

    component.onSearch({ target: { value: 'search-query' } } as any);
    component.onBuscarCategoria({ target: { value: 'cat-query' } } as any);
    component.onBuscarLaboratorio({ target: { value: 'lab-query' } } as any);

    expect(search).toBe('search-query');
    expect(cat).toBe('cat-query');
    expect(lab).toBe('lab-query');
  });

  it('should select items directly and clear filters', () => {
    component.seleccionarCategoria('Fármacos');
    component.seleccionarLaboratorio('Lab A');

    expect(component.busquedaCategoria()).toBe('Fármacos');
    expect(component.busquedaLaboratorio()).toBe('Lab A');

    component.limpiarTodosLosFiltros();
    expect(component.busquedaGeneral()).toBe('');
    expect(component.busquedaCategoria()).toBe('');
    expect(component.busquedaLaboratorio()).toBe('');
  });
});
