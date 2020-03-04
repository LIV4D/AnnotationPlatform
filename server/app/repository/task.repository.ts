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
        const repository =  (await this.connectionProvider()).getRepository(Task);
        return await repository.find();
    }

    public async create(task: Task): Promise<Task> {
        const repository =  (await this.connectionProvider()).getRepository(Task);
        task = await repository.save(task);
        return repository.findOne(task.id); // Reload task
    }

    public async find(id: number): Promise<Task> {
        const repository =  (await this.connectionProvider()).getRepository(Task);
        return await repository.findOne(id);
    }

    public async findByIds(ids: number[]): Promise<Task[]> {
        const repository =  (await this.connectionProvider()).getRepository(Task);
        return await repository.findByIds(ids);
    }

    public async findByFilter(filter: {userId?: number, imageId?: number, isComplete?: boolean}): Promise<Task[]> {
        let whereConditions = [];
        if (filter.imageId !== undefined) {
            whereConditions.push('task.annotation.image.id = ' + filter.imageId.toString());
        }
        if (filter.userId !== undefined) {
            whereConditions.push('task.assignedUser.id = ' + filter.userId.toString());
        }
        if (filter.isComplete !== undefined) {
            whereConditions.push('task.isComplete.value = ' + filter.isComplete.toString());
        }

        const repository =  (await this.connectionProvider()).getRepository(Task);
        return await repository
                     .createQueryBuilder('task')
                     .leftJoinAndSelect('task.taskType', 'taskType')
                     .leftJoinAndSelect('task.annotation', 'annotation')
                        .leftJoinAndSelect('annotation.image', 'image')
                        .leftJoinAndSelect('annotation.submitEvent', 'submitEvent')
                            .leftJoinAndSelect('submitEvent.user', 'lastSubmittedBy')
                     .leftJoinAndSelect('task.assignedUser', 'assignedUser')
                     .leftJoinAndSelect('task.creator', 'creator')
                     .where(whereConditions.join(' AND '))
                     .getMany();
    }

    public async findTaskListByUser(userId: string, page: number = 0,
                                    pageSize: number = 0, completed: boolean = false): Promise<ITaskGallery[]> {
        const repository =  (await this.connectionProvider()).getRepository(Task);
        const qb = await repository
                         .createQueryBuilder('task')
                         .where('task.assignedUserId = :id', { id: userId })
                         .andWhere('task.isVisible = :visible', { visible: true });

        const tasks =  await qb.getMany();
        let taskList: ITaskGallery[];
        // Regroup tasks in taskGroups by image
        taskList = tasks.map(task => {
            // Todo: add imageId in arguments
            let dataUrl = '';
            try {
                 const base64Image = fs.readFileSync(path.resolve(this.imageService.getThumbnailPathSync(4)), 'base64');
                 dataUrl = 'data:image/png;base64, ' + base64Image;
             } catch (error) {
                 throw(error);
             }
            const taskGallery: ITaskGallery = {
                taskId: task.id,
                taskTypeId: task.taskTypeId,
                isComplete: task.isComplete,
                isVisible: task.isVisible,
                thumbnail: dataUrl,
                // taskTypeTitle: task.taskType.title,
                taskTypeTitle: 'Todo',
                annotationId: task.annotationId,
                // imageId: task.annotation.image.id,
                imageId: 4,
                comment: task.comment,
                assignedUserId: task.assignedUserId,
                creatorId: task.creatorId,
                // projectId: task.projectId,
                projectId: 420,
                lastModifiedTime: task.lastModifiedTime,
            };
            return taskGallery;
        });
        if (completed) {
            taskList = taskList.filter(taskGallery => taskGallery.isComplete);
        } else {
            taskList = taskList.filter(taskGallery => !taskGallery.isComplete);
        }
        // Select a subsection of our taskGroups, according to pageSize and page number
        // if (page !== 0 && pageSize !== 0) {
        //     taskList = taskList.splice(pageSize * page, pageSize);
        // }
        return await taskList;
    }

    public async delete(task: Task): Promise<DeleteResult> {
        const repository =  (await this.connectionProvider()).getRepository(Task);
        return await repository.delete(task);
    }
}
