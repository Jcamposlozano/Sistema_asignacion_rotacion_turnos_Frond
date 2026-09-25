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
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracionComponent],
      providers: [
        provideRouter([]),
        {
          provide: AsignacionApiService,
          useValue: {
            listarParametrias: () => of([]),
          },
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
});
