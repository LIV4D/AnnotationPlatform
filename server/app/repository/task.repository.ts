import * as path from 'path';
import { ConnectionProvider } from './connection.provider';
import { injectable, inject } from 'inversify';
import { Task } from '../models/task.model';
import { ITaskGroup } from '../interfaces/taskGroup.interface';
import { ITaskList } from '../interfaces/taskList.interface';
import { DeleteResult } from 'typeorm';

@injectable()
export class TaskRepository {
    private connectionProvider: ConnectionProvider;

    constructor(
        @inject('ConnectionProvider') connectionProvider: ConnectionProvider,
    ) {
        this.connectionProvider = connectionProvider;
    }

    public async findAll(): Promise<Task[]> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Task).find({ relations : ['user', 'image', 'taskGroup'] }));
    }

    public async create(task: Task): Promise<Task> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Task).save(task));
    }

    public async update(task: Task): Promise<Task> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Task).save(task));
    }

    public async find(id: number): Promise<Task> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Task).findOne(id, { relations : ['user', 'image', 'taskType'] }));
    }

    public async findTasksByUser(userId: string): Promise<Task[]> {
        return await this.connectionProvider().then(connection => {
            return connection
                .getRepository(Task)
                .createQueryBuilder('task')
                .where('task.user.id = :id', { id: userId })
                .leftJoinAndSelect('task.image', 'image')
                .leftJoinAndSelect('task.taskType', 'taskType')
                .leftJoinAndSelect('task.user', 'user')
                .getMany();
        });
    }

    public async findTasksByUserByImage(userId: string, imageId: number): Promise<Task[]> {
        return await this.connectionProvider().then(connection => {
            return connection
                .getRepository(Task)
                .createQueryBuilder('task')
                .where('task.user.id = :usrId', { usrId: userId })
                .andWhere('task.image.id = :imgId', { imgId: imageId })
                .andWhere('task.active = :active', { active: true })
                .leftJoinAndSelect('task.taskType', 'taskType')
                .leftJoinAndSelect('task.user', 'user')
                .getMany();
        });
    }

    public async findTaskListByUser(userId: string, page?: number, pageSize?: number, completed?: boolean): Promise<ITaskList> {
        const fs = require('fs');
        const taskList: ITaskList = {
            objects: [],
            objectCount: 0,
        };
        if (!Number.isInteger(Number(page))) {
            page = 0;
        }
        if (!Number.isInteger(Number(pageSize))) {
            pageSize = 0;
        }
        return this.connectionProvider().then(connection => {
        // Get active tasks for user
            const qb = connection
                .getRepository(Task)
                .createQueryBuilder('task')
                .where('task.user.id = :id', { id: userId })
                .andWhere('task.active = :active', { active: true })
                .leftJoinAndSelect('task.image', 'image');
            return qb.getMany();
        })
        .then(tasks => {
            // Regroup tasks in taskGroups by image
            tasks.forEach(task => {
                // Search for existing taskGroup with task image id
                const index = task.image.id ? taskList.objects.findIndex(e => e.imageId === task.image.id) : -1;
                // If it exists add to taskGroup and update count
                if (index > -1) {
                    taskList.objects[index].tasks.push(task);
                    if (task.completed) {
                        taskList.objects[index].completeCount++;
                    } else {
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
                        completeCount: 0,
                        incompleteCount: 0,
                    };
                    if (task.completed) {
                        taskGroup.completeCount++;
                    } else {
                        taskGroup.incompleteCount++;
                    }
                    taskList.objects.push(taskGroup);
                }
            });
            if (completed !== undefined) {
                if (completed) {
                    taskList.objects = taskList.objects.filter(o => o.incompleteCount === 0);
                } else {
                    taskList.objects = taskList.objects.filter(o => o.incompleteCount > 0);
                }
            }
            // Save total object count
            taskList.objectCount = taskList.objects.length;
            // Select a subsection of our taskGroups, according to pageSize and page number
            if (page !== 0 && pageSize !== 0) {
                taskList.objects = taskList.objects.splice(pageSize * page, pageSize);
            }
            return taskList;
        });
    }

    public async delete(task: Task): Promise<DeleteResult> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Task).delete(task));
    }
}
