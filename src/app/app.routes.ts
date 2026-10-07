import { Routes } from '@angular/router';

import { ConfiguracionComponent } from './configuracion.component';
import { DashboardComponent } from './dashboard.component';
import { ParametriasComponent } from './parametrias.component';
import { ShellComponent } from './shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'parametrias', component: ParametriasComponent },
      { path: 'parametrias/nueva', component: ConfiguracionComponent },
      { path: 'parametrias/:id', component: ConfiguracionComponent },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
