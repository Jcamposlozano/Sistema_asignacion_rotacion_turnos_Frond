import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export interface InstitucionPayload {
  institucion: string;
  especialidad: string;
  cantidad: number;
}

export interface RestriccionPayload {
  estudiante: string;
  institucion: string;
  especialidad?: string | null;
}

export interface DistribucionPayload {
  especialidad: string;
  asignacion: number;
}

export interface CombinacionPayload {
  especialidad_1: string;
  especialidad_2: string;
  bloque: 'X2' | 'X4';
}

export interface EstudiantePayload {
  id: string;
  nombre?: string | null;
  semestre?: string | null;
}

export interface ParametriaPayload {
  nombre: string;
  instituciones: InstitucionPayload[];
  restricciones: RestriccionPayload[];
  asignacion: {
    numero_periodos: number;
    estudiantes_aleatorio: boolean;
    instituciones_aleatorio: boolean;
    asignacion: 'BALANCEADA' | 'CONCENTRADA';
    institucion_residual: string;
  };
  distribucion_periodos: DistribucionPayload[];
  combinaciones: CombinacionPayload[];
  estudiantes: EstudiantePayload[];
}

export interface ParametriaResumen {
  id: number;
  nombre: string;
  numero_periodos: number;
  estrategia: string;
  institucion_residual: string;
}

export interface EjecucionResultado {
  ejecucion_id: number;
  parametria_id: number;
  estado: string;
  total_estudiantes: number;
  total_asignaciones: number;
  total_pendientes: number;
  mensaje?: string | null;
}

export interface EjecucionGuardada {
  id: number;
  parametria_id: number;
  estado: string;
  total_estudiantes: number;
  total_asignaciones: number;
  total_pendientes: number;
  mensaje?: string | null;
  created_at?: string | null;
}

export interface AsignacionResultado {
  id: number;
  ejecucion_id: number;
  estudiante_id: string;
  estudiante_nombre?: string | null;
  estudiante_semestre?: string | null;
  periodo: number;
  especialidad: string;
  institucion: string;
  pendiente: boolean;
}

export interface MatrizAsignacionRow {
  estudiante_id: string;
  periodo: number;
  especialidad: string;
  institucion: string;
}

export interface MatrizAsignacionPayload {
  filas: MatrizAsignacionRow[];
  mensaje?: string | null;
}

export interface AnalisisAsignacion {
  resumen: Record<string, string | number>;
  resumen_especialidad: Record<string, string | number>[];
  bloques: Record<string, string | number>[];
  restricciones: Record<string, string | number>[];
  ocupacion: Record<string, string | number>[];
  pendientes: Record<string, string | number>[];
}

export interface DiagnosticoMensaje {
  severidad: string;
  titulo: string;
  detalle: string;
  entidad: string;
}

export interface DiagnosticoAccion {
  id: string;
  label: string;
  target: TabTarget;
}

export interface DiagnosticoAsignacion {
  ejecucion_id: number;
  parametria_id: number;
  nivel: 'OK' | 'ADVERTENCIA' | 'CRITICO' | string;
  confianza: number;
  resumen_ejecutivo: string;
  metricas: Record<string, string | number>;
  riesgos: DiagnosticoMensaje[];
  causas_probables: DiagnosticoMensaje[];
  recomendaciones: DiagnosticoMensaje[];
  acciones_rapidas: DiagnosticoAccion[];
}

export type TabTarget = 'resultados' | 'analisis' | string;

export interface CupoSugerido {
  institucion: string;
  especialidad: string;
  cupo_actual: number;
  cupo_sugerido: number;
  demanda_estimada: number;
  uso_estimado: number;
  capacidad_actual: number;
  capacidad_sugerida: number;
  proveedor_unico: boolean;
  razon: string;
}

export interface OptimizacionCuposOut {
  parametria_id: number;
  fase: string;
  resultado: string;
  estudiantes: number;
  numero_periodos: number;
  cupos_totales_actuales: number;
  cupos_totales_sugeridos: number;
  reduccion_cupos: number;
  resumen: string;
  parametria_sugerida: CupoSugerido[];
  advertencias: string[];
}

export interface OptimizacionParametriaOut extends OptimizacionCuposOut {
  parametria_simulada_id: number;
  ejecucion_simulada_id: number;
  pendientes_estimados: number;
  diagnostico: DiagnosticoAsignacion;
}

export interface DashboardResumenGerencial {
  alcance: {
    criterio: string;
    parametrias: number;
    ejecuciones: number;
  };
  kpis: {
    estudiantes_unicos: number;
    rotaciones: number;
    escenarios: number;
    areas_rotacion: number;
    rotaciones_pendientes: number;
    rotaciones_promedio_por_estudiante: number;
    indice_diversificacion_institucional: number;
  };
  top_escenarios_por_carga: DashboardEscenarioCarga[];
  escenarios_subutilizados: DashboardEscenarioSubutilizado[];
  servicios_mayor_demanda: DashboardServicioDemanda[];
  semestres_presion_rotacion: DashboardSemestrePresion[];
  instituciones_dependencia_critica: DashboardDependenciaCritica[];
  rotaciones_pendientes_por_causa: DashboardPendienteCausa[];
  balance_publico_privado: DashboardBalance[];
  rotaciones_simulado_vs_real: {
    estado: string;
    mensaje: string;
    real: unknown[];
    simulado: unknown[];
  };
  capacidad_sugerida_vs_usada: DashboardCapacidad[];
}

