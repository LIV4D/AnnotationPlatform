import { ITaskPriority } from './../interfaces/ITaskPriority.interface';
import * as express from 'express';
import { inject, injectable } from 'inversify';
import TYPES from '../types';
import { IController } from './abstractController.controller';
import { TaskPriorityService } from '../services/taskPriority.service';
import { throwIfNotAdmin } from '../utils/userVerification';

@injectable()
export class TaskPriorityController implements IController {
    @inject(TYPES.TaskPriorityService)
    private taskPriorityService: TaskPriorityService;

    public setRoutes(app: express.Application): void {
        app.post('/api/taskPrioritys/create', this.createTaskPriority);

        app.get('/api/taskPrioritys/get/tasksBundles', this.getTasksBundles);

    }

    private createTaskPriority = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req.user);
        const newTaskPriority: ITaskPriority = {
            taskId: req.body.taskId,
            userId: req.body.userId,
            priority: req.body.priority,
        };
        this.taskPriorityService.createTask(newTaskPriority)
            .then(taskPriority => res.send(taskPriority.interface()))
            .catch(next);
    }

    private getTasksBundles = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const userId = req.query.userId as number;
        this.taskPriorityService
            .getTasksBundles(userId)
            .then(tasksBundles => res.send(tasksBundles))
            .catch(next);
    }

}
