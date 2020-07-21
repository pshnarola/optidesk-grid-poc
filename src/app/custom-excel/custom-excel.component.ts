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
  videoFile: any;
  fileList = [];
  fileUploaded: File;
  storeData: any;
  worksheet: any;
  jsonData: any;

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
      updateTable: (el, cell, x, y, source, value, id) => {
        if (x === 0 && y === 0) {
          cell.classList.add('readonly');
        }
        if (x === 1 && y === 0) {
          cell.classList.add('readonly');
        }
      },
    });
  }

  uploadVideo(files: File[]) {
    console.log('file', files);
    const fileExt = files[files.length - 1].name.substr(files[files.length - 1].name.length - 4);
    console.log('extension', fileExt);
    if (fileExt === 'xlsx') {
      this.fileList.push(...files);
      this.fileUploaded = files[0];
      this.readExcel();
    } else {
      console.log('not excel');
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
      console.log('workbook', workbook);
      this.createJson();
    };
    readFile.readAsArrayBuffer(this.fileUploaded);
  }

  createJson() {
    this.jsonData = XLSX.utils.sheet_to_json(this.worksheet, { raw: false });
    this.jsonData = JSON.stringify(this.jsonData);
    const data: Blob = new Blob([this.jsonData], { type: 'application/json' });
    console.log('uploaded excel json', this.jsonData);
  }

  downloadExcel() {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';
    const fileName = 'Sample';
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.excelData);
    const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
  }
}