export interface DashboardEscenarioCarga {
  institucion: string;
  rotaciones: number;
  estudiantes_unicos: number;
  participacion: number;
}

export interface DashboardEscenarioSubutilizado {
  institucion: string;
  capacidad_periodos: number;
  periodos_usados: number;
  rotaciones: number;
  ocupacion: number;
}

export interface DashboardServicioDemanda {
  servicio: string;
  rotaciones: number;
  estudiantes_unicos: number;
  periodos_programados: number;
}

export interface DashboardSemestrePresion {
  semestre: string;
  rotaciones: number;
  estudiantes_unicos: number;
  rotaciones_promedio_estudiante: number;
  pendientes: number;
}

export interface DashboardDependenciaCritica {
  institucion: string;
  rotaciones: number;
  participacion: number;
  riesgo: string;
}

export interface DashboardPendienteCausa {
  causa: string;
  rotaciones: number;
}

export interface DashboardBalance {
  tipo: string;
  rotaciones: number;
  participacion: number;
}

export interface DashboardCapacidad {
  parametria_id: number;
  institucion: string;
  servicio: string;
  capacidad_actual: number;
  capacidad_sugerida: number;
  periodos_usados: number;
  brecha_actual: number;
  brecha_sugerida: number;
}

@Injectable({ providedIn: 'root' })
export class AsignacionApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000';

  listarParametrias() {
    return this.http.get<ParametriaResumen[]>(`${this.baseUrl}/parametrias`);
  }

  obtenerParametria(id: number) {
    return this.http.get<ParametriaPayload & { id: number }>(`${this.baseUrl}/parametrias/${id}`);
  }

  crearParametria(payload: ParametriaPayload) {
    return this.http.post<{ id: number; mensaje: string }>(`${this.baseUrl}/parametrias`, payload);
  }

  actualizarParametria(id: number, payload: ParametriaPayload) {
    return this.http.put<{ id: number; mensaje: string }>(`${this.baseUrl}/parametrias/${id}`, payload);
  }

  eliminarParametria(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/parametrias/${id}`);
  }

  importarEstudiantesArchivo(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<EstudiantePayload[]>(
      `${this.baseUrl}/parametrias/importar-estudiantes`,
      formData,
    );
  }

  importarInstitucionesArchivo(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<InstitucionPayload[]>(
      `${this.baseUrl}/parametrias/importar-instituciones`,
      formData,
    );
  }

  importarPlantillaParametria(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ParametriaPayload>(
      `${this.baseUrl}/parametrias/importar-plantilla`,
      formData,
    );
  }

  ejecutarParametria(id: number) {
    return this.http.post<EjecucionResultado>(
      `${this.baseUrl}/asignaciones/parametrias/${id}/ejecutar`,
      {},
    );
  }

  obtenerUltimaEjecucion(parametriaId: number) {
    return this.http.get<EjecucionGuardada>(
      `${this.baseUrl}/asignaciones/parametrias/${parametriaId}/ultima`,
    );
  }

  listarEjecuciones(parametriaId: number) {
    return this.http.get<EjecucionGuardada[]>(
      `${this.baseUrl}/asignaciones/parametrias/${parametriaId}/ejecuciones`,
    );
  }

  cargarMatrizAjustada(parametriaId: number, payload: MatrizAsignacionPayload) {
    return this.http.post<EjecucionGuardada>(
      `${this.baseUrl}/asignaciones/parametrias/${parametriaId}/matriz`,
      payload,
    );
  }

  cargarMatrizAjustadaArchivo(parametriaId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<EjecucionGuardada>(
      `${this.baseUrl}/asignaciones/parametrias/${parametriaId}/matriz-archivo`,
      formData,
    );
  }

  obtenerResultados(ejecucionId: number) {
    return this.http.get<AsignacionResultado[]>(
      `${this.baseUrl}/asignaciones/ejecuciones/${ejecucionId}/resultados`,
    );
  }

  obtenerAnalisis(ejecucionId: number) {
    return this.http.get<AnalisisAsignacion>(
      `${this.baseUrl}/asignaciones/ejecuciones/${ejecucionId}/analisis`,
    );
  }

  obtenerDiagnostico(ejecucionId: number) {
    return this.http.get<DiagnosticoAsignacion>(
      `${this.baseUrl}/asignaciones/ejecuciones/${ejecucionId}/diagnostico`,
    );
  }

  optimizarCupos(parametriaId: number) {
    return this.http.post<OptimizacionCuposOut>(
      `${this.baseUrl}/asignaciones/parametrias/${parametriaId}/optimizar-cupos`,
      {},
    );
  }

  optimizarParametria(parametriaId: number) {
    return this.http.post<OptimizacionParametriaOut>(
      `${this.baseUrl}/asignaciones/parametrias/${parametriaId}/optimizar-parametria`,
      { max_intentos: 20 },
    );
  }

  obtenerDashboardGerencial() {
    return this.http.get<DashboardResumenGerencial>(`${this.baseUrl}/dashboard/resumen-gerencial`);
  }
}
