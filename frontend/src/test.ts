import 'zone.js';
import 'zone.js/testing';

import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

// Inicializa el entorno de testing de Angular
getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting()
);
