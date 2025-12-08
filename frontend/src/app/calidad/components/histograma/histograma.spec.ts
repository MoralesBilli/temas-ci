import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Histograma } from './histograma';

describe('Histograma', () => {
  let component: any;
  let fixture: ComponentFixture<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Histograma]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Histograma<any>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
