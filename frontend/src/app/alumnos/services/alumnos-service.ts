import { inject, Injectable, signal } from '@angular/core';
import { Alumno, alumnoSchema } from '../models/alumnoSchema';
import { alumnoDetalleSchema } from '../models/alumnoDetalleSchema';
import { HttpClient, httpResource } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs';

export type FactorRiesgo = { id: string; nombre: string };

@Injectable({
  providedIn: 'root'
})
export class AlumnosService {
  private readonly apiUrl = environment.apiUrl
  private readonly http = inject(HttpClient)

  readonly alumnos = httpResource(
    () => `${this.apiUrl}/alumnos`,
    {
      parse: data => alumnoSchema.array().parse(data),
    }
  )

  readonly alumnoSeleccionado = signal<Alumno|null>(null);
  readonly alumnoSeleccionadoDetalle = httpResource(
    () => {
      const numeroDeControl = this.alumnoSeleccionado()?.numeroDeControl;
      if (!numeroDeControl) return

      return `${this.apiUrl}/alumno_detalle/${numeroDeControl}`
    },
    {
      parse: data => alumnoDetalleSchema.parse(data),
    }
  )

  importarAlumnos(archivo: File) {
    const formData = new FormData();
    formData.append('archivo', archivo, archivo.name);

    return this.http.post(
      `${this.apiUrl}/importar/grupos`,
      formData
    )
  }

  importarCalificaciones(archivo: File) {
    const formData = new FormData();
    formData.append('archivo', archivo, archivo.name);

    return this.http.post(
      `${this.apiUrl}/importar/calificaciones`,
      formData
    )
  }

  importarDocentes(archivo: File) {
    const formData = new FormData();
    formData.append('archivo', archivo, archivo.name);

    // Asunción: endpoint para importar docentes
    return this.http.post(
      `${this.apiUrl}/importar/docentes`,
      formData
    )
  }

  exportarReporteTutoria(noControl: string) {
    const url = `${this.apiUrl}/exportar/reporte_tutoria/${encodeURIComponent(noControl)}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  // Mocks de factores de riesgo y edición de factores en un alumno
  obtenerFactoresDeRiesgo(): Observable<FactorRiesgo[]> {
    // TODO: Reemplazar por GET `${this.apiUrl}/factores-riesgo`
    return of([
      { id: 'asistencia', nombre: 'Asistencia' },
      { id: 'bajo-promedio', nombre: 'Bajo promedio' },
      { id: 'falta-material', nombre: 'Falta de material' },
      { id: 'problemas-familiares', nombre: 'Problemas familiares' },
      { id: 'situacion-economica', nombre: 'Situación económica' },
    ]);
  }

  agregarFactorRiesgoAlumno(alumnoId: string, factorId: string): Observable<{ ok: true }> {
    // TODO: Reemplazar por POST `${this.apiUrl}/alumnos/${alumnoId}/factores/${factorId}`
    return of({ ok: true });
  }

  quitarFactorRiesgoAlumno(alumnoId: string, factorId: string): Observable<{ ok: true }> {
    // TODO: Reemplazar por DELETE `${this.apiUrl}/alumnos/${alumnoId}/factores/${factorId}`
    return of({ ok: true });
  }
}
