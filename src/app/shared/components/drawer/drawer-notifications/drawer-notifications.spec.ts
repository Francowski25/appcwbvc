import { TestBed } from '@angular/core/testing';
import { DrawerNotifications } from './drawer-notifications';

describe('DrawerNotifications', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawerNotifications]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DrawerNotifications);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
