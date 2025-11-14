import { inject, Injectable, signal } from '@angular/core';
import { Alumno, alumnoSchema } from '../models/alumnoSchema';
import { alumnoDetalleSchema } from '../models/alumnoDetalleSchema';
import { HttpClient, httpResource } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs';
import { z } from 'zod';

export type FactorRiesgo = { id: string; nombre: string };

const materiaSchema = z.object({
  id: z.number(),
  Nombre: z.string(),
});

const grupoSchema = z.object({
  id: z.number(),
  Nombre: z.string(),
});

export type Materia = z.infer<typeof materiaSchema>;
export type Grupo = z.infer<typeof grupoSchema>;

@Injectable({
  providedIn: 'root'
})
export class AlumnosService {
  private readonly apiUrl = environment.apiUrl
  private readonly http = inject(HttpClient)

  readonly materiaSeleccionada = signal<Materia | null>(null);
  readonly grupoSeleccionado = signal<Grupo | null>(null);

  readonly materias = httpResource(
    () => `${this.apiUrl}/alumnos/materias`,
    {
      parse: data => materiaSchema.array().parse(data),
      defaultValue: [],
    }
  );

  readonly grupos = httpResource(
    () => `${this.apiUrl}/alumnos/grupos`,
    {
      parse: data => grupoSchema.array().parse(data),
      defaultValue: [],
    }
  );

  readonly alumnos = httpResource(
    () => {
      const materia = this.materiaSeleccionada();
      const grupo = this.grupoSeleccionado();
      
      if (!materia || !grupo) {
        return undefined; // No cargar alumnos si no hay materia o grupo seleccionados
      }

      const params = new URLSearchParams({
        id_materia: materia.id.toString(),
        id_grupo: grupo.id.toString(),
      });

      return `${this.apiUrl}/alumnos?${params.toString()}`;
    },
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

  // Factores de riesgo (endpoints reales)
  obtenerFactoresDeRiesgo(): Observable<FactorRiesgo[]> {
    return this.http.get<FactorRiesgo[]>(`${this.apiUrl}/alumnos/factores-riesgo`);
  }

  actualizarFactoresRiesgoAlumno(noControl: string, factoresIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/alumnos/factor-alumno`, {
      no_control: noControl,
      id_factor: factoresIds,
    });
  }
}
