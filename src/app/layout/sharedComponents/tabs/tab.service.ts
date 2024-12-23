import { Injectable } from '@angular/core';
import { TabsComponent } from './tabs.component';

@Injectable({
  providedIn: 'root'
})
export class TabService {
    changeTab(value:any,TabComponent:TabsComponent){
       TabComponent.changeTab(value);
    }
}
