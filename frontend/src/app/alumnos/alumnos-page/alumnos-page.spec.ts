import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AlumnosPage } from './alumnos-page';
import { provideHttpClient } from '@angular/common/http'; 

describe('AlumnosPage', () => {
  let component: AlumnosPage;
  let fixture: ComponentFixture<AlumnosPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlumnosPage,HttpClientTestingModule],
       providers: [
        provideHttpClient()   // 👈 registrar HttpClient
      ]

    })
    .compileComponents();

    fixture = TestBed.createComponent(AlumnosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
