import { Component, inject } from '@angular/core';
import { LayoutService } from '../../core/services/layout-service';
import { AlumnosList } from '../components/alumnos-list/alumnos-list';
import { AlumnoDetalle } from '../components/alumno-detalle/alumno-detalle';
import { AlumnosService, Materia, Grupo } from '../services/alumnos-service';
import { Alumno } from '../models/alumnoSchema';
import { AlumnosFab } from '../components/alumnos-fab/alumnos-fab';

@Component({
  selector: 'app-alumnos-page',
  imports: [AlumnosList, AlumnoDetalle, AlumnosFab],
  templateUrl: './alumnos-page.html',
  styleUrl: './alumnos-page.css',
})
export class AlumnosPage {
  private readonly layoutService = inject(LayoutService);
  private readonly alumnosService = inject(AlumnosService);

  protected readonly alumnos = this.alumnosService.alumnos;
  protected readonly alumnoSeleccionado = this.alumnosService.alumnoSeleccionado;
  protected readonly alumnoDetalle = this.alumnosService.alumnoSeleccionadoDetalle;
  protected readonly materias = this.alumnosService.materias;
  protected readonly grupos = this.alumnosService.grupos;
  protected readonly materiaSeleccionada = this.alumnosService.materiaSeleccionada;
  protected readonly grupoSeleccionado = this.alumnosService.grupoSeleccionado;

  protected handleAlumnoSeleccionadoChange(alumno: Alumno) {
    this.alumnosService.alumnoSeleccionado.set(alumno);
  }

  protected handleMateriaChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const materiaId = parseInt(select.value);
    if (materiaId && !isNaN(materiaId)) {
      const materias = this.materias.value();
      if (materias) {
        const materia = materias.find(m => m.id === materiaId);
        this.alumnosService.materiaSeleccionada.set(materia || null);
        // Limpiar selección de alumno cuando cambia la materia
        this.alumnosService.alumnoSeleccionado.set(null);
      }
    } else {
      this.alumnosService.materiaSeleccionada.set(null);
    }
  }

  protected handleGrupoChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const grupoId = parseInt(select.value);
    if (grupoId && !isNaN(grupoId)) {
      const grupos = this.grupos.value();
      if (grupos) {
        const grupo = grupos.find(g => g.id === grupoId);
        this.alumnosService.grupoSeleccionado.set(grupo || null);
        // Limpiar selección de alumno cuando cambia el grupo
        this.alumnosService.alumnoSeleccionado.set(null);
      }
    } else {
      this.alumnosService.grupoSeleccionado.set(null);
    }
  }

  constructor() {
    this.layoutService.title.set('Alumnos');
  }
}
