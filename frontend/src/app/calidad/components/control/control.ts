import { Component, computed, input } from '@angular/core';
import { ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

const createHintId = () => `control-hint-${Math.random().toString(36).slice(2, 10)}`;

@Component({
  selector: 'app-control',
  imports: [BaseChartDirective],
  templateUrl: './control.html',
  styleUrl: './control.css',
})
export class Control<T> {
  readonly data = input.required<T[]>()
  readonly getX = input.required<(item: T) => number>()
  readonly getY = input.required<(item: T) => number>()

  private readonly centralLimit = 85;
  private readonly upperLimit = 95;
  private readonly lowerLimit = 75;
  protected readonly hintId = createHintId();

  protected readonly chartData = computed<ChartData<'line'>>(() => ({
    labels: this.data().map(item => this.getX()(item)),
    datasets: [
      {
        data: this.data().map(item => this.getY()(item)),
        label: 'Calificación x Unidad',
        type: 'line',
      },
      {
        data: Array.from({ length: this.data().length }).fill(this.centralLimit) as number[],
        label: 'Limite de Control Central',
        type: 'line',
        pointRadius: 0,
        borderDash: [6, 4]
      },
      {
        data: Array.from({ length: this.data().length }).fill(this.upperLimit) as number[],
        label: 'Limite de Control Superior',
        type: 'line',
        pointRadius: 0,
        borderDash: [6, 4]
      },
      {
        data: Array.from({ length: this.data().length }).fill(this.lowerLimit) as number[],
        label: 'Limite de Control Inferior',
        type: 'line',
        pointRadius: 0,
        borderDash: [6, 4]
      }
    ]
  }))

  protected readonly chartHint = computed(() => {
    const puntos = this.data();
    if (!puntos.length) {
      return 'No hay datos para mostrar en la gráfica de control.';
    }

    const valores = puntos.map(p => this.getY()(p));
    const min = Math.min(...valores);
    const max = Math.max(...valores);
    const avg = valores.reduce((acum, val) => acum + val, 0) / valores.length;

    return `Gráfica de control con ${puntos.length} unidades. La calificación promedio es ${avg.toFixed(1)}, ` +
      `con valores que van de ${min} a ${max}. Los límites usados son ${this.lowerLimit} (inferior), ` +
      `${this.centralLimit} (central) y ${this.upperLimit} (superior).`;
  })
}
