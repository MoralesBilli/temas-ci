import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Control } from './control';

describe('Control', () => {
  let component: any;
  let fixture: ComponentFixture<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Control]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Control<any>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
