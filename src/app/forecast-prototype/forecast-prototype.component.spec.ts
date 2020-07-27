import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastPrototypeComponent } from './forecast-prototype.component';

describe('ForecastPrototypeComponent', () => {
  let component: ForecastPrototypeComponent;
  let fixture: ComponentFixture<ForecastPrototypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForecastPrototypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastPrototypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
