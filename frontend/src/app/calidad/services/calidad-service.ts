import { Injectable, resource } from '@angular/core';
import { sleep } from '../../core/utils/asyncUtils';
import { datoControl, datoDispersion, datoHistograma, datoPareto } from '../models/graficas';

@Injectable({
  providedIn: 'root'
})
export class CalidadService {
  readonly datosHistograma = resource({
    async loader() {
      await sleep(500)
      const calificaciones = Array.from({ length: 50 }).fill(null).map(v => Math.floor(Math.random() * 101))

      return datoHistograma.array().parse(
        calificaciones.map(calificacion => ({
          calificacion,
          qty: Math.floor(Math.random() * 10)
        }))
      )
    },
    defaultValue: []
  })

  readonly datosPareto = resource({
    async loader() {
      await sleep(500)

      return datoPareto.array().parse(
        ['Academico', 'Economico', 'Contextual', 'Psicosocial', 'Institucional'].map(factor => ({
          factor,
          qty: Math.floor(Math.random() * 50)
        }))
      )
    },
    defaultValue: []
  })

  readonly datosDispersion = resource({
    async loader() {
      await sleep(500)

      return datoDispersion.array().parse(
        Array.from({ length: 50 }).map(() => ({
          calificacion: Math.floor(Math.random() * 101),
          faltas: Math.floor(Math.random() * 13)
        }))
      )
    },
    defaultValue: []
  })

  readonly datosControl = resource({
    async loader() {
      await sleep(500)

      return datoControl.array().parse(
        [
          { unidad: 1, calificacionPromedio: Math.floor(Math.random() * 101) },
          { unidad: 2, calificacionPromedio: Math.floor(Math.random() * 101) },
          { unidad: 3, calificacionPromedio: Math.floor(Math.random() * 101) },
          { unidad: 4, calificacionPromedio: Math.floor(Math.random() * 101) },
          { unidad: 5, calificacionPromedio: Math.floor(Math.random() * 101) },
          { unidad: 6, calificacionPromedio: Math.floor(Math.random() * 101) },
        ]
      )
    },
    defaultValue: []
  })
}
