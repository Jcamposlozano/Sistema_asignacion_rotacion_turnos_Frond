import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { App } from './app';
import { AsignacionApiService } from './asignacion-api.service';
import { ConfiguracionComponent } from './configuracion.component';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app shell', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});

describe('ConfiguracionComponent', () => {
  let apiMock: {
    listarParametrias: ReturnType<typeof vi.fn>;
    crearParametria: ReturnType<typeof vi.fn>;
    ejecutarParametria: ReturnType<typeof vi.fn>;
    obtenerResultados: ReturnType<typeof vi.fn>;
    obtenerAnalisis: ReturnType<typeof vi.fn>;
    obtenerDiagnostico: ReturnType<typeof vi.fn>;
    listarEjecuciones: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    apiMock = {
      listarParametrias: vi.fn(() => of([])),
      crearParametria: vi.fn(() => of({ id: 7, mensaje: 'Parametría cargada correctamente' })),
      ejecutarParametria: vi.fn(() =>
        of({
          ejecucion_id: 11,
          parametria_id: 7,
          estado: 'COMPLETADA',
          total_estudiantes: 1,
          total_asignaciones: 5,
          total_pendientes: 0,
          mensaje: 'ok',
        }),
      ),
      obtenerResultados: vi.fn(() => of([])),
      obtenerAnalisis: vi.fn(() =>
        of({
          resumen: {},
          resumen_especialidad: [],
          bloques: [],
          restricciones: [],
          ocupacion: [],
          pendientes: [],
        }),
      ),
      obtenerDiagnostico: vi.fn(() =>
        of({
          ejecucion_id: 11,
          parametria_id: 7,
          nivel: 'OK',
          confianza: 1,
          resumen_ejecutivo: 'ok',
          metricas: {},
          riesgos: [],
          causas_probables: [],
          recomendaciones: [],
          acciones_rapidas: [],
        }),
      ),
      listarEjecuciones: vi.fn(() => of([])),
    };

    await TestBed.configureTestingModule({
      imports: [ConfiguracionComponent],
      providers: [
        provideRouter([]),
        {
          provide: AsignacionApiService,
          useValue: apiMock,
        },
      ],
    }).compileComponents();
  });

  it('should create the configuration workspace', () => {
    const fixture = TestBed.createComponent(ConfiguracionComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render workspace title', async () => {
    const fixture = TestBed.createComponent(ConfiguracionComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Nueva parametría');
  });

  it('should execute after saving a new parametria', () => {
    const fixture = TestBed.createComponent(ConfiguracionComponent);
    const component = fixture.componentInstance;

    component.saveAndExecute();

    expect(apiMock.crearParametria).toHaveBeenCalled();
    expect(apiMock.ejecutarParametria).toHaveBeenCalledWith(7);
  });
});
