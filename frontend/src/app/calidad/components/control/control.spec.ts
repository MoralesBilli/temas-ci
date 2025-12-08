import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Control } from './control';

describe('Control', () => {
  let component: Control<{ x: number; y: number }>;
  let fixture: ComponentFixture<Control<{ x: number; y: number }>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Control]
    }).compileComponents();

    fixture = TestBed.createComponent(Control<{ x: number; y: number }>);

    // Usar setInput para asignar valores
    fixture.componentRef.setInput('data', [
      { x: 1, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 4 }
    ]);
    fixture.componentRef.setInput('getX', (item: { x: number; y: number }) => item.x);
    fixture.componentRef.setInput('getY', (item: { x: number; y: number }) => item.y);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
