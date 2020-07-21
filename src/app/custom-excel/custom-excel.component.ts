import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as jexcel from 'jexcel';

@Component({
  selector: 'app-custom-excel',
  templateUrl: './custom-excel.component.html',
  styleUrls: ['./custom-excel.component.scss']
})
export class CustomExcelComponent implements OnInit {

  private modalRef: NgbModalRef;
  excelData = [
    {
      bucket: 'BUCKET',
      forecast: 'FORECAST'
    },
    {
      bucket: 'wk01',
      forecast: ''
    },
    {
      bucket: 'wk02',
      forecast: ''
    },
    {
      bucket: 'wk03',
      forecast: ''
    },
    {
      bucket: 'wk04',
      forecast: ''
    },
    {
      bucket: 'wk05',
      forecast: ''
    },
    {
      bucket: 'wk06',
      forecast: ''
    },
    {
      bucket: 'wk07',
      forecast: ''
    },
    {
      bucket: 'wk08',
      forecast: ''
    }
  ];

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  openCustomExcel(excelContent) {
    this.modalRef = this.modalService.open(excelContent);
    this.createExcel();
    this.modalRef.result.then((result) => {
    }, (reason) => {
    });
  }

  createExcel() {
    jexcel(document.getElementById('excel'), {
      data: this.excelData,
      minDimensions: [30, 15],
      columns: [
        { width: 200 },
        { width: 200 }
      ],
    });
  }

}
