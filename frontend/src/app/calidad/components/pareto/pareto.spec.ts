import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Pareto } from './pareto';
import { Chart, registerables } from 'chart.js';


describe('Pareto', () => {
  let component: any;
  let fixture: ComponentFixture<any>;
  
  beforeAll(() => {
    // Registrar todos los elementos de Chart.js antes de correr los tests
    Chart.register(...registerables);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pareto,  HttpClientTestingModule  ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pareto<any>);
    component = fixture.componentInstance;
    
    fixture.componentRef.setInput('data', [
      { factor: 'A', value: 5 },
      { factor: 'B', value: 3 },
      { factor: 'C', value: 2 }
    ]);
    fixture.componentRef.setInput('getX', (item: { factor: string; value: number }) => item.factor);
    fixture.componentRef.setInput('getY', (item: { factor: string; value: number }) => item.value);

    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
