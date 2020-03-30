import { Injectable } from '@angular/core';
import { SubmitService } from 'src/app/shared/services/Editor/submit.service';
import { Task } from 'src/app/shared/models/serverModels/task.model';

@Injectable({
  providedIn: 'root'
})
export class WidgetFacadeService {


    constructor(private submitService: SubmitService) { }

    public getCurrentTask() : Task {
        return this.submitService.getCurrentTask();
    }
}
