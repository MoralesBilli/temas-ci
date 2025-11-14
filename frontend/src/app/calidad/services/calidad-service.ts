import { Injectable, inject, resource } from '@angular/core';
import { sleep } from '../../core/utils/asyncUtils';
import { datoControl, datoDispersion, datoHistograma, datoPareto } from '../models/graficas';
import { httpResource } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AlumnosService } from '../../alumnos/services/alumnos-service';
import { AuthService } from '../../core/services/auth-service';

@Injectable({
  providedIn: 'root'
})
export class CalidadService {
  private readonly apiUrl = environment.apiUrl
  private readonly alumnosService = inject(AlumnosService)
  private readonly authService = inject(AuthService)

  readonly datosHistograma = httpResource(
    () => {
      const url = new URL(`${this.apiUrl}/calidad/histograma`);
      const isAdmin = this.authService.isAdmin();
      
   
      if (!isAdmin) {
        const materia = this.alumnosService.materiaSeleccionada();
        if (materia) {
          url.searchParams.set('id_materia', materia.id.toString());
        }
      }
      
      return url.toString();
    },
    {
      parse: data => datoHistograma.array().parse(data),
      defaultValue: []
    }
  )

  readonly datosPareto = httpResource(
    () => `${this.apiUrl}/calidad/pareto`,
    {
      parse: data => datoPareto.array().parse(data),
      defaultValue: []
    }
  )

  readonly datosDispersion = httpResource(
    () => {
      const url = new URL(`${this.apiUrl}/calidad/dispersion`);
      const isAdmin = this.authService.isAdmin();
      
      if (!isAdmin) {
        const materia = this.alumnosService.materiaSeleccionada();
        if (materia) {
          url.searchParams.set('id_materia', materia.id.toString());
        }
      }
      
      return url.toString();
    },
    {
      parse: data => datoDispersion.array().parse(data),
      defaultValue: []
    }
  )

  readonly datosControl = httpResource(
    () => {
      const url = new URL(`${this.apiUrl}/calidad/control`);
      const isAdmin = this.authService.isAdmin();
      
      if (!isAdmin) {
        const materia = this.alumnosService.materiaSeleccionada();
        if (materia) {
          url.searchParams.set('id_materia', materia.id.toString());
        }
      }
      
      return url.toString();
    },
    {
      parse: data => datoControl.array().parse(data),
      defaultValue: []
    }
  )
}
