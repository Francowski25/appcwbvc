import { TestBed } from '@angular/core/testing';
import { InventoryDetail } from './inventory-detail';

describe('InventoryDetail', () => {
  let component: InventoryDetail;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryDetail]
    }).compileComponents();

    const fixture = TestBed.createComponent(InventoryDetail);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should getInitials and shortenId correctly', () => {
    expect(component.getInitials('John Doe')).toBe('JD');
    expect(component.getInitials('Alice')).toBe('AL');
    expect(component.getInitials('')).toBe('??');

    expect(component.shortenId('abc-def')).toBe('ABC');
    expect(component.shortenId('')).toBe('');
  });
});
