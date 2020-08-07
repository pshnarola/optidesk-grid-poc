import { Component, OnInit } from '@angular/core';
import { SharedService } from '../shared/services/shared.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as jexcel from 'jexcel';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { FormGroup } from '@angular/forms';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-forecast-prototype',
  templateUrl: './forecast-prototype.component.html',
  styleUrls: ['./forecast-prototype.component.scss']
})
export class ForecastPrototypeComponent implements OnInit {
  tableDetails: any;
  errorMsg: any;
  dataSet = {};
  chartData = [];
  forecastData = [
    {
      planBucket: 'WK.01 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.02 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.03 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.04 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.05 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.06 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.07 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.08 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.08 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.10 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.11 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.12 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.13 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.14 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.15 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.16 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.17 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.18 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.19 2020',
      forecast: ''
    },
    {
      planBucket: 'WK.20 2020',
      forecast: ''
    },
  ];
  fileList = [];
  gridData = [];
  columnObj = [];
  loadData = false;
  showDailyPicker = false;
  showWeeklyPicker = false;
  showMonthlyPicker = false;
  errorFrom;
  selectedValue = '1';
  errorTo;
  public searchForecast: any = {};
  public userForm: FormGroup;
  private modalRef: NgbModalRef;
  model: NgbDateStruct;
  date: { year: number, month: number, day: number };

  selectedDate: any;
  planHorizon: any;
  startDate: any;
  endDate: any;

  datePickerConfig = {
    format: 'DD-MM-YYYY',
    // firstCalendarDay: 0,
    // 0 - Sunday, 1 - Monday,
    // firstDayOfWeek: 'su',
    monthFormat: 'MMM, YYYY',
    // disableKeypress: false,
    // allowMultiSelect: false,
    // closeOnSelect: undefined,
    // closeOnSelectDelay: 100,
    // onOpenDelay: 0,
    // weekDayFormat: 'ddd',
    // appendTo: document.body,
    // drops: 'down',
    // opens: 'right',
    // showNearMonthDays: true,
    // showWeekNumbers: false,
    // enableMonthSelector: true,
    // yearFormat: 'YYYY',
    // showGoToCurrent: true,
    // dayBtnFormat: 'DD',
    // monthBtnFormat: 'MMM',
    // hours12Format: 'hh',
    // hours24Format: 'HH',
    // meridiemFormat: 'A',
    // minutesFormat: 'mm',
    // minutesInterval: 1,
    // secondsFormat: 'ss',
    // secondsInterval: 1,
    // showSeconds: false,
    // showTwentyFourHours: true,
    // timeSeparator: ':',
    // multipleYearsNavigateBy: 10,
    // showMultipleYearsNavigation: false,
    // locale: 'zh-cn',
  };
  constructor(
    private shared: SharedService,
    private modalService: NgbModal,
    private calendar: NgbCalendar
  ) { }

  ngOnInit(): void {
    this.gridData = this.forecastData;
  }

  uploadVideo(files: File[]) {
    const fileExt = files[files.length - 1].name.substr(files[files.length - 1].name.length - 4);
    if (fileExt === 'xlsx') {
      this.fileList.push(...files);
      const formData = new FormData();
      this.fileList.forEach((element, index) => {
        formData.append('file', element);
      });
      this.shared.uploadExcel(formData).then(res => {
        this.gridData = [];
        this.gridData = res;
      }).catch(error => {
      });
    } else {
    }
  }

  openExcel(excelContent) {
    this.modalRef = this.modalService.open(excelContent);
    this.createExcel();
    this.modalRef.result.then((result) => {
    }, (reason) => {
    });
  }

  createExcel() {
    this.columnObj = [
      { width: 200, name: 'planBucket', title: 'PLANBUCKET', readOnly: false },
      { width: 200, name: 'forecast', title: 'FORECAST', decimal: ',' }
    ];
    jexcel(document.getElementById('excel'), {
      data: this.gridData,
      columns: this.columnObj,
      minDimensions: [30, 25],
      rowResize: true,
      columnDrag: true,
      contextMenu: false,
      onchange: (instance, cell, colIndex, rowIndex, value, oldValue) => {
        const columnName = this.columnObj[colIndex].name;
        if (Number(colIndex) === 1) {
          if (this.gridData[rowIndex] && this.gridData[rowIndex].hasOwnProperty('planBucket')) {
            this.gridData[rowIndex][columnName] = value;
          } else {
            if (value.length === 0) {
              console.log('cell text', cell.text());
              this.errorMsg = '';
            } else {
              this.errorMsg = 'Extra Data has been Added Only ' + this.gridData.length + 'Plan Buckets are available';
            }
          }
        } else if (Number(colIndex) === 0) {
          if (this.gridData[rowIndex] && this.gridData[rowIndex].hasOwnProperty('planBucket')) {
            if (value !== this.gridData[rowIndex].planBucket) {
              this.errorMsg = 'Plan bucket is not as per required formate';
            } else {
              this.errorMsg = '';
              this.gridData[rowIndex][columnName] = value;
            }
          } else {
            if (value.length === 0) {
              this.errorMsg = '';
            } else {
              this.errorMsg = 'Extra Data has been Added Only ' + this.gridData.length + 'Plan Buckets are available';
            }
          }
        }
      },
    });
  }

