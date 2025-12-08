import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AlumnosService } from './alumnos-service';

describe('AlumnosService', () => {
  let service: AlumnosService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]  // <-- importante
    });
    service = TestBed.inject(AlumnosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
