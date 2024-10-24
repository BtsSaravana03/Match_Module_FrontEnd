import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from 'rxjs';
import { api_url } from "../variable";
@Injectable({
  providedIn: 'root'
})
export class HttpServices {
  constructor(private http: HttpClient) {}

  async getData(url: string): Promise < any > {
    try {
      const data = await firstValueFrom(this.http.get < any > (api_url + url));
      return data;
    } catch (error) {
      console.error('Error fetching data', error);
      throw error;
    }
  }    
}