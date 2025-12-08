import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CalidadService } from './calidad-service';

describe('CalidadService', () => {
  let service: CalidadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
       imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(CalidadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
