import { inject, Injectable } from "@angular/core";
import { HttpServices } from "../services/http.service";
import { Router } from "@angular/router";

@Injectable({
    providedIn:'root'
})

export class LoginServices{
   private httpService = inject(HttpServices);
   userInfo:any[] = [];
   private router = inject(Router);

   async login(username: string, password: string): Promise<boolean> {
        try {
            const res = await this.httpService.postData(`login/validate/${username}/${password}`);
            
            if (res.status === 200) {
                this.userInfo = res.data;
                sessionStorage.setItem('session_mm',res.session)
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    }
    logout(){
        sessionStorage.removeItem('session_mm');
        this.router.navigate(['/login']);
    }
}