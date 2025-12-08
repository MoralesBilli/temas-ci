import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dispersion } from './dispersion';

describe('Dispersion', () => {
  let component: any;
  let fixture: ComponentFixture<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dispersion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dispersion<any>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
