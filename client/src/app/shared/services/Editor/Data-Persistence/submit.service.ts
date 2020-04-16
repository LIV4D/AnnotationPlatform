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
import { TasksService } from '../../Tasks/tasks.service';
import { LayersService } from '../layers.service';
import { AppService } from '../../app.service';
import { HeaderService } from '../../header.service';
import { LocalStorage } from '../local-storage.service';
import { CanvasDimensionService } from '../canvas-dimension.service';

// Material
import { MatDialogRef } from '@angular/material/dialog';
import { AnnotationData } from 'src/app/shared/models/serverModels/annotationData.model';
import { LoadingService } from './loading.service';

// File Saver
import { saveAs } from 'file-saver';
import { CommentBoxSingleton } from 'src/app/shared/models/comment-box-singleton.model';


@Injectable({
		providedIn: 'root'
})

/**
 * The service organize methods with the purpose of submiting an annotation
 * throught the button Submit
 */
export class SubmitService {

  svgBox: HTMLDivElement;
  localSVGName: string;

	constructor(
		private http: HttpClient,
		private layersService: LayersService,
		private appService: AppService,
		private headerService: HeaderService,
    private tasksService: TasksService,
    private loadingService: LoadingService,
    public canvasDimensionService: CanvasDimensionService,
		private router: Router
		){}

	// Return the shortcut command depending on the OS of the user's system
	getSaveShortCutToolTipText(): string{
		return navigator.platform.indexOf('Mac') === -1 ? '(Ctrl + S)' : '(Cmd + S)';
	}

  // Action made after having closed the task dialog box
	afterClosedTaskDialog(dialogRef: MatDialogRef<any, any>) {
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				LocalStorage.save(this.loadingService, this.layersService);
				// Load the next task when the user clicks << Save & load Next >>
				this.saveAnnotation(result === 'next');
			}
		});
	}


  //Saves the annotation with the possibility of loading the next task
  // @param [loadNextHasBeenSelected] : Load the next task when true
  public saveAnnotation(loadNextHasBeenSelected= false): void {
    // The annotation is saved on the DB
		this.saveToDB().subscribe(() => {
				if (loadNextHasBeenSelected) {
          this.loadNextTaskOnEditor();
				} else {
          this.leaveEditor(); // Leaves the editor when LoadNext is not chosen
					}
		}, error => {
				setTimeout(() => { window.location.reload(); }, 10);
		});
  }

  // Load the next task on the editor
  public loadNextTaskOnEditor(): void{
    this.tasksService.getNextTask().subscribe((data: any) => {
      if (data && data.annotation) {
          this.loadingService.setTaskLoaded(data);
          const nextImageId = data.annotation.image.id.toString();
          LocalStorage.resetImageId(nextImageId);
          setTimeout(() => { window.location.reload(); }, 10);
      } else {
        this.navigateTo('/tasks'); // we return to the task menu if there is no more task to load
      }}, () => {
      this.navigateTo('/tasks');
    });
  }

  // Navigate in another path and reload the window
  public navigateTo(path:string): void{
		this.router.navigate([path]).then(() => {setTimeout(() => { window.location.reload(); }, 10); });
  }

  // Leaves the editor menu
  public leaveEditor(): void{
  if (localStorage.getItem('previousPage') === 'tasks') {
    this.navigateTo('/tasks');
  } else {
    this.navigateTo('/gallery');
   }
  }

  //  Saves changes and then send the work on the database
  //  @returns the request on the server
  public saveToDB(): Observable<any> {
    // The background canvases has to exist
    if (!this.canvasDimensionService.backgroundCanvas || !this.canvasDimensionService.backgroundCanvas.originalCanvas) { return; }
        this.appService.loading = true;

    // The ophtalmologist work is saved
    if (this.layersService.unsavedChange) {
      LocalStorage.save(this.loadingService, this.layersService);
      this.layersService.unsavedChange = false;
    }

    // Param
    const taskLoadedId: number = this.loadingService.getTaskLoaded().taskId;

    // Body
    const annotationData:AnnotationData = this.layersService.getAnnotationDatas();
    const currentUser = JSON.parse(localStorage.getItem('currentUser')).user;
    const commentData:string[] = CommentBoxSingleton.getInstance().getTextAreaValues();
    console.log('%c commentData : ' + commentData, 'color:black; background:yellow;');

    const body = {
      comments: commentData,
      data: annotationData,
      isComplete: this.loadingService.getTaskLoaded().isComplete,
      isVisible: this.loadingService.getTaskLoaded().isVisible,
      user: currentUser
    };

    // Request
    const req = this.http.post(`/api/tasks/submit/${taskLoadedId}`, body, { reportProgress:true, observe: 'events'});
    const reqBody = this.headerService.display_progress(req, 'Saving Labels (do not refresh!)', false);
    reqBody.pipe( tap(() => { this.appService.loading = false; }));
    return reqBody;
  }

  saveSVGFile(): void {
    if (!this.canvasDimensionService.backgroundCanvas || !this.canvasDimensionService.backgroundCanvas.originalCanvas) {
      return;
    }
    this.layersService.biomarkerCanvas.forEach((b) => {
      const elem = document.getElementById(b.id.replace('annotation-', ''));
      const url = b.currentCanvas.toDataURL();
      elem.setAttribute('width', '100%');
      elem.setAttribute('height', '100%');
      elem.setAttribute('xlink:href', url);
    });
    const header = '<?xml version="1.0" encoding="UTF-8"?>';
    const blob = new Blob(
      [header + this.svgBox.getElementsByTagName('svg')[0].outerHTML],
      { type: 'image/svg+xml' }
    );
    saveAs(blob, this.localSVGName);
  }

}
