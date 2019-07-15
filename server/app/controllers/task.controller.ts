import * as express from 'express';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { IController } from './abstractController.controller';
import { TaskService } from '../services/task.service';
import { throwIfNotAdmin } from '../utils/userVerification';
import { ITask, ISubmission } from '../../../common/common_interfaces/interfaces';
import { isNullOrUndefined } from 'util';
import { Task } from '../models/task.model';

@injectable()
export class TaskController implements IController {
    @inject(TYPES.TaskService)
    private taskService: TaskService;

    public setRoutes(app: express.Application): void {
        // Collection
        app.post('/api/tasks/create', this.createTask);
        app.put('/api/tasks/update/:taskId', this.updateTask);
        app.delete('/api/tasks/delete/:taskId', this.deleteTask);
        app.get('/api/tasks/list', this.listTasks);
        app.get('/api/tasks/list/:userId', this.listTasks);
        app.get('/api/tasks/gallery/:userId', this.getUserGallery);
        app.post('api/tasks/submit/:taskId', this.submitTask);
        app.get('/api/tasks/download/:taskId', this.downloadTask);
        // app.post('api/tasks/assign/:userId', this.assignTask);
        app.get('/api/tasks/:userId/next/', this.getNextTaskByUser);

        // Element
        app.get('/api/tasks/:taskId', this.getTask);
    }

    private createTask = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        let isTaskVisible = true;
        let isTaskCompleted = false;
        if (!isNullOrUndefined(req.body.visible)) {
            isTaskVisible = (req.body.visible === 'true');
        }
        if (!isNullOrUndefined(req.body.isComplete)) {
            isTaskCompleted = (req.body.completed === 'true');
        }
        const newTask: ITask = {
            isVisible: isTaskVisible,
            isComplete: isTaskCompleted,
            imageId: req.body.imageId,
            taskGroupId: req.body.taskGroupId,
            userId: req.body.userId,
            annotationId: req.body.annotationId,
            comment: req.body.comment,
        };
        this.taskService.createTask(newTask)
            .then(task => res.json(task.id))
            .catch(next);
    }

    private getTask = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.taskService.getTask(req.params.taskId, req)
            .then(task => res.send(task))
            .catch(next);
    }

    private async listTasks(req: express.Request, res: express.Response, next: express.NextFunction) {
        // check if it's list by user or not

        // TODO: uncomment all throwIfnotAdmin later
        try {
            let tasks: Task[];
            const isListByUser = !isNullOrUndefined(req.params.userId);
            if (isListByUser) {
                if (req.params.userId !== req.user.id) {
                    // throwIfNotAdmin(req);
                }
                // list by user:
                tasks = await this.taskService.getTasksByUser(req.params.userId);
            } else {
                // throwIfNotAdmin(req);
                tasks = await this.taskService.getTasks();
            }
            const taskPrototypes = tasks.map(t => t.prototype());
            taskPrototypes.forEach(prototype => {
                delete prototype.isVisible;
                delete prototype.annotationId;
                delete prototype.userId;
            });
            res.send(taskPrototypes);
        } catch (error) {
            next(error);
        }
    }

    private async getUserGallery(req: express.Request, res: express.Response, next: express.NextFunction) {
        if (req.user.id !== req.params.userId) {
            throwIfNotAdmin(req);
        }
        try {
            const taskGallery = await this.taskService
                            .getUserGallery(req.params.userId, req.query.page, req.query.pageSize, req.query.isComplete);
            res.send(taskGallery);
        } catch (error) {
            next(error);
        }
    }

    private async submitTask(req: express.Request, res: express.Response, next: express.NextFunction) {
        const submission: ISubmission = {
            taskId: req.params.taskId as number,
            userSubmitterId: req.user.id,
            data: req.body.data,
            comment: req.body.comment,
            isComplete: false,
            uptime: req.body.uptime,
        };
        if (!isNullOrUndefined(req.body.isComplete)) {
            submission.isComplete = req.body.isComplete === 'true';
        }
        try {
            await this.taskService.submitTask(submission);
            res.sendStatus(204);
        } catch (error) {
            next(error);
        }
    }

    private async downloadTask(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const downloadedTask = await this.taskService.downloadTask(req.params.taskId);
            res.send(downloadedTask);
        } catch (error) {
            next(error);
        }
    }

    private getNextTaskByUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (req.user.id !== req.params.userId) {
            throwIfNotAdmin(req);
        }
        this.taskService.getTasksByUser(req.params.userId)
            .then(tasks => {
                tasks.forEach((task) => {
                    if (!task.isComplete && !task.isVisible) {
                        res.send(task.prototype());
                        return;
                    }
                });
                res.send(null);
            })
            .catch(next);
    }

    private updateTask = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const updatedTask: ITask = {
            id: req.params.taskId,
            isVisible: false,
            isComplete: false,
        };
        if (!isNullOrUndefined(req.body.isVisible)) {
            updatedTask.isVisible = (req.body.isVisible === 'true');
        }
        if (!isNullOrUndefined(req.body.isComplete)) {
            updatedTask.isComplete = (req.body.isComplete === 'true');
        }
        this.taskService.updateTask(updatedTask, req)
            .then(task => res.send(task))
            .catch(next);
    }

    private deleteTask = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.taskService.deleteTask(req.params.taskId)
            .then(() => res.sendStatus(204))
            .catch(next);
    }
}
