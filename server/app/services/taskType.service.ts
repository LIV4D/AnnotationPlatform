import { inject, injectable } from 'inversify';
import { DeleteResult } from 'typeorm';

import TYPES from '../types';
import { TaskType, ITaskType } from '../models/taskType.model';
import { TaskTypeRepository } from '../repository/taskType.repository';
import { createError } from '../utils/error';


@injectable()
export class TaskTypeService {
    @inject(TYPES.TaskTypeRepository)
    private taskTypeRepository: TaskTypeRepository;

    public async createTaskType(newTaskType: ITaskType): Promise<TaskType> {
        if (await this.taskTypeRepository.findByTitle(newTaskType.title)) {
            throw createError('This name is already taken.', 409);
        }
        const taskType = TaskType.fromInterface(newTaskType);
        return await this.taskTypeRepository.create(taskType);
    }

    public async updateTaskType(updatedTaskType: ITaskType): Promise<TaskType> {
        const oldTaskType = await this.getTaskType(updatedTaskType.id);
        oldTaskType.update(updatedTaskType);
        return await this.taskTypeRepository.create(oldTaskType);
    }

    public async deleteTaskType(id: number): Promise<DeleteResult> {
        const taskType = await this.getTaskType(id);        
        return await this.taskTypeRepository.delete(taskType);
    }


    public async getTaskType(id: number): Promise<TaskType> {
        const taskType = await this.taskTypeRepository.find(id);
        if (taskType == null) {
            throw createError('This task type does not exist.', 404);
        }
        return taskType;
    }

    public async getTaskTypes(ids: number[]): Promise<TaskType[]> {
        const taskType = await this.taskTypeRepository.findByIds(ids);
        if (taskType == null) {
            throw createError('This task type does not exist.', 404);
        }
        return taskType;
    }

    public async getAllTaskTypes(): Promise<TaskType[]> {
        return await this.taskTypeRepository.findAll();
    }

    public async getTasTypeByName(title: string): Promise<TaskType> {
        const taskType = await this.taskTypeRepository.findByTitle(title);
        if (taskType == null) {
            throw createError('This task type does not exist.', 404);
        }
        return taskType;
    }
}
