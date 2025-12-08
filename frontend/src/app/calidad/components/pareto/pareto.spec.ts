import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pareto } from './pareto';

describe('Pareto', () => {
  let component: any;
  let fixture: ComponentFixture<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pareto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pareto<any>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
