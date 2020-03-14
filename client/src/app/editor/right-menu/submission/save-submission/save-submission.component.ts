import { Component, OnInit } from '@angular/core';
import { SaveSubmissionFacadeService } from './save-submission.facade.service';
import { Task } from 'src/app/shared/models/task.model';
import { ITaskGroup } from 'src/app/shared/interfaces/taskGroup.interface';

@Component({
  selector: 'app-save-submission',
  templateUrl: './save-submission.component.html',
  styleUrls: ['./save-submission.component.scss']
})
export class SaveSubmissionComponent implements OnInit {
  saveTooltip: string;
  tasks: ITaskGroup;

  constructor(public saveSubmissionFacadeService: SaveSubmissionFacadeService) {

    this.saveTooltip = this.saveSubmissionFacadeService.getSaveShortCutToolTipText() // shortcut shown in the tooltip
   }

  ngOnInit(): void {
    this.loadTasks();
  }

  // save on local editing
  public saveLocal(): void {
    this.saveSubmissionFacadeService.saveLocal();
}

  public saveOnDB(): void {
    //this.openTaskDialog();
  }

  // public openTaskDialog(): void {
  //   if (Object.keys(this.tasks).length > 0) {
  //   	this.tasks.forEach( (t) => { t.isComplete = true; });
  // 		const dialogRef = this.dialog.open(TaskDialogComponent, {
  //             data: { tasks: this.tasks },
  //             width: '600px',
  //         });
  //         dialogRef.afterClosed().subscribe(result => {
  //             if (result) {
  //                 LocalStorage.save(this.editorService, this.editorService.layersService);
  //                 this.saveRevision(result === 'next');
  //             }
  //         });
  //     } else {
  //         this.saveRevision();
  //     }
   //}

	async loadTasks(){
    const imageId = await this.saveSubmissionFacadeService.editorService.imageId;
    this.tasks = await this.saveSubmissionFacadeService.getTasks(imageId);
  };

  // Retrieves the image types from the server
  // getTasks(): void {
  //     if (!this.editorService.imageLocal) {
  //         this.editorService.getTasks().subscribe(res => {
  //             this.tasks = res;
  //         });
  //     }
  // }
   //}

}
