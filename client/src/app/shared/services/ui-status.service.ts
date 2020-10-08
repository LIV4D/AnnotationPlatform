import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {map, filter} from 'rxjs/operators';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { BackgroundJob } from '../models/background-job.model';
import { delay } from '../misc/async-utils';


@Injectable({
    providedIn: 'root'
})
export class UIStatusService {

    progress: number;
    isShown: boolean;
    name?: string;
    isDownloading?: boolean;

    backgroundJobs: BackgroundJob[] = [];

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
        this.progress = Progress;
    }

    /**
     * Displays progress: Display progress of a loading of datas in a progress bar
     * @param request: Observable<any> emiting datas
     * @param name: name of the progress bar
     * @param [download] : tells if the progress bar is downloading, True by default
     * @returns progress : Observable<any> response from the request
     */
     display_progress(request: Observable<any>, name: string, isDownloading = true): Observable<any> {

        this.cbShowProgress(true, name, isDownloading);

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

    registerBackgroundJob(job: BackgroundJob){
        this.backgroundJobs.push(job);
        job.state.subscribe((state)=>{
            if(state!=="running")
                this.backgroundJobs.splice(this.backgroundJobs.indexOf(job),1);
        });
    }

    async waitForBackgroundJobsCompletion(){
        while(this.backgroundJobs){
            await this.backgroundJobs[0].waitCompletion();
            await delay(5);
        }
    }

}
