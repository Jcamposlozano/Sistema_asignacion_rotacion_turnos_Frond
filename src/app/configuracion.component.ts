import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import {
  AnalisisAsignacion,
  AsignacionApiService,
  AsignacionResultado,
  DiagnosticoAsignacion,
  EjecucionGuardada,
  InstitucionPayload,
  MatrizAsignacionPayload,
  OptimizacionCuposOut,
  OptimizacionParametriaOut,
  ParametriaPayload,
  ParametriaResumen,
} from './asignacion-api.service';

type Tab = 'parametria' | 'estudiantes' | 'reglas' | 'resultados' | 'analisis';
type AgentStatus = 'idle' | 'working' | 'done' | 'warning';

@Component({
  selector: 'app-configuracion',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.scss',
})
export class ConfiguracionComponent implements OnInit {
  private readonly api = inject(AsignacionApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  readonly activeTab = signal<Tab>('parametria');
  readonly selectedParametriaId = signal<number | null>(null);
  readonly parametrias = signal<ParametriaResumen[]>([]);
  readonly ejecucionesGuardadas = signal<EjecucionGuardada[]>([]);
  readonly resultados = signal<AsignacionResultado[]>([]);
  readonly analisis = signal<AnalisisAsignacion | null>(null);
  readonly diagnostico = signal<DiagnosticoAsignacion | null>(null);
  readonly resultFilter = signal('');
  readonly pendingOnly = signal(false);
  readonly lastExecutionId = signal<number | null>(null);
  readonly loading = signal(false);
  readonly notice = signal('');
  readonly error = signal('');
  readonly agentStatus = signal<AgentStatus>('idle');
  readonly agentSteps = signal<string[]>([
    'Carga o crea una parametría para iniciar la revisión asistida.',
  ]);
  readonly optimizationResult = signal<OptimizacionCuposOut | OptimizacionParametriaOut | null>(null);
  readonly optimizationVisible = signal(true);

  readonly form = signal<ParametriaPayload>(this.createDefaultPayload());
  readonly estudiantesPorId = computed(() => {
    const map = new Map<string, string>();
    for (const estudiante of this.form().estudiantes) {
      map.set(estudiante.id, estudiante.nombre ?? '');
    }
    return map;
  });
  readonly resultadosFiltrados = computed(() => {
    const filter = this.normalize(this.resultFilter());
    let rows = this.resultados();

    if (this.pendingOnly()) {
      const studentsWithPending = new Set(
        rows.filter((row) => row.pendiente).map((row) => row.estudiante_id),
      );
      rows = rows.filter((row) => studentsWithPending.has(row.estudiante_id));
    }

    if (!filter) {
      return rows;
    }

    const estudiantes = this.estudiantesPorId();
    return rows.filter((row) => {
      const nombre = estudiantes.get(row.estudiante_id) ?? '';
      return this.normalize(row.estudiante_id).includes(filter) || this.normalize(nombre).includes(filter);
    });
  });
  readonly resultadoPorEstudiante = computed(() => {
    const groups = new Map<string, AsignacionResultado[]>();
    for (const row of this.resultadosFiltrados()) {
      const rows = groups.get(row.estudiante_id) ?? [];
      rows.push(row);
      groups.set(row.estudiante_id, rows);
    }
    return Array.from(groups.entries()).map(([estudiante, rows]) => ({
      estudiante,
      rows: rows.sort((a, b) => a.periodo - b.periodo),
    }));
  });
  readonly pendientes = computed(() => this.resultados().filter((item) => item.pendiente).length);
  readonly agentStatusLabel = computed(() => {
    const labels: Record<AgentStatus, string> = {
      idle: 'En espera',
      working: 'Procesando',
      done: 'Listo',
      warning: 'Revisar',
    };
    return labels[this.agentStatus()];
  });
  readonly agentSummary = computed(() => {
    const diagnostic = this.diagnostico();
    const analysis = this.analisis();
    const results = this.resultados();
    const pending = this.pendientes();

    if (this.agentStatus() === 'working') {
      return 'Estoy validando la información y preparando la mejor respuesta disponible.';
    }

    if (!results.length) {
      return 'Aún no hay una ejecución cargada. Guarda y ejecuta la parametría, o consulta resultados ya guardados.';
    }

    if (diagnostic) {
      return diagnostic.resumen_ejecutivo;
    }

    const totalStudents = new Set(results.map((row) => row.estudiante_id)).size;
    const totalAssignments = results.length;
    const execution = this.lastExecutionId() ? `Ejecución ${this.lastExecutionId()}` : 'Ejecución cargada';
    const analysisState = analysis ? 'con análisis disponible' : 'sin análisis detallado';
    return `${execution}: ${totalStudents} estudiantes, ${totalAssignments} registros y ${pending} pendientes, ${analysisState}.`;
  });
  readonly agentRecommendations = computed(() => {
    const diagnostic = this.diagnostico();
    if (diagnostic?.recomendaciones?.length) {
      return diagnostic.recomendaciones.map((item) => item.detalle).slice(0, 4);
    }

    const recommendations: string[] = [];
    const pending = this.pendientes();
    const analysis = this.analisis();
    const form = this.form();

    if (!this.resultados().length) {
      recommendations.push('Guarda la parametría y ejecuta el algoritmo para generar una primera lectura.');
      recommendations.push('Si ya ejecutaste antes, usa Ver resultados para consultar la última ejecución guardada sin recalcular.');
      return recommendations;
    }

    if (pending > 0) {
      recommendations.push(`Revisar ${pending} asignaciones pendientes y validar cupos por especialidad.`);
      recommendations.push('Activar el filtro de pendientes para ubicar rápido los estudiantes afectados.');
    } else {
      recommendations.push('La ejecución no tiene pendientes. Puedes descargar resultados y análisis para revisión académica.');
    }

    if (analysis?.restricciones?.length) {
      recommendations.push('Validar el bloque de restricciones para confirmar que las preferencias críticas quedaron cubiertas.');
    }

    if (form.asignacion.estudiantes_aleatorio || form.asignacion.instituciones_aleatorio) {
      recommendations.push('Comparar una nueva ejecución solo si necesitas explorar otra distribución posible.');
    }

    return recommendations.slice(0, 4);
  });
  readonly agentRisks = computed(() => this.diagnostico()?.riesgos.slice(0, 3) ?? []);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadParametria(Number(id));
      } else {
        this.newParametria();
      }
    });
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  loadParametrias(updateLoading = true): void {
    if (updateLoading) {
      this.loading.set(true);
    }
    this.api.listarParametrias().subscribe({
      next: (items) => {
        this.parametrias.set(items);
        if (updateLoading) {
          this.loading.set(false);
        }
      },
      error: () => this.fail('No fue posible consultar las parametrías. Revisa que el backend esté activo.'),
    });
  }

  loadParametria(id: number): void {
    this.loading.set(true);
    this.api.obtenerParametria(id).subscribe({
      next: (payload) => {
        this.selectedParametriaId.set(payload.id);
        this.form.set({
          nombre: payload.nombre,
          instituciones: payload.instituciones ?? [],
          restricciones: payload.restricciones ?? [],
          asignacion: payload.asignacion,
          distribucion_periodos: payload.distribucion_periodos ?? [],
          combinaciones: payload.combinaciones ?? [],
          estudiantes: payload.estudiantes ?? [],
        });
        this.resultados.set([]);
        this.analisis.set(null);
        this.diagnostico.set(null);
        this.optimizationResult.set(null);
        this.lastExecutionId.set(null);
        this.loadEjecucionesGuardadas(payload.id);
        this.loading.set(false);
        this.setAgent(
          'idle',
          `Parametría ${payload.id} cargada. Puedo ejecutar una nueva asignación o consultar resultados guardados.`,
        );
        this.message(`Parametría ${payload.id} cargada para edición.`);
      },
      error: () => this.fail('No fue posible cargar la parametría seleccionada.'),
    });
  }

  newParametria(): void {
    this.selectedParametriaId.set(null);
    this.form.set(this.createDefaultPayload());
    this.resultados.set([]);
    this.analisis.set(null);
    this.diagnostico.set(null);
    this.optimizationResult.set(null);
    this.ejecucionesGuardadas.set([]);
    this.lastExecutionId.set(null);
    this.setAgent('idle', 'Formulario nuevo listo. Completa la parametría antes de ejecutar el algoritmo.');
    this.message('Formulario listo para una parametría nueva.');
  }

  loadSample(): void {
    this.selectedParametriaId.set(null);
    this.form.set(this.createSamplePayload());
    this.resultados.set([]);
    this.analisis.set(null);
    this.diagnostico.set(null);
    this.optimizationResult.set(null);
    this.ejecucionesGuardadas.set([]);
    this.lastExecutionId.set(null);
    this.setAgent('idle', 'Datos de ejemplo cargados. Puedes guardarlos y ejecutar una simulación.');
    this.message('Datos de ejemplo cargados.');
  }

  importPlantillaParametria(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }

    this.loading.set(true);
    this.setAgent('working', 'Leyendo plantilla Excel de parametría.');
    this.api.importarPlantillaParametria(file).subscribe({
      next: (payload) => {
        this.form.set(payload);
        this.resultados.set([]);
        this.analisis.set(null);
        this.diagnostico.set(null);
        this.optimizationResult.set(null);
        this.ejecucionesGuardadas.set([]);
        this.lastExecutionId.set(null);
        this.loading.set(false);
        this.setAgent('done', 'Plantilla cargada. Revisa la parametría y guarda para persistirla.');
        this.message('Plantilla Excel cargada correctamente. Recuerda guardar la parametría.');
      },
      error: (err) => this.fail(this.errorMessage(err, 'No fue posible leer la plantilla Excel.')),
    });
  }

  save(): void {
    this.persistParametria(false);
  }

  saveAndExecute(): void {
    this.persistParametria(true);
  }

  private persistParametria(runAfterSave: boolean): void {
    const payload = this.preparePayload();
    const selectedId = this.selectedParametriaId();
    this.loading.set(true);
    this.setAgent(
      'working',
      runAfterSave
        ? 'Guardando parametría para ejecutar el agente de asignación.'
        : 'Guardando parametría sin recalcular resultados.',
    );
    const request = selectedId
      ? this.api.actualizarParametria(selectedId, payload)
      : this.api.crearParametria(payload);

    request.subscribe({
      next: (response) => {
        this.selectedParametriaId.set(response.id);
        if (!selectedId) {
          this.location.replaceState(`/parametrias/${response.id}`);
        }
        if (runAfterSave) {
          this.execute(response.id);
          return;
        }
        this.loading.set(false);
        this.setAgent('done', 'Parametría guardada. El siguiente paso sugerido es ejecutar o consultar resultados guardados.');
        this.message(`${response.mensaje}. Ahora presiona Ejecutar para generar resultados.`);
      },
      error: (err) => this.fail(this.errorMessage(err, 'No fue posible guardar la parametría.')),
    });
  }

  deleteSelected(): void {
    const selectedId = this.selectedParametriaId();
    if (!selectedId) {
      this.fail('Selecciona una parametría para eliminar.');
      return;
    }
    this.loading.set(true);
    this.api.eliminarParametria(selectedId).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/parametrias']);
      },
      error: () => this.fail('No fue posible eliminar la parametría.'),
    });
  }

  execute(parametriaId?: number): void {
    const selectedId = parametriaId ?? this.selectedParametriaId();
    if (!selectedId) {
      this.fail('Guarda o selecciona una parametría antes de ejecutar.');
      return;
    }
    this.loading.set(true);
    this.diagnostico.set(null);
    this.optimizationResult.set(null);
    this.setAgent('working', `Ejecutando parametría ${selectedId}.`);
    this.pushAgentStep('Validando restricciones, cupos, combinaciones y distribución de periodos.');
    this.pushAgentStep('Ejecutando hasta 20 intentos internos para conservar la opción con menos pendientes.');
    this.api.ejecutarParametria(selectedId).subscribe({
      next: (execution) => {
        this.pushAgentStep(
          `Mejor ejecución seleccionada: ${execution.total_asignaciones} asignaciones y ${execution.total_pendientes} pendientes.`,
        );
        this.loadExecutionResults(
          execution.ejecucion_id,
          `Ejecución ${execution.ejecucion_id}: ${execution.estado}. Pendientes: ${execution.total_pendientes}. ${execution.mensaje ?? ''}`.trim(),
        );
      },
      error: () => this.fail('No fue posible ejecutar la asignación.'),
    });
  }

  viewSavedResults(): void {
    const selectedId = this.selectedParametriaId();
    if (!selectedId) {
      this.fail('Selecciona una parametría para ver resultados guardados.');
      return;
    }
    this.loading.set(true);
    this.diagnostico.set(null);
    this.optimizationResult.set(null);
    this.setAgent('working', `Buscando la última ejecución guardada de la parametría ${selectedId}.`);
    this.api.obtenerUltimaEjecucion(selectedId).subscribe({
      next: (execution) => {
        this.pushAgentStep(
          `Ejecución guardada encontrada: ${execution.id}. Se cargarán resultados sin recalcular el algoritmo.`,
        );
        this.loadExecutionResults(
          execution.id,
          `Resultados guardados de la ejecución ${execution.id}. Pendientes: ${execution.total_pendientes}.`,
        );
      },
      error: () => this.fail('Esta parametría todavía no tiene resultados guardados.'),
    });
  }

  loadSavedExecution(ejecucionId: number): void {
    this.loading.set(true);
    this.diagnostico.set(null);
    this.optimizationResult.set(null);
    this.setAgent('working', `Cargando la malla guardada ${ejecucionId} sin recalcular algoritmo.`);
    this.loadExecutionResults(ejecucionId, `Malla guardada ${ejecucionId} cargada sin ejecutar el algoritmo.`);
  }

  private loadEjecucionesGuardadas(parametriaId: number): void {
    this.api.listarEjecuciones(parametriaId).subscribe({
      next: (items) => this.ejecucionesGuardadas.set(items),
      error: () => this.ejecucionesGuardadas.set([]),
    });
  }

  private loadExecutionResults(ejecucionId: number, message: string): void {
    this.api.obtenerResultados(ejecucionId).subscribe({
      next: (rows) => {
        this.resultados.set(rows);
        this.lastExecutionId.set(ejecucionId);
        const selectedId = this.selectedParametriaId();
        if (selectedId) {
          this.loadEjecucionesGuardadas(selectedId);
        }
        this.pushAgentStep(`Resultados cargados: ${rows.length} registros para revisar.`);
        this.api.obtenerAnalisis(ejecucionId).subscribe({
          next: (analysis) => {
            this.analisis.set(analysis);
            this.pushAgentStep('Análisis consolidado disponible para auditoría de cupos, bloques y restricciones.');
            this.loadDiagnostic(ejecucionId, message);
          },
          error: () => {
            this.pushAgentStep('Resultados cargados. El análisis detallado no respondió en este intento.');
            this.loadDiagnostic(ejecucionId, 'Se cargaron resultados, pero el análisis no pudo consultarse.');
          },
        });
      },
      error: () => this.fail('No fue posible consultar resultados guardados.'),
    });
  }

  private loadDiagnostic(ejecucionId: number, message: string): void {
    this.api.obtenerDiagnostico(ejecucionId).subscribe({
      next: (diagnostic) => {
        this.diagnostico.set(diagnostic);
        this.loading.set(false);
        this.activeTab.set('resultados');
        this.pushAgentStep(`Diagnóstico del agente generado con nivel ${diagnostic.nivel}.`);
        this.agentStatus.set(diagnostic.nivel === 'OK' ? 'done' : 'warning');
        this.message(message);
      },
      error: () => {
        this.diagnostico.set(null);
        this.loading.set(false);
        this.activeTab.set('resultados');
        this.agentStatus.set(this.pendientes() > 0 ? 'warning' : 'done');
        this.pushAgentStep('Diagnóstico no disponible. Se mantienen recomendaciones locales del panel.');
        this.message(message);
      },
    });
  }

  addInstitucion(): void {
    this.mutateForm((form) => {
      form.instituciones.push({ institucion: '', especialidad: '', cantidad: 0 });
    });
  }

  removeInstitucion(index: number): void {
    this.mutateForm((form) => form.instituciones.splice(index, 1));
  }

  clearInstituciones(): void {
    if (!confirm('¿Quieres limpiar todas las instituciones y cupos cargados?')) {
      return;
    }
    this.mutateForm((form) => {
      form.instituciones = [];
    });
    this.resultados.set([]);
    this.analisis.set(null);
    this.diagnostico.set(null);
    this.optimizationResult.set(null);
    this.message('Instituciones y cupos limpiados. Guarda la parametría para persistir el cambio.');
    this.setAgent('warning', 'Se limpiaron instituciones y cupos. Revisa la parametría antes de ejecutar.');
  }

  importInstitucionesCsv(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }

    this.loading.set(true);
    this.setAgent('working', 'Leyendo archivo de instituciones, especialidades y cupos.');
    this.api.importarInstitucionesArchivo(file).subscribe({
      next: (instituciones) => {
        this.mutateForm((form) => {
          const merged = new Map(
            form.instituciones.map((item) => [
              `${this.normalize(item.institucion)}|${this.normalize(item.especialidad)}`,
              item,
            ]),
          );
          for (const institucion of instituciones) {
            merged.set(
              `${this.normalize(institucion.institucion)}|${this.normalize(institucion.especialidad)}`,
              institucion,
            );
          }
          form.instituciones = Array.from(merged.values());
        });
        this.loading.set(false);
        this.message(`Se cargaron ${instituciones.length} registros de instituciones desde el archivo.`);
        this.setAgent('done', 'Instituciones y cupos cargados. Recuerda guardar la parametría.');
      },
      error: (err) => this.fail(this.errorMessage(err, 'No fue posible leer el archivo de instituciones.')),
    });
  }

  addRestriccion(): void {
    this.mutateForm((form) => {
      form.restricciones.push({ estudiante: '', institucion: '', especialidad: null });
    });
  }

  removeRestriccion(index: number): void {
    this.mutateForm((form) => form.restricciones.splice(index, 1));
  }

  addDistribucion(): void {
    this.mutateForm((form) => {
      form.distribucion_periodos.push({ especialidad: '', asignacion: 0 });
    });
  }

  removeDistribucion(index: number): void {
    this.mutateForm((form) => form.distribucion_periodos.splice(index, 1));
  }

  addCombinacion(): void {
    this.mutateForm((form) => {
      form.combinaciones.push({ especialidad_1: '', especialidad_2: '', bloque: 'X2' });
    });
  }

  removeCombinacion(index: number): void {
    this.mutateForm((form) => form.combinaciones.splice(index, 1));
  }

  addEstudiante(): void {
    this.mutateForm((form) => {
      form.estudiantes.push({ id: '', nombre: '', semestre: '' });
    });
  }

  removeEstudiante(index: number): void {
    this.mutateForm((form) => form.estudiantes.splice(index, 1));
  }

  clearEstudiantes(): void {
    if (!confirm('¿Quieres limpiar todos los estudiantes cargados?')) {
      return;
    }
    this.mutateForm((form) => {
      form.estudiantes = [];
      form.restricciones = [];
    });
    this.resultados.set([]);
    this.analisis.set(null);
    this.diagnostico.set(null);
    this.optimizationResult.set(null);
    this.message('Estudiantes limpiados. También se limpiaron restricciones asociadas.');
    this.setAgent('warning', 'Se limpiaron estudiantes y restricciones. Revisa la parametría antes de ejecutar.');
  }

  importEstudiantesCsv(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }

    this.loading.set(true);
    this.setAgent('working', 'Leyendo archivo de estudiantes.');
    this.api.importarEstudiantesArchivo(file).subscribe({
      next: (estudiantes) => {
        this.mutateForm((form) => {
          const merged = new Map(form.estudiantes.map((item) => [item.id, item]));
          for (const estudiante of estudiantes) {
            merged.set(estudiante.id, estudiante);
          }
          form.estudiantes = Array.from(merged.values());
        });
        this.loading.set(false);
        this.message(`Se cargaron ${estudiantes.length} estudiantes desde el archivo.`);
        this.setAgent('done', 'Lista de estudiantes cargada. Recuerda guardar la parametría para persistirlos.');
      },
      error: (err) => this.fail(this.errorMessage(err, 'No fue posible leer el archivo de estudiantes.')),
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  toggleOptimization(): void {
    this.optimizationVisible.update((visible) => !visible);
  }

  optimizeCupos(): void {
    const selectedId = this.selectedParametriaId();
    if (!selectedId) {
      this.fail('Selecciona una parametría antes de optimizar cupos.');
      return;
    }

    this.loading.set(true);
    this.optimizationResult.set(null);
    this.setAgent('working', 'Calculando cupos mínimos balanceados por especialidad.');
    this.api.optimizarCupos(selectedId).subscribe({
      next: (result) => {
        this.optimizationResult.set(result);
        this.loading.set(false);
        this.agentStatus.set('done');
        this.pushAgentStep(result.resumen);
        this.message('Optimización de cupos calculada.');
      },
      error: (err) => this.fail(this.errorMessage(err, 'No fue posible optimizar cupos.')),
    });
  }

  optimizeParametria(): void {
    const selectedId = this.selectedParametriaId();
    if (!selectedId) {
      this.fail('Selecciona una parametría antes de validar la optimización.');
      return;
    }

    this.loading.set(true);
    this.optimizationResult.set(null);
    this.setAgent('working', 'Validando parametría optimizada con una ejecución temporal.');
    this.api.optimizarParametria(selectedId).subscribe({
      next: (result) => {
        this.optimizationResult.set(result);
        this.loading.set(false);
        this.agentStatus.set(result.pendientes_estimados === 0 ? 'done' : 'warning');
        this.pushAgentStep(result.resumen);
        this.message('Optimización validada. La parametría oficial no fue modificada.');
      },
      error: (err) => this.fail(this.errorMessage(err, 'No fue posible validar la optimización.')),
    });
  }

  applyOptimization(): void {
    const optimization = this.optimizationResult();
    const selectedId = this.selectedParametriaId();
    if (!selectedId) {
      this.fail('Selecciona una parametría antes de aplicar la optimización.');
      return;
    }
    if (!optimization?.parametria_sugerida?.length) {
      this.fail('Primero genera o valida una optimización de cupos.');
      return;
    }

    const suggested = new Map(
      optimization.parametria_sugerida.map((item) => [
        `${this.normalize(item.institucion)}|${this.normalize(item.especialidad)}`,
        item.cupo_sugerido,
      ]),
    );

    this.mutateForm((form) => {
      for (const institucion of form.instituciones) {
        const key = `${this.normalize(institucion.institucion)}|${this.normalize(institucion.especialidad)}`;
        const cupo = suggested.get(key);
        if (cupo !== undefined) {
          institucion.cantidad = cupo;
        }
      }
    });

    this.setAgent(
      'working',
      'Aplicando cupos sugeridos sobre la parametría oficial y ejecutando asignación final.',
    );
    this.pushAgentStep('Los resultados guardados anteriores serán reemplazados por la nueva ejecución.');
    this.persistParametria(true);
  }

  capacityTrend(actual: number, suggested: number): 'up' | 'down' | 'same' {
    if (suggested > actual) {
      return 'up';
    }
    if (suggested < actual) {
      return 'down';
    }
    return 'same';
  }

  capacityTrendIcon(actual: number, suggested: number): string {
    const trend = this.capacityTrend(actual, suggested);
    if (trend === 'up') {
      return '↑';
    }
    if (trend === 'down') {
      return '↓';
    }
    return '=';
  }

  capacityTrendLabel(actual: number, suggested: number): string {
    const trend = this.capacityTrend(actual, suggested);
    if (trend === 'up') {
      return 'Aumentar cupos';
    }
    if (trend === 'down') {
      return 'Bajar cupos';
    }
    return 'Mantener cupos';
  }

  formatExecutionDate(value: string | null | undefined): string {
    if (!value) {
      return 'Sin fecha registrada';
    }
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  studentName(estudianteId: string): string {
    const fromForm = this.estudiantesPorId().get(estudianteId);
    if (fromForm) {
      return fromForm;
    }
    return this.resultados().find((row) => row.estudiante_id === estudianteId)?.estudiante_nombre ?? '';
  }

  downloadResultadosPlano(): void {
    if (!this.resultados().length) {
      this.fail('No hay resultados para descargar.');
      return;
    }
    const rowsByStudent = new Map<string, AsignacionResultado[]>();
    for (const row of this.resultadosFiltrados()) {
      const rows = rowsByStudent.get(row.estudiante_id) ?? [];
      rows.push(row);
      rowsByStudent.set(row.estudiante_id, rows);
    }
    const periodos = this.form().asignacion.numero_periodos;
    const headers = ['ID', 'NOMBRE'];
    for (let p = 1; p <= periodos; p += 1) {
      headers.push(`PERIODO ${p} (Especialidad)`, `ESCENARIO ${p} (Institución)`);
    }
    const matrix = [headers];
    for (const [studentId, rows] of rowsByStudent.entries()) {
      const byPeriod = new Map(rows.map((row) => [row.periodo, row]));
      const line = [studentId, this.studentName(studentId)];
      for (let p = 1; p <= periodos; p += 1) {
        const row = byPeriod.get(p);
        line.push(row?.especialidad ?? '', row?.institucion ?? '');
      }
      matrix.push(line);
    }
    this.downloadCsv(`resultados_asignacion_${this.selectedParametriaId() ?? 'actual'}.csv`, matrix);
  }

  importMatrizCsv(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    const selectedId = this.selectedParametriaId();
    if (!selectedId) {
      this.fail('Selecciona una parametría antes de cargar una matriz ajustada.');
      return;
    }
    if (!file) {
      return;
    }

    this.loading.set(true);
    this.setAgent('working', 'Cargando matriz ajustada como una nueva malla guardada.');
    this.api.cargarMatrizAjustadaArchivo(selectedId, file).subscribe({
      next: (execution) => {
        this.pushAgentStep(`Malla ajustada guardada como ejecución ${execution.id}.`);
        this.loadExecutionResults(
          execution.id,
          `Malla ajustada guardada y cargada como ejecución ${execution.id}.`,
        );
      },
      error: (err) => this.fail(this.errorMessage(err, 'No fue posible cargar la matriz ajustada.')),
    });
  }

  downloadAnalisisPlano(): void {
    const analysis = this.analisis();
    if (!analysis) {
      this.fail('No hay análisis para descargar.');
      return;
    }

    const rows: string[][] = [['ANALISIS DE ASIGNACION'], []];
    rows.push(...this.objectToRows(analysis.resumen), []);
    rows.push(['RESUMEN POR ESPECIALIDAD']);
    rows.push(...this.tableToRows(analysis.resumen_especialidad), []);
    rows.push(['ANALISIS DE BLOQUES CONSECUTIVOS']);
    rows.push(...this.tableToRows(analysis.bloques), []);
    rows.push(['ANALISIS DE RESTRICCIONES INSTITUCIONALES']);
    rows.push(...this.tableToRows(analysis.restricciones), []);
    rows.push(['DETALLE DE OCUPACION POR INSTITUCION Y PERIODO']);
    rows.push(...this.tableToRows(analysis.ocupacion), []);
    rows.push(['ASIGNACIONES PENDIENTES']);
    rows.push(...this.tableToRows(analysis.pendientes));

    this.downloadCsv(`analisis_asignacion_${this.selectedParametriaId() ?? 'actual'}.csv`, rows);
  }

  private mutateForm(mutator: (form: ParametriaPayload) => void): void {
    const next = structuredClone(this.form());
    mutator(next);
    this.form.set(next);
  }

  private preparePayload(): ParametriaPayload {
    const payload = structuredClone(this.form());
    payload.instituciones = payload.instituciones.filter((item) => item.institucion && item.especialidad);
    payload.restricciones = payload.restricciones.filter((item) => item.estudiante && item.institucion);
    payload.distribucion_periodos = payload.distribucion_periodos.filter((item) => item.especialidad);
    payload.combinaciones = payload.combinaciones.filter(
      (item) => item.especialidad_1 && item.especialidad_2,
    );
    payload.estudiantes = payload.estudiantes.filter((item) => item.id);
    return payload;
  }

  private message(text: string): void {
    this.notice.set(text);
    this.error.set('');
  }

  private fail(text: string): void {
    this.error.set(text);
    this.notice.set('');
    this.loading.set(false);
    this.agentStatus.set('warning');
    this.pushAgentStep(text);
  }

  private errorMessage(error: unknown, fallback: string): string {
    const detail = (error as { error?: { detail?: unknown } })?.error?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          const path = Array.isArray(item?.loc) ? item.loc.join('.') : '';
          const message = item?.msg ?? 'Error de validación';
          return path ? `${path}: ${message}` : String(message);
        })
        .join(' | ');
    }
    return fallback;
  }

  private setAgent(status: AgentStatus, firstStep: string): void {
    this.agentStatus.set(status);
    this.agentSteps.set([firstStep]);
  }

  private pushAgentStep(text: string): void {
    this.agentSteps.update((steps) => [...steps.slice(-5), text]);
  }

  private normalize(value: string | null | undefined): string {
    return (value ?? '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private downloadCsv(filename: string, rows: Array<Array<string | number>>): void {
    const content = rows.map((row) => row.map((cell) => this.escapeCsvCell(cell)).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private escapeCsvCell(value: string | number): string {
    const text = String(value ?? '');
    if (/[,\n"]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  }

  private parseCsv(content: string): string[][] {
    const delimiter = this.detectDelimiter(content);
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let quoted = false;
    const text = content.replace(/^\uFEFF/, '');

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const next = text[index + 1];
      if (char === '"' && quoted && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === delimiter && !quoted) {
        row.push(cell.trim());
        cell = '';
      } else if ((char === '\n' || char === '\r') && !quoted) {
        if (char === '\r' && next === '\n') {
          index += 1;
        }
        row.push(cell.trim());
        if (row.some((value) => value)) {
          rows.push(row);
        }
        row = [];
        cell = '';
      } else {
        cell += char;
      }
    }

    row.push(cell.trim());
    if (row.some((value) => value)) {
      rows.push(row);
    }
    return rows;
  }

  private detectDelimiter(content: string): string {
    const firstLine = content.split(/\r?\n/)[0] ?? '';
    const semicolons = (firstLine.match(/;/g) ?? []).length;
    const commas = (firstLine.match(/,/g) ?? []).length;
    return semicolons > commas ? ';' : ',';
  }

  private findColumn(header: string[], aliases: string[]): number {
    const index = header.findIndex((column) =>
      aliases.some((alias) => column === alias || column.includes(alias)),
    );
    return index >= 0 ? index : 0;
  }

  private matrixRowsToPayload(rows: string[][]): MatrizAsignacionPayload {
    const header = rows[0].map((cell) => this.normalize(cell));
    const idIndex = this.findColumn(header, ['id', 'documento', 'codigo']);
    const periodColumns = header
      .map((column, index) => {
        const match = column.match(/periodo\s*(\d+)/);
        return match ? { period: Number(match[1]), index } : null;
      })
      .filter((item): item is { period: number; index: number } => Boolean(item));

    if (!periodColumns.length) {
      throw new Error('La matriz no tiene columnas de periodos.');
    }

    const filas = rows.slice(1).flatMap((row) => {
      const estudianteId = row[idIndex]?.trim() ?? '';
      if (!estudianteId) {
        return [];
      }
      return periodColumns.map(({ period, index }) => ({
        estudiante_id: estudianteId,
        periodo: period,
        especialidad: row[index]?.trim() ?? '',
        institucion: row[this.findScenarioColumn(header, period, index)]?.trim() ?? '',
      }));
    });

    return {
      filas,
      mensaje: 'Malla cargada desde CSV ajustado por usuario.',
    };
  }

  private findScenarioColumn(header: string[], period: number, periodColumnIndex: number): number {
    const exact = header.findIndex(
      (column) => column.includes('escenario') && column.includes(String(period)),
    );
    return exact >= 0 ? exact : periodColumnIndex + 1;
  }

  private objectToRows(row: Record<string, string | number>): string[][] {
    return Object.entries(row).map(([key, value]) => [this.humanizeKey(key), this.formatValue(value)]);
  }

  private tableToRows(rows: Record<string, string | number>[]): string[][] {
    if (!rows.length) {
      return [];
    }
    const keys = Object.keys(rows[0]);
    return [
      keys.map((key) => this.humanizeKey(key)),
      ...rows.map((row) => keys.map((key) => this.formatValue(row[key]))),
    ];
  }

  private humanizeKey(key: string): string {
    return key.replace(/_/g, ' ').toUpperCase();
  }

  private formatValue(value: string | number): string {
    return typeof value === 'number' && value > 0 && value <= 1
      ? `${(value * 100).toFixed(1)}%`
      : String(value ?? '');
  }

  private createDefaultPayload(): ParametriaPayload {
    return {
      nombre: 'Nueva parametría',
      instituciones: [],
      restricciones: [],
      asignacion: {
        numero_periodos: 8,
        estudiantes_aleatorio: true,
        instituciones_aleatorio: true,
        asignacion: 'CONCENTRADA',
        institucion_residual: 'CLINICA UNIVERSIDAD DE LA SABANA',
      },
      distribucion_periodos: [],
      combinaciones: [],
      estudiantes: [],
    };
  }

  private createSamplePayload(): ParametriaPayload {
    return {
      nombre: 'Escenario Medicina 6',
      instituciones: this.sampleInstituciones(),
      restricciones: [
        {
          estudiante: '352043',
          institucion: 'CLINICA DE TENJO',
          especialidad: 'MEDICINA FAMILIAR',
        },
        { estudiante: '350248', institucion: 'FUNDACION CLINICA SHAIO', especialidad: null },
        { estudiante: '353107', institucion: 'HOSPITAL SIMULADO', especialidad: null },
      ],
      asignacion: {
        numero_periodos: 8,
        estudiantes_aleatorio: true,
        instituciones_aleatorio: true,
        asignacion: 'CONCENTRADA',
        institucion_residual: 'CLINICA UNIVERSIDAD DE LA SABANA',
      },
      distribucion_periodos: [
        { especialidad: 'MEDICINA FAMILIAR', asignacion: 1 },
        { especialidad: 'MEDICINA INTERNA', asignacion: 4 },
        { especialidad: 'NEUROLOGIA', asignacion: 1 },
        { especialidad: 'SALUD MENTAL', asignacion: 1 },
        { especialidad: 'MEDICINA INTERNA HOSPITAL SIMULADO', asignacion: 1 },
      ],
      combinaciones: [
        { especialidad_1: 'MEDICINA INTERNA', especialidad_2: 'MEDICINA INTERNA', bloque: 'X4' },
        {
          especialidad_1: 'MEDICINA INTERNA HOSPITAL SIMULADO',
          especialidad_2: 'SALUD MENTAL',
          bloque: 'X2',
        },
        { especialidad_1: 'MEDICINA FAMILIAR', especialidad_2: 'NEUROLOGIA', bloque: 'X2' },
      ],
      estudiantes: ['352043', '350248', '353107', '348862'].map((id) => ({
        id,
        nombre: `Estudiante_${id}`,
        semestre: '6',
      })),
    };
  }

  private sampleInstituciones(): InstitucionPayload[] {
    return [
      ['CLINICA DE TENJO', 'MEDICINA FAMILIAR', 5],
      ['CLINICA UNIVERSIDAD DE LA SABANA', 'MEDICINA FAMILIAR', 6],
      ['CLINICA UNIVERSIDAD DE LA SABANA', 'MEDICINA INTERNA', 12],
      ['CLINICA UNIVERSIDAD DE LA SABANA', 'NEUROLOGIA', 3],
      ['FUNDACION CLINICA SHAIO', 'MEDICINA INTERNA', 12],
      ['FUNDACION CLINICA SHAIO', 'NEUROLOGIA', 1],
      ['HOSPITAL DE TABIO', 'MEDICINA FAMILIAR', 5],
      ['HOSPITAL SIMULADO', 'SALUD MENTAL', 18],
      ['HOSPITAL UNIVERSITARIO LA SAMARITANA', 'MEDICINA INTERNA', 10],
      ['HOSPITAL UNIVERSITARIO LA SAMARITANA', 'NEUROLOGIA', 2],
      ['HOSPITAL SIMULADO', 'MEDICINA INTERNA HOSPITAL SIMULADO', 20],
    ].map(([institucion, especialidad, cantidad]) => ({
      institucion: String(institucion),
      especialidad: String(especialidad),
      cantidad: Number(cantidad),
    }));
  }
}
