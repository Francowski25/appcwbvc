import { TestBed } from '@angular/core/testing';
import { ProductCategory } from './product-category';

describe('ProductCategory', () => {
  let component: ProductCategory;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCategory]
    }).compileComponents();

    const fixture = TestBed.createComponent(ProductCategory);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute states and chartData based on products correctly', () => {
    const fixture = TestBed.createComponent(ProductCategory);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('productos', [
      { category: 'Fármacos' },
      { category: 'Cosméticos' },
      { category: 'Fármacos' }
    ]);
    fixture.detectChanges();

    expect(component.totalCategorias()).toBe(2);
    expect(component.chartData().labels).toEqual(['Fármacos', 'Cosméticos']);
    expect(component.chartData().datasets[0].data).toEqual([2, 1]);
  });

  it('should execute tooltip label callback correctly', () => {
    const opts = component.chartOptions();
    const tooltipLabel = opts.plugins?.tooltip?.callbacks?.label;
    expect(tooltipLabel).toBeDefined();

    if (tooltipLabel) {
      const mockModel = {} as any;
      const mockCtx = {
        dataset: { data: [2, 1] },
        parsed: 2,
        label: 'Fármacos'
      } as any;
      const result = tooltipLabel.call(mockModel, mockCtx);
      expect(result).toBe(' Fármacos: 2 productos (67%)');
    }
  });
});
