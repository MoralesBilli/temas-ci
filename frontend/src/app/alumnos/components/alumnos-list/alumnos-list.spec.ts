import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AlumnosList } from './alumnos-list';
import { provideHttpClient } from '@angular/common/http'; 

describe('AlumnosList', () => {
  let component: AlumnosList;
  let fixture: ComponentFixture<AlumnosList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlumnosList,HttpClientTestingModule],
      providers: [
        provideHttpClient()   // 👈 registrar HttpClient
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlumnosList);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('alumnos', [
      {
        id: 1,
        nombre: 'Juan',
        numeroDeControl: 'A001',
        factoresDeRiesgo: ['inasistencias']
      },
      {
        id: 2,
        nombre: 'María',
        numeroDeControl: 'A002',
        factoresDeRiesgo: ['bajo rendimiento', 'inasistencias']
      }
    ]);

    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should order alumnos by factoresDeRiesgo length', () => {
    const ordenados = (component as any).alumnosOrdenados();
    expect(ordenados[0].nombre).toBe('María'); // tiene 2 factores
    expect(ordenados[1].nombre).toBe('Juan');  // tiene 1 factor
  });

  it('should emit alumnoSeleccionadoChange', () => {
    spyOn(component.alumnoSeleccionadoChange, 'emit');
    const alumno = { id: 3, nombre: 'Pedro', numeroDeControl: 'A003', factoresDeRiesgo: [] };
    (component as any).handleAlumnoSeleccionadoChange(alumno);
    expect(component.alumnoSeleccionadoChange.emit).toHaveBeenCalledWith(alumno);
  });

});
