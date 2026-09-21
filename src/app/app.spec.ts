import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { AuthService } from './services/auth.service';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

describe('App', () => {
  let authServiceSpy: any;

  beforeEach(async () => {
    authServiceSpy = {
      resumeSessionWatcher: vi.fn(),
      registerActivity: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should call resumeSessionWatcher on init', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(authServiceSpy.resumeSessionWatcher).toHaveBeenCalled();
  });
});
