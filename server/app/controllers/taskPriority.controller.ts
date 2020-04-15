import { ITaskPriority } from './../interfaces/ITaskPriority.interface';
import * as express from 'express';
import { inject, injectable } from 'inversify';
import TYPES from '../types';
import { IController } from './abstractController.controller';
import { TaskBundleService } from '../services/taskBundle.service';
import { throwIfNotAdmin } from '../utils/userVerification';
import { User } from '../models/user.model';

@injectable()
export class TaskPriorityController implements IController {
    @inject(TYPES.TaskPriorityService)
    private taskBundleService: TaskBundleService;

    public setRoutes(app: express.Application): void {
        app.post('/api/taskPrioritys/create', this.createTaskPriority);
        app.put('/api/taskPrioritys/update/:taskPriorityId', this.updateTaskPriority);
        app.delete('/api/taskPrioritys/delete/:taskPriorityId', this.deleteTaskPriority);

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
        this.taskBundleService.createTaskPriority(newTaskPriority)
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
        this.taskBundleService.assignTasks(ids, req.user as User)
            .then(() => res.sendStatus(204))
            .catch(next);
    }

    /**
     * Update a task priority from the task priority Id given in params
     */
    private updateTaskPriority = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const updatedTaskPriority: ITaskPriority = {
            taskId: req.body.taskId,
            userId: req.body.userId,
            priority: req.body.priority,
        };

        this.taskBundleService.updateTaskPriority(updatedTaskPriority)
            .then(taskPriority => res.send(taskPriority))
            .catch(next);
    }

    /**
     * Deletes the specifed task priority
     *
     * Requires the task priority's id in the route's parameters.
     * @param req an express request with task data
     * @param res an express response where the task data will be put
     * @param next is the following function in the express application
     */
    private deleteTaskPriority = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req.user);
        const deletedTaskPriority: ITaskPriority = {
            taskId: req.body.taskId,
            userId: req.body.userId
        };
        this.taskBundleService.deleteSpecificTaskPriority(deletedTaskPriority)
            .then(() => res.sendStatus(204))
            .catch(next);
    }

}
