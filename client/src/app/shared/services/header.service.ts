import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {map, filter} from 'rxjs/operators';
import { HttpEventType, HttpResponse } from '@angular/common/http';

// import * as chalk_ from 'chalk';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  progress: number;
  isShown: boolean;
  name?: string;
  isDownloading?: boolean;

  constructor() {}

  /**
   * show progress
   * @param showned: a progress bar can be showned or hidden
   * @param [Name]: name of the progress bar
   * @param [Download]: tells if the progress bar is downloading, True by default
   */
  cbShowProgress(isShown: boolean, Name?: string, isDownloading?: boolean) {
    this.isShown = isShown;
    this.name = Name;
    this.isDownloading = isDownloading;
  }

  /**
   * progress
   * @param Progress: progression number of the bar
   */
  cbProgress(Progress: number) {
    // console.log('HeaderService::cbProgress()');
    // console.log('%c this is colored', 'color: red; background: yellow;');

    this.progress = Progress;
  }

  /**
   * Displays progress: Display progress of a loading of datas in a progress bar
   * @param request: Observable<any> emiting datas
   * @param name: name of the progress bar
   * @param [download] : tells if the progress bar is downloading, True by default
   * @returns progress : Observable<any> response from the request
   */
  display_progress(request: Observable<any>, name: string, isDownloading= true): Observable<any> {
    // console.log('headerService::display_progress()');

    this.cbShowProgress(true, name, isDownloading);

    return request.pipe(filter(res => {
        if (res.type === HttpEventType.DownloadProgress) {
          // console.log('HeaderService::display_progress() (1)');

          if (this.cbProgress) {
            // console.log('%c if (this.cbProgress) (1)', 'color: red; background: yellow;');

            // console.log('%c res: ' + res.loaded
              // + ' / ' + res.total, 'color: red; background: yellow;');

            this.cbProgress(res.loaded / res.total);
          }
        } else if (res.type === HttpEventType.UploadProgress) {
          // console.log('HeaderService::display_progress() (2)');

          if (this.cbProgress) {
              this.cbProgress(res.loaded / res.total);
          }
        } else if (res.type === HttpEventType.Response) {
          // console.log('HeaderService::display_progress() (3)');

          this.cbShowProgress(false);
          return true;
        }
        return false;
    }), map(res => (res as HttpResponse<any>).body));
  }
}
