import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanviewAlternativeComponent } from './planview-alternative.component';

describe('PlanviewAlternativeComponent', () => {
  let component: PlanviewAlternativeComponent;
  let fixture: ComponentFixture<PlanviewAlternativeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanviewAlternativeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanviewAlternativeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
