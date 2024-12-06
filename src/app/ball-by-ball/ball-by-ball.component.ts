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
import { VideoService } from '../components/video/video.service';
import { VideoComponent } from "../components/video/video.component";
import { InningsService } from '../components/innings-tab/innings.service';
import Enumerable from 'linq';
import { InningsTabComponent } from '../components/innings-tab/innings-tab.component';
import { MatchData } from '../scorecard/batting-card/batting-card.interface';

@Component({
  selector: 'app-ball-by-ball',
  standalone: true,
  imports: [DxDataGridModule, VideoComponent,InningsTabComponent],
  templateUrl: './ball-by-ball.component.html',
  styleUrl: './ball-by-ball.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class BallByBallComponent implements OnInit {
  private ballbyballService = inject(BallByBallService);
  private videoService = inject(VideoService);
  private appService = inject(AppService);
  private destroyRef = inject(DestroyRef);
  private InningService = inject(InningsService);

  ballArray = signal<BallData[]>([]);
  matchDetails = signal<MatchData|{}>({});
  selctedInnings:number = 1;
  ballArrayFiltered = signal<BallData[]>([]);

  ngOnInit(): void {
    this.appService.updateNavHeader('Ball By Ball');
    const subscription = this.ballbyballService.ballObservable$.subscribe(updated =>{
      this.ballArray.set(updated);
      this.generateBallByBall();
    })
    const matchSubscription = this.ballbyballService.matchObservable$.subscribe(updated=>{
      this.matchDetails.set(updated);
    })
    const InnSub = this.InningService.InningsObserver$.subscribe(updated=>{
      this.selctedInnings = updated;
      this.generateBallByBall();
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
  generateBallByBall(){
    const Data = Enumerable.from(this.ballArray())
    .where(i => i.InningsId === this.selctedInnings).toArray();
    this.ballArrayFiltered.set(Data);
  }
  onCellClick(index:number){
    this.videoService.PlayBallbyball(index);
  }
  getInningPre():string{
    switch (this.selctedInnings){
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      case 4:
        return 'th'
      default:
        return 'th';
    }
  }
  onInningsChange(e:number){
    this.selctedInnings = e;
    this.generateBallByBall();
  }
}
