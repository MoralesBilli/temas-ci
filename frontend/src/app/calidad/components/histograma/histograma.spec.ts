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

    fixture.componentRef.setInput('data', [1, 2, 3, 4, 5]);
    fixture.componentRef.setInput('getX', (item: number) => item);      
    fixture.componentRef.setInput('getY', (item: number) => item * 2);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
