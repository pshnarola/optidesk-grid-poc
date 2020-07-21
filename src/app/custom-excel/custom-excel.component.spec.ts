import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomExcelComponent } from './custom-excel.component';

describe('CustomExcelComponent', () => {
  let component: CustomExcelComponent;
  let fixture: ComponentFixture<CustomExcelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomExcelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomExcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
