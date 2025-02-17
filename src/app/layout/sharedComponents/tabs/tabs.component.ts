import { CommonModule } from '@angular/common';
import { AfterContentInit, Component, ElementRef, input, OnChanges, output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss'
})

export class TabsComponent implements AfterContentInit,OnChanges {
    dataSource = input.required<Array<any>>();
    displayExpression = input.required<string>();
    keyExpression = input.required<string>();
    selectedItem:any = undefined;
    onTabSelectionChange = output<any[]>();
    setTabValue = input<undefined|number>();
    visibility =input.required<boolean>();
    TinyTabSize = input<boolean>(false);


    ngAfterContentInit(): void {
        this.selectedItem = this.dataSource()[0]??undefined;
        if(this.selectedItem){
            this.onTabSelectionChange.emit(this.selectedItem);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes['setTabValue']){
            let currentValue = changes['setTabValue'].currentValue;
            if(currentValue){
                this.changeTab(currentValue);
            }
        }
        if(changes['dataSource']){
            this.selectedItem = this.dataSource()[0]??undefined;
            if(this.selectedItem){
                this.onTabSelectionChange.emit(this.selectedItem);
            }
        }
    }

    onTabChange<T>(key:string,dataSource: T[],keyExpression: keyof T){
        const selectedItem = dataSource.find((item: T) => item[keyExpression] === key);
        if(this.selectedItem !== selectedItem){
            this.selectedItem = selectedItem;
            this.onTabSelectionChange.emit(this.selectedItem);
        }
    }
    changeTab(value:any){
        const item = this.dataSource().find(i => i[this.keyExpression()] === value);
        this.selectedItem = item;
    }
}
