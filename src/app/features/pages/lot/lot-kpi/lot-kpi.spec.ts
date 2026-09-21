import { TestBed } from '@angular/core/testing';
import { LotKpi } from './lot-kpi';

describe('LotKpi', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LotKpi]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LotKpi);
    fixture.componentRef.setInput('totalLotes', 10);
    fixture.componentRef.setInput('optimos', 5);
    fixture.componentRef.setInput('porVencer', 3);
    fixture.componentRef.setInput('vencidos', 2);
    fixture.componentRef.setInput('agotados', 0);
    fixture.componentRef.setInput('valorAlmacen', 1500.5);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
