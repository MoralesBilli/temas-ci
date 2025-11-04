import { Component, computed, input, inject, signal } from '@angular/core';
import { AlumnoDetalle as AlumnoDetalleModel } from '../../models/alumnoDetalleSchema';
import { getProfilePhoto } from '../../../core/utils/photoUtils';
import { AlumnosService, FactorRiesgo } from '../../services/alumnos-service';
import { ToastService } from '../../../core/services/toast-service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-alumno-detalle',
  imports: [],
  templateUrl: './alumno-detalle.html',
  styleUrl: './alumno-detalle.css'
})
export class AlumnoDetalle {
  readonly detalle = input<AlumnoDetalleModel | null>(null);

  protected readonly inscripciones = computed(() => this.detalle()?.inscripciones ?? []);

  protected readonly promedioCalificaciones = computed(() => {
    const detalle = this.detalle();
    if (!detalle) return null;
    const calificaciones = detalle.inscripciones.flatMap(inscripcion => inscripcion.calificaciones);
    if (calificaciones.length === 0) return null;
    const total = calificaciones.reduce((sum, item) => sum + item.calificacion, 0);
    return Math.round((total / calificaciones.length) * 10) / 10;
  });

  protected readonly promedioCalificacionesTexto = computed(() => {
    const promedio = this.promedioCalificaciones();
    return promedio === null ? 'N/A' : promedio.toFixed(1);
  });

  protected readonly totalFaltas = computed(() => {
    const detalle = this.detalle();
    if (!detalle) return 0;
    return detalle.inscripciones.reduce((sum, inscripcion) => {
      return sum + inscripcion.calificaciones.reduce((faltas, unidad) => faltas + unidad.faltas, 0);
    }, 0);
  });

  protected readonly photoUrl = computed(() => {
    const detalle = this.detalle();
    if (!detalle) return '';
    return getProfilePhoto(detalle.numeroDeControl);
  })

  private readonly alumnosService = inject(AlumnosService);
  private readonly toast = inject(ToastService);

  protected readonly editMode = signal(false);
  protected readonly factoresCatalogo = signal<FactorRiesgo[]>([]);
  protected readonly seleccionados = signal<Set<string>>(new Set());

  protected startEdit() {
    const det = this.detalle();
    if (!det) return;
    this.editMode.set(true);
    if (this.factoresCatalogo().length === 0) {
      this.alumnosService.obtenerFactoresDeRiesgo().subscribe((f) => {
        this.factoresCatalogo.set(f);
        this.initSeleccionados();
      });
    } else {
      this.initSeleccionados();
    }
  }

  protected cancelEdit() {
    this.editMode.set(false);
  }

  private initSeleccionados() {
    const det = this.detalle();
    if (!det) return;
    const set = new Set<string>();
    const catalogo = this.factoresCatalogo();
    for (const nombre of det.factoresDeRiesgo) {
      const match = catalogo.find(f => f.nombre === nombre);
      if (match) set.add(match.id);
    }
    this.seleccionados.set(set);
  }

  protected toggleFactor(factorId: string, checked: boolean) {
    this.seleccionados.update(prev => {
      const next = new Set(prev);
      if (checked) next.add(factorId); else next.delete(factorId);
      return next;
    });
  }

  protected saveFactores() {
    const det = this.detalle();
    if (!det) return;
    const catalogo = this.factoresCatalogo();
    // IDs actuales a partir de nombres del detalle
    const actuales = new Set(
      det.factoresDeRiesgo
        .map(nombre => catalogo.find(f => f.nombre === nombre)?.id)
        .filter((id): id is string => !!id)
    );
    const seleccion = this.seleccionados();

    const agregar: string[] = [];
    const quitar: string[] = [];
    for (const id of seleccion) if (!actuales.has(id)) agregar.push(id);
    for (const id of actuales) if (!seleccion.has(id)) quitar.push(id);

    const alumnoId = det.numeroDeControl;
    const ops = [
      ...agregar.map(id => this.alumnosService.agregarFactorRiesgoAlumno(alumnoId, id)),
      ...quitar.map(id => this.alumnosService.quitarFactorRiesgoAlumno(alumnoId, id)),
    ];

    if (ops.length === 0) {
      this.toast.show('Sin cambios', 'info');
      this.editMode.set(false);
      return;
    }

    forkJoin(ops).subscribe({
      next: () => {
        this.toast.show('Factores actualizados', 'success');
        this.alumnosService.alumnoSeleccionadoDetalle.reload();
        this.editMode.set(false);
      },
      error: () => {
        this.toast.show('No se pudieron actualizar los factores', 'error');
      }
    });
  }
}
