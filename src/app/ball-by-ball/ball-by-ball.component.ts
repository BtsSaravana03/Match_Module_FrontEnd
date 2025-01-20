import { ChangeDetectorRef, Component, DestroyRef, effect, inject, input, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { BallByBallService } from '../services/ball-by-ball.service';
import { DxDataGridModule } from 'devextreme-angular';
import { Workbook } from 'exceljs';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver-es';
import { exportDataGrid as exportDataGridToPdf } from 'devextreme/pdf_exporter';
import { exportDataGrid as exportDataGridToXLSX } from 'devextreme/excel_exporter';
import { BallData } from './ball-by-ball.interface';
import { VideoService } from '../components/video/video.service';
import { VideoComponent } from "../components/video/video.component";
import { InningsService } from '../components/innings-tab/innings.service';
import Enumerable from 'linq';
import { MatchData } from '../scorecard-v2/batting-card/batting-card.interface';

@Component({
  selector: 'app-ball-by-ball',
  standalone: true,
  imports: [DxDataGridModule, VideoComponent],
  templateUrl: './ball-by-ball.component.html',
  styleUrl: './ball-by-ball.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class BallByBallComponent {
  private ballbyballService = inject(BallByBallService);
  private videoService = inject(VideoService);
  private destroyRef = inject(DestroyRef);

  ballArray = input.required<BallData[]>();
  matchDetails = input.required<MatchData>();
  selctedInnings = input.required<number>();
  ballArrayFiltered:BallData[] = [];
  constructor(){
    effect(()=>{
      if(this.ballArray() && this.selctedInnings()){
        this.generateBallByBall();
      }
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
    .where(i => i.InningsId === this.selctedInnings()).toArray();
    this.ballArrayFiltered = Data;
  }
  onCellClick(index:number){
    this.videoService.PlayBallbyball(index,this.selctedInnings());
  }
  getInningPre():string{
    switch (this.selctedInnings()){
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
//   onInningsChange(e:number){
//     this.selctedInnings = e;
//     this.generateBallByBall();
//   }
}
