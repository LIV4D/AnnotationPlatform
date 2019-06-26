import * as express from 'express';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { IController } from './abstractController.controller';
import { TaskService } from '../services/task.service';
import { throwIfNotAdmin } from '../utils/userVerification';
import { createError } from '../utils/error';
import { ITask } from '../../../common/common_interfaces/interfaces';
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
        // app.get('/api/tasks', this.getTasks);
        // app.get('/api/tasklist/:userId', this.getTaskList);
        app.post('api/tasks/submit/:taskId', this.submitTask);
        app.get('/api/tasks/download/:taskId'.this.downloadTask);
        app.post('api/tasks/assign/:userId', this.assignTask);
        // app.get('/api/tasks/findByUser/:userId', this.getTasksByUser);
        app.get('/api/tasks/:userId/next/', this.getNextTaskByUser);
        // app.get('/api/tasks/:userId/:imageId/', this.getTasksByUserByImage);

        // Element
        app.get('/api/tasks/:taskId', this.getTask);
    }

    private getTasks = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.taskService.getTasks()
            .then(tasks => res.send(tasks))
            .catch(next);
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

    private getTasksByUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (req.user.id !== req.params.userId) {
            throwIfNotAdmin(req);
        }
        this.taskService.getTasksByUser(req.params.userId)
            .then(task => res.send(task))
            .catch(next);
    }

    private async listTasks(req: express.Request, res: express.Response, next: express.NextFunction) {
        // check if it's list by user or not
        try {
            let tasks: Task[];
            const isListByUser = !isNullOrUndefined(req.params.userId);
            if (isListByUser) {
                if (req.params.userId !== req.user.id) {
                    throwIfNotAdmin(req);
                }
                // list by user:
                tasks = await this.taskService.getTasksByUser(req.params.userId);
            } else {
                throwIfNotAdmin(req);
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
        return await this.taskService.getUserGallery(req.params.userId, req.query.page, req.query.pageSize, req.query.isComplete)
        .catch(next);
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

    private getTaskList = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (req.query.completed) { req.query.completed = (req.query.completed === 'true'); }
        if (req.user.id !== req.params.userId) {
            throwIfNotAdmin(req);
        }
        this.taskService.getTaskList(req.params.userId, req.query.page, req.query.pageSize, req.query.completed)
            .then(taskList => res.send(taskList))
            .catch(next);
    }

    private getTasksByUserByImage = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (req.user.id !== req.params.userId) {
            throwIfNotAdmin(req);
        }
        if (!Number(req.params.imageId)) {
            throw createError('Image with this id does not exist', 404);
        }
        this.taskService.getTasksByUserByImage(req.params.userId, req.params.imageId)
            .then(tasks => res.send(tasks));
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
