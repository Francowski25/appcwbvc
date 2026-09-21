import { TestBed } from '@angular/core/testing';
import { Drawer } from './drawer';
import { LayoutService } from '../../../services/layout.service';
import { MockLayoutService } from '../../utils/test-helpers';
import { vi } from 'vitest';

describe('Drawer', () => {
  let component: Drawer;
  let mockLayoutService: MockLayoutService;

  beforeEach(async () => {
    mockLayoutService = new MockLayoutService();

    await TestBed.configureTestingModule({
      imports: [Drawer],
      providers: [
        { provide: LayoutService, useValue: mockLayoutService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(Drawer);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute isVisible based on activeDrawer', () => {
    mockLayoutService.activeDrawer.set(null);
    expect(component.isVisible).toBe(false);

    mockLayoutService.activeDrawer.set('settings');
    expect(component.isVisible).toBe(true);
  });

  it('should close drawer when setting isVisible to false', () => {
    component.isVisible = false;
    expect(mockLayoutService.closeDrawer).toHaveBeenCalled();
  });

  it('should not close drawer when setting isVisible to true', () => {
    component.isVisible = true;
    expect(mockLayoutService.closeDrawer).not.toHaveBeenCalled();
  });
});
