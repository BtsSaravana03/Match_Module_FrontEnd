import { Component, effect, inject, input } from '@angular/core';
import { VideoService } from '../../../components/video/video.service';
import { BallData } from '../../../ball-by-ball/ball-by-ball.interface';
import { MatchData } from '../../../scorecard-v2/batting-card/batting-card.interface';
import { Workbook } from 'exceljs';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver-es';
import { exportDataGrid as exportDataGridToPdf } from 'devextreme/pdf_exporter';
import { exportDataGrid as exportDataGridToXLSX } from 'devextreme/excel_exporter';
import Enumerable from 'linq';
import { DxDataGridModule } from 'devextreme-angular';
import { VideoComponent } from '../../../components/video/video.component';

@Component({
  selector: 'app-basic-ball-by-ball',
  standalone: true,
  imports: [DxDataGridModule, VideoComponent],
  templateUrl: './basic-ball-by-ball.component.html',
  styleUrl: './basic-ball-by-ball.component.scss'
})
export class BasicBallByBallComponent {
  private videoService = inject(VideoService);

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
    this.videoService.PlayBallbyball(index);
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
}
