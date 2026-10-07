import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AsignacionApiService, ParametriaResumen } from './asignacion-api.service';

@Component({
  selector: 'app-parametrias',
  imports: [CommonModule, RouterLink],
  templateUrl: './parametrias.component.html',
  styleUrl: './parametrias.component.scss',
})
export class ParametriasComponent implements OnInit {
  private readonly api = inject(AsignacionApiService);

  readonly parametrias = signal<ParametriaResumen[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.listarParametrias().subscribe({
      next: (items) => {
        this.parametrias.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No fue posible consultar las parametrías.');
        this.loading.set(false);
      },
    });
  }

  trackById(_index: number, item: ParametriaResumen): number {
    return item.id;
  }
}
