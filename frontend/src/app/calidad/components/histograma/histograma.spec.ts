import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Histograma } from './histograma';

describe('Histograma', () => {
  let component: any;
  let fixture: ComponentFixture<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Histograma, HttpClientTestingModule  ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Histograma<any>);
    component = fixture.componentInstance;
    component.data = 'valor de prueba';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
