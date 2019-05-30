import 'reflect-metadata';
import TYPES from '../types';
import * as express from 'express';
import { ImageService } from '../services/image.service';
import { inject, injectable } from 'inversify';
import { Task } from '../models/task.model';
import { TaskRepository } from '../repository/task.repository';
import { RevisionService } from './revision.service';
import { ITaskList } from '../interfaces/taskList.interface';
import { createError } from '../utils/error';
import { throwIfNotAdmin } from '../utils/userVerification';
import { isUndefined } from 'util';
import { userInfo } from 'os';

@injectable()
export class TaskService {
    @inject(TYPES.TaskRepository)
    private taskRepository: TaskRepository;
    @inject(TYPES.ImageService)
    private imageService: ImageService;
    @inject(TYPES.RevisionService)
    private annotationService: AnnotationService;

    public async createTask(newTask: any): Promise<Task> {
        const task = new Task();
        task.user = { id: newTask.userId } as any;
        task.image = { id: newTask.imageId } as any;
        task.annotation = { id: newTask.annotationId } as any;
        task.taskGroup = { id: newTask.taskGroupId } as any;
        task.isComplete = newTask.isComplete;
        task.isVisible = newTask.isVisible;

        // TODO: Create revision for user for image when creating task if it does not already exist
        return await this.taskRepository.create(task);
    }

    public async getTask(id: number, req: express.Request): Promise<Task> {
        const task = await this.taskRepository.find(id);
        if (task == null) {
            throw createError('This task does not exist.', 404);
        }
        if (task.user.id !== req.user.id) {
            throwIfNotAdmin(req);
        }
        return task;
    }

    public async getTasks(): Promise<Task[]> {
        return await this.taskRepository.findAll();
    }

    public async getTasksByUser(userId: string): Promise<Task[]> {
        return await this.taskRepository.findTasksByUser(userId);
    }

    public async updateTask(updatedTask: any, req: express.Request) {
        const oldTask = await this.taskRepository.find(updatedTask.id);
        if (oldTask == null) {
            throw createError('This task does not exist.', 404);
        }
        if (oldTask.user.id !== req.user.id) {
            throwIfNotAdmin(req);
        }
        oldTask.isVisible = updatedTask.isVisible;
        oldTask.isComplete = updatedTask.isComplete;
        return await this.taskRepository.create(oldTask);
    }

    public async getTasksByUserByImage(userId: string, imageId: number): Promise<Task[]> {
        return await this.taskRepository.findTasksByUserByImage(userId, imageId);
    }

    public async getTaskList(userId: string, page?: number, pageSize?: number, completed?: boolean): Promise<ITaskList> {
        return await this.taskRepository.findTaskListByUser(userId, page, pageSize, completed);
    }

    public async deleteTask(id: number) {
        const task = await this.taskRepository.find(id);
        if (task == null) {
            throw createError('This task does not exist.', 404);
        }
        return await this.taskRepository.delete(task);
    }
}
