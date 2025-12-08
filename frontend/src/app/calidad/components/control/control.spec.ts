import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Control } from './control';

describe('Control', () => {
  let component: any;
  let fixture: ComponentFixture<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Control,                 
        HttpClientTestingModule  
      ],
    })
    .compileComponents();


    fixture = TestBed.createComponent(Control<any>);
    component = fixture.componentInstance;
    component.data = () => [1, 2, 3, 4, 5];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
