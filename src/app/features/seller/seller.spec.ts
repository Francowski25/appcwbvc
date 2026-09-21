import { TestBed } from '@angular/core/testing';
import { Seller } from './seller';
import { provideRouter } from '@angular/router';
import { LayoutService } from '../../services/layout.service';
import { MockLayoutService } from '../../shared/utils/test-helpers';
import { MessageService, ConfirmationService } from 'primeng/api';
import { vi } from 'vitest';
import { of } from 'rxjs';

describe('Seller', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Seller],
      providers: [
        provideRouter([]),
        { provide: LayoutService, useValue: new MockLayoutService() },
        { provide: MessageService, useValue: { add: vi.fn() } },
        { provide: ConfirmationService, useValue: { confirm: vi.fn(), close: vi.fn(), requireConfirmation$: of() } }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Seller);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
