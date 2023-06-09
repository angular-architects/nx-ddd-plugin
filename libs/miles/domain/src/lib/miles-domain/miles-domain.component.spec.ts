import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MilesDomainComponent } from './miles-domain.component';

describe('MilesDomainComponent', () => {
  let component: MilesDomainComponent;
  let fixture: ComponentFixture<MilesDomainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MilesDomainComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MilesDomainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
