# TurnosFMedicina

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.



## Ejemplo Endpoint


```bash
{
  "nombre": "Escenario inicial",
    "instituciones": [
    {"institucion": "CLINICA DE TENJO", "especialidad": "MEDICINA FAMILIAR", "cantidad": 5},
    {"institucion": "CLINICA UNIVERSIDAD DE LA SABANA", "especialidad": "MEDICINA FAMILIAR", "cantidad": 4},
    {"institucion": "CLINICA UNIVERSIDAD DE LA SABANA", "especialidad": "MEDICINA INTERNA", "cantidad": 10},
    {"institucion": "CLINICA UNIVERSIDAD DE LA SABANA", "especialidad": "NEUROLOGIA", "cantidad": 3},
    {"institucion": "FUNDACION CLINICA SHAIO", "especialidad": "MEDICINA INTERNA", "cantidad": 12},
    {"institucion": "FUNDACION CLINICA SHAIO", "especialidad": "NEUROLOGIA", "cantidad": 1},
    {"institucion": "HOSPITAL DE TABIO", "especialidad": "MEDICINA FAMILIAR", "cantidad": 5},
    {"institucion": "HOSPITAL SIMULADO", "especialidad": "SALUD MENTAL", "cantidad": 14},
    {"institucion": "HOSPITAL UNIVERSITARIO LA SAMARITANA", "especialidad": "MEDICINA INTERNA", "cantidad": 10},
    {"institucion": "HOSPITAL UNIVERSITARIO LA SAMARITANA", "especialidad": "NEUROLOGIA", "cantidad": 2},
    {"institucion": "HOSPITAL UNIVERSITARIO LA SAMARITANA REGIONAL", "especialidad": "MEDICINA INTERNA", "cantidad": 6},
    {"institucion": "HOSPITAL UNIVERSITARIO LA SAMARITANA UNIDAD FUNCIONAL", "especialidad": "MEDICINA INTERNA", "cantidad": 4},
    {"institucion": "SUBRED DE SERVICIOS DE SALUD CENTRO ORIENTE (SANTA CLARA)", "especialidad": "MEDICINA INTERNA", "cantidad": 6},
    {"institucion": "SUBRED DE SERVICIOS DE SALUD NORTE (HOSPITAL SIMON BOLIVAR)", "especialidad": "MEDICINA INTERNA", "cantidad": 2},
    {"institucion": "SUBRED DE SERVICIOS DE SALUD NORTE (HOSPITAL SIMON BOLIVAR)", "especialidad": "NEUROLOGIA", "cantidad": 3},
    {"institucion": "SUBRED DE SERVICIOS DE SALUD SUR (TUNAL)", "especialidad": "MEDICINA INTERNA", "cantidad": 2},
    {"institucion": "SUBRED DE SERVICIOS DE SALUD SUR OCCIDENTE (KENNEDY)", "especialidad": "MEDICINA INTERNA", "cantidad": 4},
    {"institucion": "SUBRED DE SERVICIOS DE SALUD SUR OCCIDENTE (KENNEDY)", "especialidad": "NEUROLOGIA", "cantidad": 5},
    {"institucion": "HOSPITAL SIMULADO", "especialidad": "MEDICINA INTERNA HOSPITAL SIMULADO", "cantidad": 14}
    ],
    "restricciones": [
    {"estudiante": "326783", "institucion": "CLINICA UNIVERSIDAD DE LA SABANA"},
    {"estudiante": "328421", "institucion": "CLINICA UNIVERSIDAD DE LA SABANA"},
    {"estudiante": "322212", "institucion": "CLINICA UNIVERSIDAD DE LA SABANA"},
    {"estudiante": "300875", "institucion": "CLINICA UNIVERSIDAD DE LA SABANA"},
    {"estudiante": "299950", "institucion": "CLINICA UNIVERSIDAD DE LA SABANA"},
    {"estudiante": "296105", "institucion": "CLINICA DE TENJO", "especialidad": "MEDICINA FAMILIAR"},
    {"estudiante": "296105", "institucion": "SUBRED DE SERVICIOS DE SALUD SUR OCCIDENTE (KENNEDY)", "especialidad": "NEUROLOGIA"},
    {"estudiante": "317430", "institucion": "FUNDACION CLINICA SHAIO"},
    {"estudiante": "330160", "institucion": "FUNDACION CLINICA SHAIO"},
    {"estudiante": "325680", "institucion": "CLINICA UNIVERSIDAD DE LA SABANA", "especialidad": "MEDICINA FAMILIAR"},
    {"estudiante": "325680", "institucion": "SUBRED DE SERVICIOS DE SALUD SUR (TUNAL)", "especialidad": "MEDICINA INTERNA"},
    {"estudiante": "325680", "institucion": "SUBRED DE SERVICIOS DE SALUD SUR OCCIDENTE (KENNEDY)", "especialidad": "NEUROLOGIA"},
    {"estudiante": "325680", "institucion": "HOSPITAL SIMULADO", "especialidad": "SALUD MENTAL"},
    {"estudiante": "325680", "institucion": "HOSPITAL SIMULADO", "especialidad": "MEDICINA INTERNA HOSPITAL SIMULADO"}
    ],
  "asignacion": {
    "numero_periodos": 8,
    "estudiantes_aleatorio": true,
    "instituciones_aleatorio": true,
    "asignacion": "CONCENTRADA",
    "institucion_residual": "CLINICA UNIVERSIDAD DE LA SABANA"
  },
  "distribucion_periodos": [
    {"especialidad": "MEDICINA FAMILIAR", "asignacion": 1},
    {"especialidad": "MEDICINA INTERNA", "asignacion": 4},
    {"especialidad": "NEUROLOGIA", "asignacion": 1},
    {"especialidad": "SALUD MENTAL", "asignacion": 1},
    {"especialidad": "MEDICINA INTERNA HOSPITAL SIMULADO", "asignacion": 1}
  ],
  "combinaciones": [
    {"especialidad_1": "MEDICINA INTERNA", "especialidad_2": "MEDICINA INTERNA", "bloque": "X4"},
    {"especialidad_1": "MEDICINA INTERNA HOSPITAL SIMULADO", "especialidad_2": "SALUD MENTAL", "bloque": "X2"},
    {"especialidad_1": "MEDICINA FAMILIAR", "especialidad_2": "NEUROLOGIA", "bloque": "X2"}
  ],
  "estudiantes": [
{"id":"352043","nombre" : "Estudiante_352043","semestre": "6"},
{"id":"350248","nombre" : "Estudiante_350248","semestre": "6"},
{"id":"353107","nombre" : "Estudiante_353107","semestre": "6"},
{"id":"348862","nombre" : "Estudiante_348862","semestre": "6"},
{"id":"296105","nombre" : "Estudiante_296105","semestre": "6"},
{"id":"351117","nombre" : "Estudiante_351117","semestre": "6"},
{"id":"350006","nombre" : "Estudiante_350006","semestre": "6"},
{"id":"317430","nombre" : "Estudiante_317430","semestre": "6"},
{"id":"354275","nombre" : "Estudiante_354275","semestre": "6"},
{"id":"349015","nombre" : "Estudiante_349015","semestre": "6"},
{"id":"330160","nombre" : "Estudiante_330160","semestre": "6"},
{"id":"346736","nombre" : "Estudiante_346736","semestre": "6"},
{"id":"348506","nombre" : "Estudiante_348506","semestre": "6"},
{"id":"325680","nombre" : "Estudiante_325680","semestre": "6"},
{"id":"357510","nombre" : "Estudiante_357510","semestre": "6"},
{"id":"334655","nombre" : "Estudiante_334655","semestre": "6"},
{"id":"300875","nombre" : "Estudiante_300875","semestre": "6"},
{"id":"361084","nombre" : "Estudiante_361084","semestre": "6"},
{"id":"350882","nombre" : "Estudiante_350882","semestre": "6"},
{"id":"349413","nombre" : "Estudiante_349413","semestre": "6"},
{"id":"352080","nombre" : "Estudiante_352080","semestre": "6"},
{"id":"299950","nombre" : "Estudiante_299950","semestre": "6"},
{"id":"326406","nombre" : "Estudiante_326406","semestre": "6"},
{"id":"344949","nombre" : "Estudiante_344949","semestre": "6"},
{"id":"355080","nombre" : "Estudiante_355080","semestre": "6"},
{"id":"325429","nombre" : "Estudiante_325429","semestre": "6"},
{"id":"335292","nombre" : "Estudiante_335292","semestre": "6"},
{"id":"350640","nombre" : "Estudiante_350640","semestre": "6"},
{"id":"343416","nombre" : "Estudiante_343416","semestre": "6"},
{"id":"336115","nombre" : "Estudiante_336115","semestre": "6"},
{"id":"348892","nombre" : "Estudiante_348892","semestre": "6"},
{"id":"351134","nombre" : "Estudiante_351134","semestre": "6"},
{"id":"352147","nombre" : "Estudiante_352147","semestre": "6"},
{"id":"352861","nombre" : "Estudiante_352861","semestre": "6"},
{"id":"351263","nombre" : "Estudiante_351263","semestre": "6"},
{"id":"348660","nombre" : "Estudiante_348660","semestre": "6"},
{"id":"350577","nombre" : "Estudiante_350577","semestre": "6"},
{"id":"348199","nombre" : "Estudiante_348199","semestre": "6"},
{"id":"347721","nombre" : "Estudiante_347721","semestre": "6"},
{"id":"326838","nombre" : "Estudiante_326838","semestre": "6"},
{"id":"298127","nombre" : "Estudiante_298127","semestre": "6"},
{"id":"242479","nombre" : "Estudiante_242479","semestre": "6"},
{"id":"363396","nombre" : "Estudiante_363396","semestre": "6"},
{"id":"352375","nombre" : "Estudiante_352375","semestre": "6"},
{"id":"354959","nombre" : "Estudiante_354959","semestre": "6"},
{"id":"351016","nombre" : "Estudiante_351016","semestre": "6"},
{"id":"335655","nombre" : "Estudiante_335655","semestre": "6"},
{"id":"352716","nombre" : "Estudiante_352716","semestre": "6"},
{"id":"359377","nombre" : "Estudiante_359377","semestre": "6"},
{"id":"341596","nombre" : "Estudiante_341596","semestre": "6"},
{"id":"360265","nombre" : "Estudiante_360265","semestre": "6"},
{"id":"347788","nombre" : "Estudiante_347788","semestre": "6"},
{"id":"360317","nombre" : "Estudiante_360317","semestre": "6"},
{"id":"349876","nombre" : "Estudiante_349876","semestre": "6"},
{"id":"343541","nombre" : "Estudiante_343541","semestre": "6"},
{"id":"326783","nombre" : "Estudiante_326783","semestre": "6"},
{"id":"323710","nombre" : "Estudiante_323710","semestre": "6"},
{"id":"355269","nombre" : "Estudiante_355269","semestre": "6"},
{"id":"341969","nombre" : "Estudiante_341969","semestre": "6"},
{"id":"363458","nombre" : "Estudiante_363458","semestre": "6"},
{"id":"328690","nombre" : "Estudiante_328690","semestre": "6"},
{"id":"351025","nombre" : "Estudiante_351025","semestre": "6"},
{"id":"328421","nombre" : "Estudiante_328421","semestre": "6"},
{"id":"348537","nombre" : "Estudiante_348537","semestre": "6"},
{"id":"360940","nombre" : "Estudiante_360940","semestre": "6"},
{"id":"347306","nombre" : "Estudiante_347306","semestre": "6"},
{"id":"352650","nombre" : "Estudiante_352650","semestre": "6"},
{"id":"339037","nombre" : "Estudiante_339037","semestre": "6"},
{"id":"350990","nombre" : "Estudiante_350990","semestre": "6"},
{"id":"336003","nombre" : "Estudiante_336003","semestre": "6"},
{"id":"350711","nombre" : "Estudiante_350711","semestre": "6"},
{"id":"333556","nombre" : "Estudiante_333556","semestre": "6"},
{"id":"349935","nombre" : "Estudiante_349935","semestre": "6"},
{"id":"347570","nombre" : "Estudiante_347570","semestre": "6"},
{"id":"338789","nombre" : "Estudiante_338789","semestre": "6"},
{"id":"342175","nombre" : "Estudiante_342175","semestre": "6"},
{"id":"334383","nombre" : "Estudiante_334383","semestre": "6"},
{"id":"341872","nombre" : "Estudiante_341872","semestre": "6"},
{"id":"348297","nombre" : "Estudiante_348297","semestre": "6"},
{"id":"319333","nombre" : "Estudiante_319333","semestre": "6"},
{"id":"338124","nombre" : "Estudiante_338124","semestre": "6"},
{"id":"348796","nombre" : "Estudiante_348796","semestre": "6"},
{"id":"342753","nombre" : "Estudiante_342753","semestre": "6"},
{"id":"350898","nombre" : "Estudiante_350898","semestre": "6"},
{"id":"343049","nombre" : "Estudiante_343049","semestre": "6"},
{"id":"343038","nombre" : "Estudiante_343038","semestre": "6"},
{"id":"343027","nombre" : "Estudiante_343027","semestre": "6"},
{"id":"343016","nombre" : "Estudiante_343016","semestre": "6"},
{"id":"343005","nombre" : "Estudiante_343005","semestre": "6"},
{"id":"342994","nombre" : "Estudiante_342994","semestre": "6"},
{"id":"342982","nombre" : "Estudiante_342982","semestre": "6"},
{"id":"342971","nombre" : "Estudiante_342971","semestre": "6"},
{"id":"342960","nombre" : "Estudiante_342960","semestre": "6"},
{"id":"342949","nombre" : "Estudiante_342949","semestre": "6"},
{"id":"342938","nombre" : "Estudiante_342938","semestre": "6"},
{"id":"342927","nombre" : "Estudiante_342927","semestre": "6"},
{"id":"342916","nombre" : "Estudiante_342916","semestre": "6"},
{"id":"342905","nombre" : "Estudiante_342905","semestre": "6"},
{"id":"342893","nombre" : "Estudiante_342893","semestre": "6"},
{"id":"342882","nombre" : "Estudiante_342882","semestre": "6"},
{"id":"342871","nombre" : "Estudiante_342871","semestre": "6"},
{"id":"342860","nombre" : "Estudiante_342860","semestre": "6"},
{"id":"342849","nombre" : "Estudiante_342849","semestre": "6"},
{"id":"342838","nombre" : "Estudiante_342838","semestre": "6"},
{"id":"342827","nombre" : "Estudiante_342827","semestre": "6"},
{"id":"322212","nombre" : "Estudiante_322212","semestre": "6"},
{"id":"342804","nombre" : "Estudiante_342804","semestre": "6"},
{"id":"342793","nombre" : "Estudiante_342793","semestre": "6"},
{"id":"342782","nombre" : "Estudiante_342782","semestre": "6"},
{"id":"342771","nombre" : "Estudiante_342771","semestre": "6"},
{"id":"342760","nombre" : "Estudiante_342760","semestre": "6"},
{"id":"342749","nombre" : "Estudiante_342749","semestre": "6"}
  ]
}

```