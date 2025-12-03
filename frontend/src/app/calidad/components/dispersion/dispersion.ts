import { Component, computed, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';

const createHintId = () => `dispersion-hint-${Math.random().toString(36).slice(2, 10)}`;

@Component({
  selector: 'app-dispersion',
  imports: [BaseChartDirective],
  templateUrl: './dispersion.html',
  styleUrl: './dispersion.css',
})
export class Dispersion<T> {
  readonly data = input.required<T[]>()
  readonly getX = input.required<(item: T) => number>()
  readonly getY = input.required<(item: T) => number>()

  protected readonly hintId = createHintId();

  protected readonly chartData = computed(() => ({
    datasets: [
      {
        data: this.data().map(item => ({
          x: this.getX()(item),
          y: this.getY()(item)
        })),
        label: 'Faltas vs Calificación',
        type: 'scatter'
      }
    ]
  }))

  protected readonly chartHint = computed(() => {
    const puntos = this.data();
    if (!puntos.length) {
      return 'No hay datos para mostrar en la gráfica de dispersión.';
    }

    const faltas = puntos.map(p => this.getX()(p));
    const calificaciones = puntos.map(p => this.getY()(p));
    const minFaltas = Math.min(...faltas);
    const maxFaltas = Math.max(...faltas);
    const minCal = Math.min(...calificaciones);
    const maxCal = Math.max(...calificaciones);
    const avgFaltas = faltas.reduce((acum, val) => acum + val, 0) / faltas.length;
    const avgCal = calificaciones.reduce((acum, val) => acum + val, 0) / calificaciones.length;

    return `Diagrama con ${puntos.length} alumnos. Las faltas van de ${minFaltas} a ${maxFaltas} ` +
      `y las calificaciones entre ${minCal} y ${maxCal}. En promedio se registran ${avgFaltas.toFixed(1)} faltas ` +
      `para una calificación de ${avgCal.toFixed(1)}.`;
  })
}
