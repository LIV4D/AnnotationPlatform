import 'reflect-metadata';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { TaskType } from '../models/taskType.model';
import { TaskTypeRepository } from '../repository/taskType.repository';
import { createError } from '../utils/error';
import { DeleteResult } from 'typeorm';
import { isNullOrUndefined } from 'util';

@injectable()
export class TaskTypeService {
    @inject(TYPES.TaskTypeRepository)
    private taskTypeRepository: TaskTypeRepository;

    public async createTaskType(newTaskType: any): Promise<TaskType> {
        if (await this.taskTypeRepository.findByTitle(newTaskType.title)) {
            throw createError('This name is already taken.', 409);
        }
        const taskType = new TaskType();
        taskType.title = newTaskType.title;
        taskType.description = newTaskType.description;
        return await this.taskTypeRepository.create(taskType);
    }

    public async updateTaskType(taskTypeId: number, title= '', description= ''): Promise<TaskType> {
        const taskType = await this.taskTypeRepository.find(taskTypeId);
        if (title !== '') {
            taskType.title = title;
        }
        if (description !== '') {
            taskType.description = description;
        }

        return await this.taskTypeRepository.create(taskType);
    }

    public async getTaskType(id: number): Promise<TaskType> {
        const taskType = await this.taskTypeRepository.find(id);
        if (taskType == null) {
            throw createError('This task type does not exist.', 404);
        }
        return taskType;
    }

    public async getTasTypeByName(title: string): Promise<TaskType> {
        const taskType = await this.taskTypeRepository.findByTitle(title);
        if (taskType == null) {
            throw createError('This task type does not exist.', 404);
        }
        return taskType;
    }

    public async getTaskTypes(): Promise<TaskType[]> {
        return await this.taskTypeRepository.findAll();
    }

    public async deleteTaskType(id: string): Promise<DeleteResult> {
        const taskType = await this.getTaskType(Number(id));
        if (isNullOrUndefined(taskType)) {
            throw createError('This task type does not exist.', 404);
        }
        return await this.taskTypeRepository.delete(taskType);
    }
}
