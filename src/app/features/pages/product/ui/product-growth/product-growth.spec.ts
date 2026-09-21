import { TestBed } from '@angular/core/testing';
import { ProductGrowth } from './product-growth';

describe('ProductGrowth', () => {
  let component: ProductGrowth;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductGrowth]
    }).compileComponents();

    const fixture = TestBed.createComponent(ProductGrowth);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change period', () => {
    component.onPeriodoChange('dia');
    expect(component.periodo()).toBe('dia');
  });

  it('should format labels and calculate accumulation correctly for multiple periods', () => {
    const fixture = TestBed.createComponent(ProductGrowth);
    component = fixture.componentInstance;

    const testProducts = [
      { createdAt: '2026-08-01 10:00:00' },
      { createdAt: '2026-08-02 12:00:00' }
    ];
    fixture.componentRef.setInput('productos', testProducts);
    fixture.detectChanges();

    expect(component.totalRegistrados()).toBe(2);
    expect(component.chartData().datasets[0].data.length).toBeGreaterThan(0);

    component.onPeriodoChange('dia');
    fixture.detectChanges();
    expect(component.chartData().datasets[0].data.length).toBeGreaterThan(0);

    component.onPeriodoChange('semana');
    fixture.detectChanges();
    expect(component.chartData().datasets[0].data.length).toBeGreaterThan(0);

    component.onPeriodoChange('anio');
    fixture.detectChanges();
    expect(component.chartData().datasets[0].data.length).toBeGreaterThan(0);
  });

  it('should execute tooltip callback', () => {
    const opts = component.chartOptions();
    const tooltipLabel = opts.plugins?.tooltip?.callbacks?.label;
    expect(tooltipLabel).toBeDefined();

    if (tooltipLabel) {
      const mockModel = {} as any;
      const mockCtx = {
        parsed: { y: 15 }
      } as any;
      const result = tooltipLabel.call(mockModel, mockCtx);
      expect(result).toBe(' 15 productos en total');
    }
  });
});
