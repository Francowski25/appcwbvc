import { TestBed } from '@angular/core/testing';
import { LaboratoryGraphic } from './laboratory-graphic';

describe('LaboratoryGraphic', () => {
  let component: LaboratoryGraphic;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaboratoryGraphic]
    }).compileComponents();

    const fixture = TestBed.createComponent(LaboratoryGraphic);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute chartData correctly', () => {
    const fixture = TestBed.createComponent(LaboratoryGraphic);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('laboratories', [
      { name: 'Lab A', totalProducts: 10 },
      { name: 'Lab B', totalProducts: 5 }
    ]);
    fixture.detectChanges();

    expect(component.chartData().labels).toEqual(['Lab A', 'Lab B']);
    expect(component.chartData().datasets[0].data).toEqual([10, 5]);
  });

  it('should handle empty laboratories', () => {
    const fixture = TestBed.createComponent(LaboratoryGraphic);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('laboratories', []);
    fixture.detectChanges();

    expect(component.chartData().labels).toEqual([]);
    expect(component.chartData().datasets).toEqual([]);
  });

  it('should execute tooltip callback functions correctly', () => {
    const fixture = TestBed.createComponent(LaboratoryGraphic);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('laboratories', [
      { name: 'Lab A', totalProducts: 10 },
      { name: 'Lab B', totalProducts: 5 }
    ]);
    fixture.detectChanges();

    const opts = component.chartOptions();
    const tooltipCallbacks = opts.plugins?.tooltip?.callbacks;
    expect(tooltipCallbacks).toBeDefined();

    if (tooltipCallbacks) {
      const mockModel = {} as any;

      const titleResult = tooltipCallbacks.title
        ? tooltipCallbacks.title.call(mockModel, [{ label: 'Lab A' } as any])
        : '';
      expect(titleResult).toBe('Lab A');

      const labelResult = tooltipCallbacks.label
        ? tooltipCallbacks.label.call(mockModel, { parsed: { y: 10 } } as any)
        : '';
      expect(labelResult).toBe('  Productos: 10');

      const afterLabelResult = tooltipCallbacks.afterLabel
        ? tooltipCallbacks.afterLabel.call(mockModel, { parsed: { y: 10 } } as any)
        : '';
      expect(afterLabelResult).toBe('  Del total: 66.7%');
    }
  });
});
