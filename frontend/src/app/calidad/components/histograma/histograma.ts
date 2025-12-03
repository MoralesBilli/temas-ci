import { Component, computed, input, signal } from '@angular/core';
import { ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { toSortedAsc } from '../../../core/utils/arrayUtils';

const createHintId = () => `histograma-hint-${Math.random().toString(36).slice(2, 10)}`;

@Component({
  selector: 'app-histograma',
  imports: [BaseChartDirective],
  templateUrl: './histograma.html',
  styleUrl: './histograma.css',
})
export class Histograma<T> {
  readonly data = input.required<T[]>()
  readonly getX = input.required<(item: T) => number>()
  readonly getY = input.required<(item: T) => number>()

  protected readonly hintId = createHintId();


  protected readonly chartData = computed<ChartData<'bar'>>(() => {
    const dataOrdenada = toSortedAsc(this.data(), dato => this.getX()(dato))

    return {
      labels: dataOrdenada.map(dato => this.getX()(dato)),
      datasets: [
        { data: dataOrdenada.map(dato => this.getY()(dato)), label: 'Alumnos por Calificación', type: 'bar' },
      ]
    }
  })

  protected readonly chartHint = computed(() => {
    const data = this.data();
    if (!data.length) {
      return 'No hay datos para mostrar en el histograma.';
    }

    const dataOrdenada = toSortedAsc(data, dato => this.getX()(dato));
    const puntos = dataOrdenada.map(item => ({
      label: this.getX()(item),
      value: this.getY()(item)
    }));
    const total = puntos.reduce((acum, punto) => acum + punto.value, 0);
    const peak = puntos.reduce((current, punto) => (punto.value > current.value ? punto : current), puntos[0]);
    const minLabel = puntos[0]?.label;
    const maxLabel = puntos[puntos.length - 1]?.label;

    return `Histograma de ${puntos.length} barras. Calificaciones entre ${minLabel} y ${maxLabel}. ` +
      `${peak.label} es la calificación más frecuente con ${peak.value} alumnos de un total de ${total}.`;
  })
}
