import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  constructor(private http: HttpClient) { }

  getDemandDetails() {
    const url = environment.DOMAIN.URL + 'demands';
    return this.http.get<any>(url).toPromise();
  }

  updateDemadDetails(body) {
    const url = environment.DOMAIN.URL + 'demands';
    return this.http.put<any>(url, body).toPromise();
  }

  getKeyFigures() {
    const url = environment.DOMAIN.URL + 'key-figures';
    return this.http.get<any>(url).toPromise();
  }

  getPlanDates() {
    const url = environment.DOMAIN.URL + 'plan-dates';
    return this.http.get<any>(url).toPromise();
  }

  getPlanView() {
    const url = environment.DOMAIN.URL + 'plan-views';
    return this.http.get<any>(url).toPromise();
  }

  updatePlanData(body) {
    const url = environment.DOMAIN.URL + 'plan-views';
    return this.http.put<any>(url, body).toPromise();
  }

  downloadExcel(body) {
    const httpOptionObj = {};
    httpOptionObj['responseType'] = 'Blob' as 'json';
    httpOptionObj['observe'] = 'response';
    const url = environment.DOMAIN.URL + 'excel-download';
    return this.http.post<any>(url, body, httpOptionObj).toPromise();
  }

  uploadExcel(document) {
    const httpOptionObj = {};
    httpOptionObj['Content-Type'] = 'multipart/form-data';
    httpOptionObj['Accept'] = 'application/json';
    const url = environment.DOMAIN.URL + 'excel-validate?type=forecast';
    return this.http.post<any>(url, document, httpOptionObj).toPromise();
  }
}
