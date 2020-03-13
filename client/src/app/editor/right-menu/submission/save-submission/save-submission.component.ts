import { Component, OnInit } from '@angular/core';
import { SaveSubmissionFacadeService } from './save-submission.facade.service';


@Component({
  selector: 'app-save-submission',
  templateUrl: './save-submission.component.html',
  styleUrls: ['./save-submission.component.scss']
})
export class SaveSubmissionComponent implements OnInit {
  saveTooltip: string;

  constructor(public saveSubmissionFacadeService: SaveSubmissionFacadeService) {

    this.saveTooltip = this.saveSubmissionFacadeService.getSaveShortCutToolTipText() // shortcut shown in the tooltip
   }

  ngOnInit(): void {
  }

  // save on local editing
  public saveLocal(): void {
    this.saveSubmissionFacadeService.saveLocal();
}
