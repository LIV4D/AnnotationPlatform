import { ITaskPriority } from './../interfaces/ITaskPriority.interface';
import * as express from 'express';
import { inject, injectable } from 'inversify';
import TYPES from '../types';
import { IController } from './abstractController.controller';
import { TaskBundleService } from '../services/taskBundle.service';
import { throwIfNotAdmin } from '../utils/userVerification';

@injectable()
export class TaskPriorityController implements IController {
    @inject(TYPES.TaskPriorityService)
    private taskBundleService: TaskBundleService;

    public setRoutes(app: express.Application): void {
        app.post('/api/taskPrioritys/create', this.createTaskPriority);
        app.put('/api/taskPrioritys/assign', this.assignTaskPriority);

        app.get('/api/taskPrioritys/get/tasksBundles', this.getTasksBundles);

    }

    private createTaskPriority = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req.user);
        const newTaskPriority: ITaskPriority = {
            taskId: req.body.taskId,
            userId: req.body.userId,
            priority: req.body.priority,
        };
        this.taskBundleService.createTask(newTaskPriority)
            .then(taskPriority => res.send(taskPriority.interface()))
            .catch(next);
    }

    private getTasksBundles = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const userId = req.query.userId as number;
        this.taskBundleService
            .getTasksBundles(userId)
            .then(tasksBundles => res.send(tasksBundles))
            .catch(next);
    }

    private assignTaskPriority = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const ids = req.body.ids;
        this.taskBundleService.assignTasks(ids, req.user)
            .then(() => res.sendStatus(204))
            .catch(next);
    }

}
