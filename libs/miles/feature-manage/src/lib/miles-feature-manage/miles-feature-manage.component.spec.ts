import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MilesFeatureManageComponent } from './miles-feature-manage.component';

describe('MilesFeatureManageComponent', () => {
  let component: MilesFeatureManageComponent;
  let fixture: ComponentFixture<MilesFeatureManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MilesFeatureManageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MilesFeatureManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