  downloadExcel() {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';
    const fileName = 'Sample';
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.gridData);
    const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
  }

  selectedPEriod(period) {
    const selectedPeriod = period;
    if (selectedPeriod === 'Daily') {
      this.showDailyPicker = true;
      this.showWeeklyPicker = false;
      this.showMonthlyPicker = false;
    } else if (selectedPeriod === 'Monthly') {
      this.showDailyPicker = false;
      this.showWeeklyPicker = false;
      this.showMonthlyPicker = true;
    } else if (selectedPeriod === 'Weekly') {
      this.showDailyPicker = false;
      this.showWeeklyPicker = true;
      this.showMonthlyPicker = false;
    }
  }

  changeSelection(event) {
    this.searchForecast.fromWeekly = null;
    this.searchForecast.toWeekly = null;
  }

  isDisabledFromDate = (date: NgbDateStruct) => {
    const value = parseFloat(this.selectedValue) === 7 ? 0 : parseFloat(this.selectedValue);
    const d = new Date(date.year, date.month - 1, date.day);
    return d.getDay() !== value;
  }

  isDisabledToDate = (date: NgbDateStruct) => {
    const value = parseFloat(this.selectedValue);
    const d = new Date(date.year, date.month - 1, date.day);
    return d.getDay() !== (value - 1);
  }

  onModelEnter(value) {
    console.log('value', value);
    const json = {
      p21: 'MODELID',
      p22: value
    };
    const array = [];
    array.push(json);
    this.shared.getPlanHorizon(array).then(res => {
      this.planHorizon = res.planHorizons[0];
      const start = this.planHorizon.fromDate.split('/');
      const end = this.planHorizon.toDate.split('/');
      this.startDate = {year: Number(start[2]), month: Number(start[1]), day: Number(start[0])};
      this.endDate = {year: Number(end[2]), month: Number(end[1]), day: Number(end[0])};
    }).catch(error => {
    });
  }

  onSubmit(value) {
    this.gridData = [];
    this.gridData = [
      {
        planBucket: 'WK.01 2020',
        forecast: 234
      },
      {
        planBucket: 'WK.02 2020',
        forecast: 565
      },
      {
        planBucket: 'WK.03 2020',
        forecast: 676
      },
      {
        planBucket: 'WK.04 2020',
        forecast: 90
      },
      {
        planBucket: 'WK.05 2020',
        forecast: 567
      },
      {
        planBucket: 'WK.06 2020',
        forecast: 78
      },
      {
        planBucket: 'WK.07 2020',
        forecast: 67
      },
      {
        planBucket: 'WK.08 2020',
        forecast: 12
      },
      {
        planBucket: 'WK.08 2020',
        forecast: 56
      },
      {
        planBucket: 'WK.10 2020',
        forecast: 9
      },
      {
        planBucket: 'WK.11 2020',
        forecast: 67
      },
      {
        planBucket: 'WK.12 2020',
        forecast: 445
      },
      {
        planBucket: 'WK.13 2020',
        forecast: 677
      },
      {
        planBucket: 'WK.14 2020',
        forecast: 78
      },
      {
        planBucket: 'WK.15 2020',
        forecast: 56
      },
      {
        planBucket: 'WK.16 2020',
        forecast: 976
      },
      {
        planBucket: 'WK.17 2020',
        forecast: 78
      },
      {
        planBucket: 'WK.18 2020',
        forecast: 67
      },
      {
        planBucket: 'WK.19 2020',
        forecast: 3
      },
      {
        planBucket: 'WK.20 2020',
        forecast: 78
      }
    ];
    console.log('value', value);
    console.log('date', this.model);
  }
}
