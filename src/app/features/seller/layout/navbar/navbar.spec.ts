import { TestBed } from '@angular/core/testing';
import { Navbar } from './navbar';
import { LayoutService } from '../../../../services/layout.service';
import { MockLayoutService } from '../../../../shared/utils/test-helpers';

describe('Navbar', () => {
  let component: Navbar;
  let mockLayoutService: MockLayoutService;

  beforeEach(async () => {
    mockLayoutService = new MockLayoutService();

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        { provide: LayoutService, useValue: mockLayoutService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
