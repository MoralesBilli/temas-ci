import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AlumnoDetalle } from './alumno-detalle';

describe('AlumnoDetalle', () => {
  let component: AlumnoDetalle;
  let fixture: ComponentFixture<AlumnoDetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlumnoDetalle,HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlumnoDetalle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
