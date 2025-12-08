import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Dispersion } from './dispersion';

describe('Dispersion', () => {
  let component: any;
  let fixture: ComponentFixture<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dispersion,
         HttpClientTestingModule  
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dispersion<any>);
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
