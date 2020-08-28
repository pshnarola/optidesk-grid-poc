import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanViewNewApproachComponent } from './plan-view-new-approach.component';

describe('PlanViewNewApproachComponent', () => {
  let component: PlanViewNewApproachComponent;
  let fixture: ComponentFixture<PlanViewNewApproachComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanViewNewApproachComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanViewNewApproachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
