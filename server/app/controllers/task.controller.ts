import * as express from 'express';
import { inject, injectable } from 'inversify';
import { isNullOrUndefined } from 'util';

import TYPES from '../types';
import { IController } from './abstractController.controller';
import { TaskService } from '../services/task.service';
import { Task } from '../models/task.model';
import { ITask } from '../interfaces/ITask.interface';
import { throwIfNotAdmin } from '../utils/userVerification';
import { ISubmission } from '../../../common/interfaces';

@injectable()
export class TaskController implements IController {
    @inject(TYPES.TaskService)
    private taskService: TaskService;

    public setRoutes(app: express.Application): void {
        app.post('/api/tasks/create', this.createTask);
        app.put('/api/tasks/update/:taskId', this.updateTask);
        app.delete('/api/tasks/delete/:taskId', this.deleteTask);
        app.post('api/tasks/submit/:taskId', this.submitTask);

        // Get
        app.get('/api/tasks/get/:taskId([0-9]+)', this.getTask);
        app.get('/api/tasks/get/:taskId([0-9]+)/:attr([a-zA-Z][a-zA-Z0-9]+)', this.getTask);
        app.get('/api/tasks/get', this.getMultipleTasks);
        app.get('/api/tasks/get/:attr([a-zA-Z][a-zA-Z0-9]+)', this.getMultipleTasks);
        app.get('/api/tasks/get/next/:userId', this.getNextTaskByUser);

        // List
        app.get('/api/tasks/list', this.list);
        app.get('/api/tasks/list/:attr([a-zA-Z][a-zA-Z0-9]+)', this.list);
        app.get('/api/tasks/gallery/:userId', this.getUserGallery);

    }

    private createTask = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req.user);
        const newTask: ITask = {
            taskTypeId: req.body.taskTypeId,
            annotationId: req.body.annotationId,
            isComplete: req.body.isComplete,
            isVisible: req.body.isVisible,
            comment: req.body.comment,
            assignedUserId: req.body.assignedUserId,
            creatorId: req.user.id,
            lastModifiedTime: isNullOrUndefined(req.body.lastModifiedTime) ? new Date()  : req.body.lastModifiedTime,
        };
        this.taskService.createTask(newTask)
            .then(task => res.send(task.proto()))
            .catch(next);
    }

    private getTask = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.taskService.getTask(req.params.taskId, req.user)
            .then(task => res.send(this.export_task(task, req.params.attr)))
            .catch(next);
    }

    private getMultipleTasks = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const ids = req.body.ids;
        this.taskService.getTasks(ids)
            .then(tasks => res.send(tasks.map(task => this.export_task(task, req.params.attr))))
            .catch(next);
    }

    private list = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const filter = isNullOrUndefined(req.body.filter) ? {} : req.body.filter;
        this.taskService.getTasksByFilter(filter)
            .then(tasks => res.send(tasks.map(task => this.export_task(task, req.params.attr))))
            .catch(next);
    }

    private getUserGallery = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // if (req.user.id !== req.params.userId) {
        //     throwIfNotAdmin(req);
        // }
        const userId = req.params.userId as string;
        const page = req.query.page as number;
        const pageSize = req.query.pageSize as number;
        const isComplete = req.query.isCompleted;

        this.taskService
            .getUserGallery(userId, page, pageSize, isComplete)
            .then(taskGallery => this.taskService.getGalleryWithTaskTypeTitle(taskGallery))
            .then(taskGallery => res.send(taskGallery))
            .catch(next);
    }

    private async submitTask(req: express.Request, res: express.Response, next: express.NextFunction) {
        const submission: ISubmission = {
            taskId: req.params.taskId as number,
            data: req.body.data,
            uptime: req.body.uptime,
            isComplete: req.body.isComplete,
        };

        try {
            await this.taskService.submitTask(submission, req.user);
            res.sendStatus(204);
        } catch (error) {
            next(error);
        }
    }

    private export_task(task: Task, format: string): any {
        if (!isNullOrUndefined(task.assignedUser)) {
            delete task.assignedUser.password;
            delete task.assignedUser.salt;
        }
        delete task.creator.password;
        delete task.creator.salt;

        delete task.annotation.submitEvent.user.password;
        delete task.annotation.submitEvent.user.salt;

        switch (format) {
            case undefined: return task;
            case 'proto': return task.proto();
        }
        return null;
    }

    private getNextTaskByUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (req.user.id !== req.params.userId) {
            throwIfNotAdmin(req.user);
        }
        this.taskService.getTasksByFilter({ userId: req.params.userId })
            .then(tasks => {
                tasks.forEach((task) => {
                    if (!task.isComplete && !task.isVisible) {
                        res.send(task.proto());
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
            isVisible: isNullOrUndefined(req.body.isVisible) ? false : req.body.isVisible,
            isComplete: isNullOrUndefined(req.body.isComplete) ? false : req.body.isComplete,
            lastModifiedTime: isNullOrUndefined(req.body.lastModifiedTime) ? new Date() : req.body.lastModifiedTime,
        };

        this.taskService.updateTask(updatedTask, req.user)
            .then(task => res.send(task))
            .catch(next);
    }

    private deleteTask = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req.user);
        this.taskService.deleteTask(req.params.taskId, req.user)
            .then(() => res.sendStatus(204))
            .catch(next);
    }
}
