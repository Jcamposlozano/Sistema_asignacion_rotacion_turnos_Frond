import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  AsignacionApiService,
  DashboardResumenGerencial,
} from './asignacion-api.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(AsignacionApiService);

  readonly data = signal<DashboardResumenGerencial | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly hasData = computed(() => Boolean(this.data()?.alcance.ejecuciones));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.obtenerDashboardGerencial().subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No fue posible cargar el resumen gerencial.');
        this.loading.set(false);
      },
    });
  }

  percent(value: number | null | undefined): string {
    return `${((value ?? 0) * 100).toFixed(1)}%`;
  }

  number(value: number | null | undefined): string {
    return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(value ?? 0);
  }

  barWidth(value: number, max: number): string {
    if (!max) {
      return '0%';
    }
    return `${Math.max(4, (value / max) * 100)}%`;
  }

  trackByIndex(index: number): number {
    return index;
  }

  max(rows: unknown[], key: string): number {
    let maximum = 0;
    for (const row of rows) {
      const value = (row as Record<string, unknown>)[key] ?? 0;
      maximum = Math.max(maximum, Number(value));
    }
    return maximum;
  }
}
