import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { firstValueFrom } from 'rxjs';
import { api_url } from "../../variable";
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
  async postData(url: string, params?: any): Promise<any> {
    try {
        const response = await fetch(api_url + url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in postData:', error);
        throw error;
    }
  }
}
