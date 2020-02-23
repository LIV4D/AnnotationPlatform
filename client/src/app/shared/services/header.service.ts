import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { HttpEventType, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  constructor() { }

  cbProgress: (progress: number) => void;
  cbShowProgress: (show: boolean, name?: string, download?: boolean) => void;

  display_progress(request: Observable<any>, name: string, download= true): Observable<any> {
      this.cbShowProgress(true, name, download);
      return request.pipe(filter(res => {
          if (res.type === HttpEventType.DownloadProgress) {
              if (this.cbProgress) {
                  this.cbProgress(res.loaded / res.total);
              }
          } else if (res.type === HttpEventType.UploadProgress) {
              if (this.cbProgress) {
                  this.cbProgress(res.loaded / res.total);
              }
          } else if (res.type === HttpEventType.Response) {
              this.cbShowProgress(false);
              return true;
          }
          return false;
      }), map(res => (res as HttpResponse<any>).body));
  }
}
