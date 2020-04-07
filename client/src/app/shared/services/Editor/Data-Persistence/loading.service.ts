// Angular
import { Injectable } from '@angular/core';
import { Image as ImageServer } from '../../../models/serverModels/image.model';
import { Router } from '@angular/router';
import { EditorService } from '../editor.service';
import { HeaderService } from '../../header.service';
import { HttpClient } from '@angular/common/http';

// Services


// Material
import { MatDialogRef } from '@angular/material/dialog';

@Injectable({
		providedIn: 'root'
})
export class LoadingService {

	constructor(
    private http: HttpClient,
    private headerService: HeaderService,
    public editorService: EditorService,
    public router: Router,

    ){}

  // Function called from gallery/tasks to load a new image and redirect to editor
  loadImageFromServer(imageId: string): void {
    const req = this.http.get<ImageServer>(`/api/images/get/${imageId}/`, {
      observe: 'events',
      reportProgress: true,
    });
    this.headerService
      .display_progress(req, 'Downloading: Image')
      .subscribe((res) => {
        console.log(res);
        this.editorService.imageId = null;
        this.editorService.imageServer = res;

        this.setImageId(this.editorService.imageId);
        this.router.navigate(['/' + 'editor']);
      });
  }

  setImageId(id: string): void {
    this.editorService.imageId = id;
  }

}
