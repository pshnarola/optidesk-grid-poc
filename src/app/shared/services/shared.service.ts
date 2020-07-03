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

}
