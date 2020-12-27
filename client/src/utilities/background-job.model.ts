import { isNullOrUndefined } from 'util';
import { BehaviorSubject, Observable,  } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { NgProbeToken } from '@angular/core';

export type JobState = "running" | "success" | "fail";
export  type JobType = "download" | "upload" | "computation";

export class BackgroundJob{

    readonly title: string;
    readonly description: string;
    readonly jobType: JobType;
    visible: BehaviorSubject<boolean>;
    progress: BehaviorSubject<number>;
    status: BehaviorSubject<string>;
    state: BehaviorSubject<JobState>;

    constructor(title:string, jobType:JobType, description:string=undefined, visible:boolean=true) {
        this.title = title;
        this.jobType = jobType;
        this.description = description;

        this.visible = new BehaviorSubject<boolean>(visible);
        this.progress = new BehaviorSubject<number>(-1);
        this.status = new BehaviorSubject<string>("");
        this.state = new BehaviorSubject<JobState>("running");
    }

    /**
     * Set the background job state to "success".
     * @param status: If provided, modify the job status.
     * @param autohide: If true, the background job is automatically hidden after 1.5s.
     */
    succeed(status:string=undefined, autohide=true){
        this.progress.next(1);
        this.state.next("success");
        if(!isNullOrUndefined(status))
            this.status.next(status);
        if(autohide){
            setTimeout(() => {
                this.visible.next(false);
            }, 1500);
        }
    }

    /**
     * Set the background job state to "fail".
     * @param status: if provided, modify the job status.
     * @param autohide: If true, the background job is automatically hidden after 1.5s.
     */
    failed(status:string=undefined, autohide=true){
        this.state.next("fail");
        if(!isNullOrUndefined(status))
            this.status.next(status);
        if(autohide){
            setTimeout(() => {
                this.visible.next(false);
            }, 1000);
        }
    }

    updateProgress(progress:number, status:string=undefined){
        if(progress>1)
            progress = 1;
        else if (progress < 0)
            progress = -1;
        this.progress.next(progress);
        if(!isNullOrUndefined(status))
            this.status.next(status);
    }

    waitCompletion(): Promise<boolean>{
        const s = this.state.getValue();
        if(s != "running")
            return Promise.resolve(s=="success");

        return this.state.pipe(filter(s=>s!="running"),
                               map(s=>s=="success"))
                         .toPromise();
    }
}