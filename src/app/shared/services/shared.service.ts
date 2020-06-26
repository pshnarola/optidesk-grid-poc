import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

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
    return this.http.put<any>(url, body ).toPromise();
  }
}
