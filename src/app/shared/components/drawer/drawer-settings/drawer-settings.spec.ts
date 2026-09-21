import { TestBed } from '@angular/core/testing';
import { DrawerSettings } from './drawer-settings';

describe('DrawerSettings', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawerSettings]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DrawerSettings);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
