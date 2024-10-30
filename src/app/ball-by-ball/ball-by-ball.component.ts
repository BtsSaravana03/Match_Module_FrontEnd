import { Component, DestroyRef, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { BallByBallService } from '../services/ball-by-ball.service';
import { DxDataGridModule } from 'devextreme-angular';
import { Workbook } from 'exceljs';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver-es';
import { exportDataGrid as exportDataGridToPdf } from 'devextreme/pdf_exporter';
import { exportDataGrid as exportDataGridToXLSX } from 'devextreme/excel_exporter';
import { AppService } from '../services/app.service';
import { BallData } from './ball-by-ball.interface';

@Component({
  selector: 'app-ball-by-ball',
  standalone: true,
  imports: [DxDataGridModule],
  templateUrl: './ball-by-ball.component.html',
  styleUrl: './ball-by-ball.component.scss',
  encapsulation:ViewEncapsulation.ShadowDom
})
export class BallByBallComponent implements OnInit {
  private ballbyballService = inject(BallByBallService);
  private appService = inject(AppService);
  private destroyRef = inject(DestroyRef);
  ballArray = signal<BallData[]|[]>([]);
  matchDetails = signal<any[]>([]);
  ngOnInit(): void {
    this.appService.updateNavHeader('Ball By Ball');
    const subscription = this.ballbyballService.ballObservable$.subscribe(updated =>{
      this.ballArray.set(updated);
    })
    const matchSubscription = this.ballbyballService.ballObservable$.subscribe(updated=>{
      this.matchDetails.set(updated);
    })
    this.destroyRef.onDestroy(()=>{
      subscription.unsubscribe();
      matchSubscription.unsubscribe();
    })
  }
  onExporting(e:any) {
    if (e.format === 'pdf') {
      const doc = new jsPDF();
      exportDataGridToPdf({
        jsPDFDocument: doc,
        component: e.component,
      }).then(() => {
        doc.save(`PlayerList${new Date().getTime().toString()}.pdf`);
      });
    } else {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Players');

      exportDataGridToXLSX({
        component: e.component,
        worksheet,
        autoFilterEnabled: true,
      }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `PlayerList${new Date().getTime().toString()}.xlsx`);
        });
      });
      e.cancel = true;
    }
  }
}
