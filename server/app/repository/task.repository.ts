import * as path from 'path';
import * as fs from 'fs';
import TYPES from '../types';
import { ConnectionProvider } from './connection.provider';
import { injectable, inject } from 'inversify';
import { Task } from '../models/task.model';
import { ITaskGallery } from '../interfaces/gallery.interface';
import { ImageService } from '../services/image.service';
import { DeleteResult } from 'typeorm';

@injectable()
export class TaskRepository {
    @inject(TYPES.ImageService)
    private imageService: ImageService;
    private connectionProvider: ConnectionProvider;
    constructor(
        @inject('ConnectionProvider') connectionProvider: ConnectionProvider,
    ) {
        this.connectionProvider = connectionProvider;
    }

    public async findAll(): Promise<Task[]> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(Task).find();
    }

    public async create(task: Task): Promise<Task> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(Task).save(task);
    }

    public async find(id: number): Promise<Task> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(Task).findOne(id);
    }

    public async findByIds(ids: number[]): Promise<Task[]> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(Task).findByIds(ids);
    }

    public async findByFilter(filter: {userId?:number, imageId?:number}): Promise<Task[]>{
        let whereConditions = [];
        if(filter.imageId!==undefined) 
            whereConditions.push('task.annotation.image.id = '+filter.imageId.toString());
        if(filter.userId!==undefined) 
            whereConditions.push('task.assignedUser.id = '+filter.userId.toString());

        const connection = await this.connectionProvider();
        return await connection.getRepository(Task)
                               .createQueryBuilder('task')
                               .where(whereConditions.join(" AND "))
                               .getMany()
    }

    public async findTaskListByUser(userId: string, page: number = 0,
                                    pageSize: number = 0, completed: boolean = false): Promise<ITaskGallery[]> {
        const connection = await this.connectionProvider();
        const qb = await connection
        .getRepository(Task)
        .createQueryBuilder('task')
        .where('task.user.id = :id', { id: userId })
        .andWhere('task.isVisible = :visible', { visible: true });

        const tasks =  await qb.getMany();
        let taskList: ITaskGallery[];
        // Regroup tasks in taskGroups by image
        taskList = tasks.map(task => {
            let dataUrl = '';
            try {
                const base64Image = fs.readFileSync(path.resolve(this.imageService.getThumbnailPathSync(task.annotation.image.id)), 'base64');
                dataUrl = 'data:image/png;base64, ' + base64Image;
            } catch (error) {
                throw(error);
            }
            const taskGallery: ITaskGallery = {
                taskId: task.id,
                isComplete: task.isComplete,
                thumbnail: dataUrl,
                taskTypeTitle: task.taskType.title,
                imageId: task.annotation.image.id,
            };
            return taskGallery;
        });
        if (completed) {
            taskList = taskList.filter(taskGallery => taskGallery.isComplete);
        } else {
            taskList = taskList.filter(taskGallery => !taskGallery.isComplete);
        }
        // Select a subsection of our taskGroups, according to pageSize and page number
        if (page !== 0 && pageSize !== 0) {
            taskList = taskList.splice(pageSize * page, pageSize);
        }
        return await taskList;
    }

    public async delete(task: Task): Promise<DeleteResult> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(Task).delete(task);
    }
}
