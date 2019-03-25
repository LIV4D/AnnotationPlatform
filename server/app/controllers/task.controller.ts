import * as express from 'express';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { IRegistrableController } from './registrable.controller';
import { TaskService } from '../services/task.service';
import { throwIfNotAdmin } from '../utils/userVerification';
import { createError } from '../utils/error';

@injectable()
export class TaskController implements IRegistrableController {
    @inject(TYPES.TaskService)
    private taskService: TaskService;

    public register(app: express.Application): void {
        // Collection
        app.get('/api/tasks', this.getTasks);
        app.get('/api/tasks/list', this.listTasks);
        app.get('/api/tasklist/:userId', this.getTaskList);
        app.post('/api/tasks', this.createTask);
        app.get('/api/tasks/findByUser/:userId', this.getTasksByUser);
        app.get('/api/tasks/list/:userId', this.listTasksByUser);
        app.get('/api/tasks/:userId/next/', this.getNextTaskByUser);
        app.get('/api/tasks/:userId/:imageId/', this.getTasksByUserByImage);

        // Element
        app.get('/api/tasks/:taskId', this.getTask);
        app.put('/api/tasks/:taskId', this.updateTask);
        app.delete('/api/tasks/:taskId', this.deleteTask);
    }

    private getTasks = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.taskService.getTasks()
            .then(tasks => res.send(tasks))
            .catch(next);
    }

    private listTasks = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.taskService.getTasks()
            .then(tasks => {
                const tasksPrototype = tasks.map(t => t.prototype());
                res.send(tasksPrototype);
            })
            .catch(next);
    }

    private createTask = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        let taskActive = true;
        let taskCompleted = false;
        if (req.body.active !== undefined) {
            taskActive = (req.body.active === 'true');
        }
        if (req.body.completed !== undefined) {
            taskCompleted = (req.body.completed === 'true');
        }
        const newTask = {
            active: taskActive,
            completed: taskCompleted,
            imageId: req.body.imageId,
            taskTypeId: req.body.taskTypeId,
            userId: req.body.userId,
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

    private listTasksByUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (req.user.id !== req.params.userId) {
            throwIfNotAdmin(req);
        }
        this.taskService.getTasksByUser(req.params.userId)
            .then(task => {
                const tasksPrototype = task.map(t => t.prototype());
                res.send(tasksPrototype);
            })
            .catch(next);
    }

    private getNextTaskByUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (req.user.id !== req.params.userId) {
            throwIfNotAdmin(req);
        }
        this.taskService.getTasksByUser(req.params.userId)
            .then(tasks => {
                for (const task of tasks) {
                    if (!task.completed) {
                        res.send(task.prototype());
                        return;
                    }
                }
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
        const updatedTask: any = {
            id: req.params.taskId,
        };
        if (req.body.active) { updatedTask.active = (req.body.active === 'true'); }
        if (req.body.completed) { updatedTask.completed = (req.body.completed === 'true'); }
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
