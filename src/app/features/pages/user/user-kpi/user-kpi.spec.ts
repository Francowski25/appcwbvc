import { TestBed } from '@angular/core/testing';
import { UserKpi } from './user-kpi';

describe('UserKpi', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserKpi]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(UserKpi);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
