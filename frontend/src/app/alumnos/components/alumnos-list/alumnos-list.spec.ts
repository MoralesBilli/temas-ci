import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AlumnosList } from './alumnos-list';
import { provideHttpClient } from '@angular/common/http'; 

describe('AlumnosList', () => {
  let component: AlumnosList;
  let fixture: ComponentFixture<AlumnosList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlumnosList,HttpClientTestingModule],
      providers: [
        provideHttpClient()   // 👈 registrar HttpClient
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlumnosList);
    component = fixture.componentInstance;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
