import { TestBed } from '@angular/core/testing';
import { PurchaseTable } from './purchase-table';

describe('PurchaseTable', () => {
  let component: PurchaseTable;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseTable]
    }).compileComponents();

    const fixture = TestBed.createComponent(PurchaseTable);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PurchaseTable);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('compras', []);
    expect(component).toBeTruthy();
  });

  it('should return short id representation', () => {
    expect(component.getIdCorto('abcdefghijk')).toBe('ABCDEFGH');
    expect(component.getIdCorto('')).toBe('');
  });
});
