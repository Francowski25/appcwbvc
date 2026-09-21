import { TestBed } from '@angular/core/testing';
import { PurchaseDetail } from './purchase-detail';

describe('PurchaseDetail', () => {
  let component: PurchaseDetail;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseDetail]
    }).compileComponents();

    const fixture = TestBed.createComponent(PurchaseDetail);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should format ID correctly', () => {
    expect(component.getIdCorto('1234567890')).toBe('12345678');
    expect(component.getIdCorto('')).toBe('');
  });
});
