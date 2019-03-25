import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import {map, filter} from 'rxjs/operators';

@Injectable()
export class HeaderService {

    cbProgress: (progress: number) => void;
    cbShowProgress: (show: boolean, name?: string, download?: boolean) => void;

    constructor() {
    }

    display_progress(request: Observable<any>, name: string, download= true): Observable<any> {
        request.subscribe(res => {
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
            }
        });
        this.cbShowProgress(true, name, download);
        return request.pipe(filter(res => res.type === HttpEventType.Response),
                            map(res => (res as HttpResponse<any>).body));
    }

}
