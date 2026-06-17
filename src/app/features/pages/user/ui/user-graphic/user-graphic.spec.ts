import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGraphic } from './user-graphic';

describe('UserGraphic', () => {
  let component: UserGraphic;
  let fixture: ComponentFixture<UserGraphic>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserGraphic],
    }).compileComponents();

    fixture = TestBed.createComponent(UserGraphic);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
