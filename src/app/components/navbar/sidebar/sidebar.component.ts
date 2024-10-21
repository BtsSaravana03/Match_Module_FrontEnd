  import { CommonModule } from '@angular/common';
  import { Component, HostListener, model, output } from '@angular/core';
  import { RouterLink, RouterLinkActive } from '@angular/router';
  import { trigger, state, style, animate, transition } from '@angular/animations';
  import { DxDrawerModule } from 'devextreme-angular';

  @Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [DxDrawerModule,RouterLink,CommonModule,RouterLinkActive],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss',
    animations: [
      trigger('slideInOut', [
        state('in', style({
          width: '{{ sidebarWidth }}',
          opacity: 1
        }), { params: { sidebarWidth: '300px' }}),
        state('out', style({
          width: '0',
          opacity: 0
        })),
        transition('in => out', [
          animate('300ms ease-in-out')
        ]),
        transition('out => in', [
          animate('300ms ease-in-out')
        ])
      ])
    ]
  })
  export class SidebarComponent {
    visible = model();
    header = output<string>()
    sidebarWidth: string = '300px';
    navigation = [
      {path:'/ballbyball', icon: 'fa-solid fa-tennis-ball', name:'Ball By Ball'}
    ];
    @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
      const screenWidth = (event.target as Window).innerWidth;
  
      if (screenWidth <= 300) {
        this.sidebarWidth = '100%';
      } else {
        this.sidebarWidth = '300px';
      }
    }
    setHeader(name:string){
      this.header.emit(name);
      this.visible.set(false);
    }
  }
