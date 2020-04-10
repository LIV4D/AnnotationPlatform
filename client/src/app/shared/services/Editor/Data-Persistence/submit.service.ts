// Angular
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

// Models
import { Task } from '../../../models/serverModels/task.model';

// rxjs
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

// Services
import { EditorService } from '../editor.service';
import { TasksService } from '../../Tasks/tasks.service';
import { LayersService } from '../layers.service';
import { AppService } from '../../app.service';
import { HeaderService } from '../../header.service';
import { LocalStorage } from '../local-storage.service';

// Material
import { MatDialogRef } from '@angular/material/dialog';
import { TaskType } from '../../../models/serverModels/taskType.model';
import { BridgeSingleton} from './bridge.service';
import { AnnotationData } from 'src/app/shared/models/serverModels/annotationData.model';

@Injectable({
		providedIn: 'root'
})
export class SubmitService {
    private submitedTask: Task;
    private submitedTaskType: TaskType
    bridgeSingleton: BridgeSingleton;

	constructor(
		private http: HttpClient,
		private layersService: LayersService,
		private appService: AppService,
		private headerService: HeaderService,
    private tasksService: TasksService,
    public editorService: EditorService,
		private router: Router
		){
      this.bridgeSingleton = BridgeSingleton.getInstance();
    }

	public getSubmitedTask(): Task{
		return this.submitedTask;
	}

	public setSubmitedTask(submitedTask:Task): void{
    this.submitedTask = submitedTask;
    this.bridgeSingleton.setCurrentTask(this.submitedTask);
  }

  public getSubmitedTaskType(): TaskType{
		return this.submitedTaskType;
	}

	public setSubmitedTaskType(submitedTaskType:TaskType): void{
    this.submitedTaskType = submitedTaskType;
	}

	// Return the shortcut command depending on the OS of the user's system
	getSaveShortCutToolTipText(): string{
		return navigator.platform.indexOf('Mac') === -1 ? '(Ctrl + S)' : '(Cmd + S)';
	}

  // Action made after having closed the task dialog box
	afterClosedTaskDialog(dialogRef: MatDialogRef<any, any>) {
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
        LocalStorage.clear();
				LocalStorage.save(this.editorService, this.layersService);
				// Load the next task when the user clicks << Save & load Next >>
				this.saveAnnotation(result === 'next');
			}
		});
	}

  // Navigate in another path and reload the window
	public navigateTo(path:string): void{
		this.router.navigate([path]).then(() => {setTimeout(() => { window.location.reload(); }, 10); });
  	}


	/**
  * Saves the annotation with the possibility of loading the next task
  * @param [loadNextHasBeenSelected] : Load the next task when true
  */
  public saveAnnotation(loadNextHasBeenSelected= false): void {
    // The annotation is saved on the DB
		this.saveToDB().subscribe(() => {
				if (loadNextHasBeenSelected) {
					// The next task is loaded on the editor
					this.tasksService.getNextTask().subscribe((data: any) => {
							if (data && data.annotation) {
                  this.setSubmitedTask(data)
									const imageId = data.annotation.image.id.toString();
									LocalStorage.resetImageId(imageId);
									setTimeout(() => { window.location.reload(); }, 10);
							} else {
								this.navigateTo('/tasks');
							}
					}, () => {
							this.navigateTo('/tasks');
            });
				} else {
					// No other task is loaded after the saving, it navigates in the previous page
					if (localStorage.getItem('previousPage') === 'tasks') {
							this.navigateTo('/tasks');
					} else {
							this.navigateTo('/gallery');
					}
				}
		}, error => {
				setTimeout(() => { window.location.reload(); }, 10);
		});
  }

	/**
  * Saves changes and then send the work on the database
  * @returns the request on the server
  */
  public saveToDB(): Observable<any> {
    // The background canvases has to exist
    if (!this.editorService.backgroundCanvas || !this.editorService.backgroundCanvas.originalCanvas) { return; }
        this.appService.loading = true;

    // The ophtalmologist work is saved
    if (this.layersService.unsavedChange) {
      LocalStorage.clear();
      LocalStorage.save(this.editorService, this.layersService);
      this.layersService.unsavedChange = false;
    }

    // Param
    const currentTask:Task = this.getSubmitedTask();
    const taskId = currentTask.taskId;
    console.log(taskId);

    // Body
    const annotationData:AnnotationData = this.layersService.getAnnotationDatas();
    const currentUser = JSON.parse(localStorage.getItem('currentUser')).user;
    const body = {
      data: annotationData,
      isComplete: this.getSubmitedTask().isComplete,
      user: currentUser
    };

    // Request
    const req = this.http.post(`/api/tasks/submit/${taskId}`, body, { reportProgress:true, observe: 'events'});
    const reqBody = this.headerService.display_progress(req, 'Saving Labels (do not refresh!)', false);
    reqBody.pipe( tap(() => { this.appService.loading = false; }));
    return reqBody;
  }
}
