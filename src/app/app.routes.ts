import { Routes } from '@angular/router';

import { ConfiguracionComponent } from './configuracion.component';
import { DashboardComponent } from './dashboard.component';

export const routes: Routes = [
  { path: '', component: ConfiguracionComponent },
  { path: 'dashboard', component: DashboardComponent },
];
