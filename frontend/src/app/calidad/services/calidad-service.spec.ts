import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CalidadService } from './calidad-service';
import { provideHttpClient } from '@angular/common/http'; 

describe('CalidadService', () => {
  let service: CalidadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
       imports: [HttpClientTestingModule],
        providers: [
        provideHttpClient()  
      ]

    });
    service = TestBed.inject(CalidadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
