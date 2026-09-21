import { TestBed } from '@angular/core/testing';
import { CategoryGraphic } from './category-graphic';

describe('CategoryGraphic', () => {
  let component: CategoryGraphic;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryGraphic]
    }).compileComponents();

    const fixture = TestBed.createComponent(CategoryGraphic);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute chartData correctly', () => {
    const fixture = TestBed.createComponent(CategoryGraphic);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('categorias', [
      { idCategory: 1, name: 'Fármacos', totalProducts: 10 },
      { idCategory: 2, name: 'Cosméticos', totalProducts: 5 }
    ]);

    const data = component.chartData();
    expect(data.labels).toEqual(['Fármacos', 'Cosméticos']);
    expect(data.datasets[0].data).toEqual([10, 5]);
  });

  it('should handle empty categories', () => {
    const fixture = TestBed.createComponent(CategoryGraphic);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('categorias', []);

    const data = component.chartData();
    expect(data.labels).toEqual([]);
    expect(data.datasets).toEqual([]);
  });

  it('should call tooltip callbacks correctly', () => {
    const fixture = TestBed.createComponent(CategoryGraphic);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('categorias', [
      { idCategory: 1, name: 'Fármacos', totalProducts: 10 },
      { idCategory: 2, name: 'Cosméticos', totalProducts: 5 }
    ]);

    const opts = component.chartOptions();
    const tooltipCallbacks = opts.plugins?.tooltip?.callbacks;
    expect(tooltipCallbacks).toBeDefined();

    if (tooltipCallbacks) {
      const mockModel = {} as any;

      const title = tooltipCallbacks.title
        ? tooltipCallbacks.title.call(mockModel, [{ label: 'Fármacos' } as any])
        : '';
      expect(title).toBe('Fármacos');

      const label = tooltipCallbacks.label
        ? tooltipCallbacks.label.call(mockModel, { parsed: { y: 10 } } as any)
        : '';
      expect(label).toBe('  Productos: 10');

      const afterLabel = tooltipCallbacks.afterLabel
        ? tooltipCallbacks.afterLabel.call(mockModel, { parsed: { y: 10 } } as any)
        : '';
      expect(afterLabel).toBe('  Del total: 66.7%');
    }
  });
});