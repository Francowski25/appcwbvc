import { TestBed } from '@angular/core/testing';
import { LotStatus } from './lot-status';

describe('LotStatus', () => {
  let component: LotStatus;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LotStatus]
    }).compileComponents();

    const fixture = TestBed.createComponent(LotStatus);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LotStatus);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('lotes', []);
    fixture.componentRef.setInput('porVencer', 0);
    expect(component).toBeTruthy();
  });

  it('should compute states and chartData correctly', () => {
    const fixture = TestBed.createComponent(LotStatus);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('lotes', [
      { expirationStatus: 'Vigente' },
      { expirationStatus: 'Vigente' },
      { expirationStatus: 'Vencido' }
    ]);
    fixture.componentRef.setInput('porVencer', 4);

    expect(component.vigentes()).toBe(2);
    expect(component.vencidos()).toBe(1);
    expect(component.chartData().datasets[0].data).toEqual([2, 4, 1]);
  });
});
