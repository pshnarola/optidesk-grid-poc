import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as jexcel from 'jexcel';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-custom-excel',
  templateUrl: './custom-excel.component.html',
  styleUrls: ['./custom-excel.component.scss']
})
export class CustomExcelComponent implements OnInit {

  private modalRef: NgbModalRef;
  excelData = [
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
  videoFile: any;
  fileList = [];
  fileUploaded: File;
  storeData: any;
  worksheet: any;
  jsonData: any;
  excel = [];
  errorMsg: any;
  columnObj = [];
  newCreatedExcelData = [];
  tempArray = [];
  temp = [];
  index = 0;
  newCreatedExcel = [];

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
    this.excel = this.excelData;
  }

  openCustomExcel(excelContent) {
    this.modalRef = this.modalService.open(excelContent);
    this.createExcel();
    this.modalRef.result.then((result) => {
    }, (reason) => {
    });
  }

  createExcel() {
    this.columnObj = [
      { width: 200, name: 'bucket', title: 'PLANBUCKET', readOnly: false },
      { width: 200, name: 'forecast', title: 'FORECAST', type: 'numeric', decimal: ',' }
    ];
    jexcel(document.getElementById('excel'), {
      data: this.excel,
      columns: this.columnObj,
      minDimensions: [30, 15],
      onchange: (instance, cell, colIndex, rowIndex, value, oldValue) => {
        if (this.excel.length !== 0 && this.excel.length !== 15) {
          if (rowIndex < this.excel.length) {
            if (colIndex === 0 && value !== oldValue) {
              this.errorMsg = 'Plan bucket is not as per required formate';
            } else if (colIndex === 1) {
              const columnName = this.columnObj[colIndex].name;
              this.excel[rowIndex][columnName] = value;
            }
          } else {
            this.errorMsg = 'Extra Data has been Added Only ' + this.excel.length + 'Plan Buckets are available';
          }
        } else {
          this.createNewExcelJsonTemp(colIndex, rowIndex, value);
        }
      },
    });
  }

  createNewExcelJsonTemp(colindex, rowindex, data) {
    this.tempArray = [];
    const groupByRow = {};
    const groupBy = [];
    this.newCreatedExcelData.push({ colIndex: colindex, rowIndex: rowindex, value: data });
    this.newCreatedExcelData.forEach((a) => {
      groupByRow[a.rowIndex] = groupByRow[a.rowIndex] || [];
      groupByRow[a.rowIndex].push({ colIndex: a.colIndex, rowIndex: a.rowIndex, value: a.value });
    });
    groupBy.push(groupByRow);
  }

  uploadVideo(files: File[]) {
    const fileExt = files[files.length - 1].name.substr(files[files.length - 1].name.length - 4);
    if (fileExt === 'xlsx') {
      this.fileList.push(...files);
      this.fileUploaded = files[0];
      this.readExcel();
    } else {
    }
  }

  readExcel() {
    const readFile = new FileReader();
    readFile.onload = (e) => {
      this.storeData = readFile.result;
      const data = new Uint8Array(this.storeData);
      const arr = new Array();
      for (let i = 0; i !== data.length; ++i) { arr[i] = String.fromCharCode(data[i]); }
      const bstr = arr.join('');
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      this.worksheet = workbook.Sheets[firstSheetName];
      this.createJson();
    };
    readFile.readAsArrayBuffer(this.fileUploaded);
  }

  createJson() {
    this.jsonData = XLSX.utils.sheet_to_json(this.worksheet, { raw: false });
    const data: Blob = new Blob([this.jsonData], { type: 'application/json' });
    this.excel = [];
    document.getElementById('excel').innerHTML = '';
    this.excel = this.jsonData;
    this.createExcel();
  }

  downloadExcel() {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';
    const fileName = 'Sample';
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.excel);
    const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
  }

  creatNewExcel() {
    this.excel = [];
    document.getElementById('excel').innerHTML = '';
    this.createExcel();
  }
}
