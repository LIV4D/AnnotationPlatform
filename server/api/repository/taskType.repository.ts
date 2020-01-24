import { ConnectionProvider } from './connection.provider';
import { injectable, inject } from 'inversify';
import { TaskType } from '../models/taskType.model';
import { DeleteResult } from 'typeorm';

@injectable()
export class TaskTypeRepository {
    private connectionProvider: ConnectionProvider;

    constructor(
        @inject('ConnectionProvider') connectionProvider: ConnectionProvider,
    ) {
        this.connectionProvider = connectionProvider;
    }

    public async findAll(): Promise<TaskType[]> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(TaskType).find();
    }

    public async create(taskGroup: TaskType): Promise<TaskType> {
        const connection =  await this.connectionProvider();
        return await connection.getRepository(TaskType).save(taskGroup);
    }

    public async find(id: number): Promise<TaskType> {
        const connection  = await this.connectionProvider();
        return await connection.getRepository(TaskType).findOne(id);
    }

    public async findByTitle(title: string): Promise<TaskType> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(TaskType).findOne({ title });
    }

    public async delete(taskGroup: TaskType): Promise<DeleteResult> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(TaskType).delete(taskGroup);
    }
}
