import { TestBed } from '@angular/core/testing';
import { LotStock } from './lot-stock';

describe('LotStock', () => {
  let component: LotStock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LotStock]
    }).compileComponents();

    const fixture = TestBed.createComponent(LotStock);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LotStock);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('lotes', []);
    expect(component).toBeTruthy();
  });

  it('should compute top 10 and chartData correctly', () => {
    const fixture = TestBed.createComponent(LotStock);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('lotes', [
      { code: 'L1', currentStock: 10 },
      { code: 'L2', currentStock: 40 },
      { code: 'L3', currentStock: 25 }
    ]);

    expect(component.top10()[0].code).toBe('L2');
    expect(component.chartData().labels).toEqual(['L2', 'L3', 'L1']);
    expect(component.chartData().datasets[0].data).toEqual([40, 25, 10]);
  });
});
