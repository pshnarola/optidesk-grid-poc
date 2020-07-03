import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomUiComponent } from './custom-ui.component';

describe('CustomUiComponent', () => {
  let component: CustomUiComponent;
  let fixture: ComponentFixture<CustomUiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomUiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
