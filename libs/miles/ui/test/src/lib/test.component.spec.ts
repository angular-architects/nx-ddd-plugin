import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AsMilesTestComponent } from './test.component';

describe('AsMilesTestComponent', () => {
  let component: AsMilesTestComponent;
  let fixture: ComponentFixture<AsMilesTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsMilesTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AsMilesTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
