import 'reflect-metadata';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { TaskGroup } from '../models/taskGroup.model';
import { TaskGroupRepository } from '../repository/taskGroup.repository';
import { createError } from '../utils/error';

@injectable()
export class TaskGroupService {
    @inject(TYPES.TaskGroupRepository)
    private taskGroupRepository: TaskGroupRepository;

    public async createTaskGroup(newTaskGroup: any): Promise<TaskGroup> {
        if (await this.taskGroupRepository.findByTitle(newTaskGroup.title)) {
            throw createError('This name is already taken.', 409);
        }
        const taskGroup = new TaskGroup();
        taskGroup.title = newTaskGroup.title;
        taskGroup.description = newTaskGroup.description;
        return await this.taskGroupRepository.create(taskGroup);
    }

    public async updateTaskGroup(taskGroupId: number, title= '', description= ''): Promise<TaskGroup> {
        const taskGroup = await this.taskGroupRepository.find(taskGroupId);
        if (title !== '') {
            taskGroup.title = title;
        }
        if (description !== '') {
            taskGroup.description = description;
        }

        return await this.taskGroupRepository.create(taskGroup);
    }

    public async getTaskGroup(id: number): Promise<TaskGroup> {
        const taskGroup = await this.taskGroupRepository.find(id);
        if (taskGroup == null) {
            throw createError('This task type does not exist.', 404);
        }
        return taskGroup;
    }

    public async getTaskGroupByName(title: string): Promise<TaskGroup> {
        const taskGroup = await this.taskGroupRepository.findByTitle(title);
        if (taskGroup == null) {
            throw createError('This task type does not exist.', 404);
        }
        return taskGroup;
    }

    public async getTaskGroups(): Promise<TaskGroup[]> {
        return await this.taskGroupRepository.findAll();
    }
}
