import { TestBed } from '@angular/core/testing';
import { DrawerMessages } from './drawer-messages';

describe('DrawerMessages', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawerMessages]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DrawerMessages);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
