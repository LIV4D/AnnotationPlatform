import * as path from 'path';
import * as fs from 'fs';
import { ConnectionProvider } from './connection.provider';
import { injectable, inject } from 'inversify';
import { Task } from '../models/task.model';
import { ITaskGroup } from '../interfaces/taskGroup.interface';
import { ITaskList } from '../interfaces/taskList.interface';
import { DeleteResult } from 'typeorm';
import { isUndefined } from 'util';

@injectable()
export class TaskRepository {
    private connectionProvider: ConnectionProvider;
    constructor(
        @inject('ConnectionProvider') connectionProvider: ConnectionProvider,
    ) {
        this.connectionProvider = connectionProvider;
    }
    
    public async findAll(): Promise<Task[]> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(Task).find({ relations : ['user', 'image', 'taskGroup'] });
    }

    public async create(task: Task): Promise<Task> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(Task).save(task);
    }

    public async find(id: number): Promise<Task> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(Task).findOne(id, { relations : ['user', 'image', 'taskGroup'] });
    }

    public async findTasksByUser(userId: string): Promise<Task[]> {
        const connection = await this.connectionProvider();
        return await connection
            .getRepository(Task)
            .createQueryBuilder('task')
            .where('task.user.id = :id', { id: userId })
            .leftJoinAndSelect('task.image', 'image')
            .leftJoinAndSelect('task.taskGroup', 'taskGroup')
            .leftJoinAndSelect('task.user', 'user')
            .getMany();
    }

    public async findTasksByUserByImage(userId: string, imageId: number): Promise<Task[]> {
        const connection = await this.connectionProvider();
        return await connection
            .getRepository(Task)
            .createQueryBuilder('task')
            .where('task.user.id = :usrId', { usrId: userId })
            .andWhere('task.image.id = :imgId', { imgId: imageId })
            .andWhere('task.isVisible = :isVisible', { isVisible: true })
            .leftJoinAndSelect('task.taskGroup', 'taskType')
            .leftJoinAndSelect('task.user', 'user')
            .getMany();
    }

    public async findTaskListByUser(userId: string, page: number = 0, pageSize: number = 0, completed?: boolean): Promise<ITaskList> {
       // TODO: virer attribut objectCount inutile
        const taskList: ITaskList = {
            objects: [],
        };
        const connection = await this.connectionProvider();
        const qb = await connection
        .getRepository(Task)
        .createQueryBuilder('task')
        .where('task.user.id = :id', { id: userId })
        .andWhere('task.active = :active', { active: true })
        .leftJoinAndSelect('task.image', 'image');

        const tasks =  await qb.getMany();
        // Regroup tasks in taskGroups by image
        tasks.forEach(task => {
            // Search for existing taskGroup with task image id
            const index = task.image.id ? taskList.objects.findIndex(e => e.imageId === task.image.id) : -1;
            // If it exists add to taskGroup and update count
            if (index > -1) {
                taskList.objects[index].tasks.push(task);
                if (!task.isComplete) {
                    taskList.objects[index].incompleteCount++;
                }
            } else {
            // If it doesn't create a new taskGroup and load the image thumbnail
                let dataUrl = '';
                try {
                    const base64Image = fs.readFileSync(path.resolve(task.image.thumbnailPath), 'base64');
                    dataUrl = 'data:image/png;base64, ' + base64Image;
                } catch {
                    console.log('Image non-trouvée: ', task.image.id);
                }
                const taskGroup: ITaskGroup = {
                    tasks: [ task ],
                    imageId: task.image.id,
                    imageSrc: dataUrl,
                    incompleteCount: 0,
                };
                if (!task.isComplete) {
                    taskGroup.incompleteCount++;
                }
                taskList.objects.push(taskGroup);
            }
        });
        if (!isUndefined(completed)) {
            if (completed) {
                taskList.objects = taskList.objects.filter(o => o.incompleteCount === 0);
            } else {
                taskList.objects = taskList.objects.filter(o => o.incompleteCount > 0);
            }
        }
        // Select a subsection of our taskGroups, according to pageSize and page number
        if (page !== 0 && pageSize !== 0) {
            taskList.objects = taskList.objects.splice(pageSize * page, pageSize);
        }
        return await taskList;
    }

    public async delete(task: Task): Promise<DeleteResult> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(Task).delete(task);
    }
}
