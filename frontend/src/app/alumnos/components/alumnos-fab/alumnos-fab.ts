import { Component, ElementRef, inject, input, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { ToastService } from '../../../core/services/toast-service';
import { AlumnosService } from '../../services/alumnos-service';
import { catchError, finalize, of, tap } from 'rxjs';
import { Alumno } from '../../models/alumnoSchema';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-alumnos-fab',
  imports: [],
  templateUrl: './alumnos-fab.html',
  styleUrl: './alumnos-fab.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlumnosFab {
  // Alumno seleccionado desde el padre; habilita exportación cuando existe
  public readonly alumnoSeleccionado = input<Alumno|null>(null);

  private fileImportarAlumnos = viewChild.required<ElementRef<HTMLInputElement>>('fileImportarAlumnos');
  private fileImportarCalificaciones = viewChild.required<ElementRef<HTMLInputElement>>('fileImportarCalificaciones');
  private fileImportarDocentes = viewChild.required<ElementRef<HTMLInputElement>>('fileImportarDocentes');

  private alumnosService = inject(AlumnosService);
  private toastService = inject(ToastService);

  protected handleExportarAlumnos() {
    // Seguridad defensiva: no exportar si no hay alumno seleccionado
    if (!this.alumnoSeleccionado()) {
      this.toastService.show('Selecciona un alumno para exportar', 'warning');
      return;
    }
    const alumno = this.alumnoSeleccionado()!;
    this.alumnosService.exportarReporteTutoria(alumno.numeroDeControl)
      .pipe(
        tap((blob) => {
          const file = new Blob([blob], { type: 'application/pdf' });
          saveAs(file, `reporte_tutoria_${alumno.numeroDeControl}.pdf`);
          this.toastService.show('Reporte descargado', 'success');
        }),
        catchError((err) => {
          const msg = err?.error?.error || 'No se pudo descargar el reporte';
          this.toastService.show(msg, 'error');
          return of(null);
        })
      )
      .subscribe();
  }

  protected handleImportarAlumnos() {
    this.fileImportarAlumnos().nativeElement.click()
  }

  protected handleAlumnosImportados(event: Event) {
    const files = this.fileImportarAlumnos().nativeElement.files;

    if (files && files.length > 0) {
      this.alumnosService.importarAlumnos(files[0]).pipe(
        tap(() => {
          this.toastService.show(`Alumnos importados desde ${files[0].name}`, 'success');
        }),
        catchError((err) => {
          this.toastService.show(err.error.error, 'error');
          return of(null)
        }),
        finalize(() => {
          this.fileImportarAlumnos().nativeElement.value = '';
          this.alumnosService.alumnos.reload()
        })

      )
      .subscribe()
    }
    else {
      this.toastService.show('No se seleccionó ningún archivo', 'warning');
    }
  }

  protected handleImportarCalificaciones() {
    this.fileImportarCalificaciones().nativeElement.click()
  }

  protected handleCalificacionesImportados(event: Event) {
    const files = this.fileImportarCalificaciones().nativeElement.files;

    if (files && files.length > 0) {
      this.alumnosService.importarCalificaciones(files[0]).pipe(
        tap(() => {
          this.toastService.show(`Calificaciones importadas desde ${files[0].name}`, 'success');
        }),
        catchError((err) => {
          this.toastService.show(err.error.error, 'error');
          return of(null);
        }),
        finalize(() => {
          this.fileImportarCalificaciones().nativeElement.value = '';
          this.alumnosService.alumnoSeleccionadoDetalle.reload()
        })
      )
      .subscribe()
    }
    else {
      this.toastService.show('No se seleccionó ningún archivo', 'warning');
    }
  }

  protected handleImportarDocentes() {
    this.fileImportarDocentes().nativeElement.click();
  }

  protected handleDocentesImportados(event: Event) {
    const files = this.fileImportarDocentes().nativeElement.files;
    if (files && files.length > 0) {
      this.alumnosService.importarDocentes(files[0]).pipe(
        tap(() => {
          this.toastService.show(`Docentes importados desde ${files[0].name}`, 'success');
        }),
        catchError((err) => {
          this.toastService.show(err?.error?.error || 'Error al importar docentes', 'error');
          return of(null);
        }),
        finalize(() => {
          this.fileImportarDocentes().nativeElement.value = '';
          // Si hay algún recurso relacionado con docentes para recargar, agregar aquí
        })
      ).subscribe();
    } else {
      this.toastService.show('No se seleccionó ningún archivo', 'warning');
    }
  }
}
