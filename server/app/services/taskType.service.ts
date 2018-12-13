import 'reflect-metadata';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { TaskType } from '../models/taskType.model';
import { TaskTypeRepository } from '../repository/taskType.repository';
import { createError } from '../utils/error';

@injectable()
export class TaskTypeService {
    @inject(TYPES.TaskTypeRepository)
    private taskTypeRepository: TaskTypeRepository;

    public async createTaskType(newTaskType: any): Promise<TaskType> {
        if (await this.taskTypeRepository.findByName(newTaskType.name)) {
            throw createError('This name is already taken.', 409);
        }
        const taskType = new TaskType();
        taskType.name = newTaskType.name;
        taskType.description = newTaskType.description;
        return await this.taskTypeRepository.create(taskType);
    }

    public async getTaskType(id: number): Promise<TaskType> {
        const taskType = await this.taskTypeRepository.find(id);
        if (taskType == null) {
            throw createError('This task type does not exist.', 404);
        }
        return taskType;
    }

    public async getTaskTypeByName(name: string): Promise<TaskType> {
        const taskType = await this.taskTypeRepository.findByName(name);
        if (taskType == null) {
            throw createError('This task type does not exist.', 404);
        }
        return taskType;
    }

    public async getTaskTypes(): Promise<TaskType[]> {
        return await this.taskTypeRepository.findAll();
    }
}
