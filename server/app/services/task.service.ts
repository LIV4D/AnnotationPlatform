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

@injectable()
export class TaskService {
    @inject(TYPES.TaskRepository)
    private taskRepository: TaskRepository;
    @inject(TYPES.ImageService)
    private imageService: ImageService;
    @inject(TYPES.RevisionService)
    private revisionService: RevisionService;

    public async createTask(newTask: any): Promise<Task> {
        const task = new Task();
        if (newTask.isVisible !== undefined) {
            task.isVisible = newTask.isVisible;
        } else {
            task.isVisible = true;
        }
        if (newTask.isComplete !== undefined) {
            task.isComplete = newTask.isComplete;
        } else {
            task.isComplete = false;
        }
        task.user = { id: newTask.userId } as any;
        task.image = { id: newTask.imageId } as any;
        task.taskGroup = { id: newTask.taskGroupId } as any;

        // Create revision for user for image when creating task if it does not already exist
        try {
            await this.revisionService.getRevisionForUserForImage(task.user.id, task.image.id);
        } catch (error) {
            if (error.status === 404) {
                await this.imageService.getImage(newTask.imageId).then(imageResult => {
                    const newRevision = {
                        svg: imageResult.baseRevision,
                        userId: task.user.id,
                        imageId: imageResult.id,
                    };
                    return this.revisionService.createRevision(newRevision);
                });
            } else {
                throw error;
            }
        }
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
        oldTask.active = updatedTask.active;
        oldTask.completed = updatedTask.completed;
        return await this.taskRepository.update(oldTask);
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
