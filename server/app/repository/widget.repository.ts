import * as path from 'path';
import * as fs from 'fs';
import TYPES from '../types';
import { ConnectionProvider } from './connection.provider';
import { injectable, inject } from 'inversify';
import { Widget } from '../models/widget.model';
import { DeleteResult } from 'typeorm';

@injectable()
export class WidgetRepository {
    private connectionProvider: ConnectionProvider;

    constructor(
        @inject('ConnectionProvider') connectionProvider: ConnectionProvider,
    ) {
        this.connectionProvider = connectionProvider;
    }

    public async findAll(): Promise<Task[]> {
        const repository =  (await this.connectionProvider()).getRepository(Widget);
        return await repository.find();
    }

    public async create(task: Task): Promise<Task> {
        const repository =  (await this.connectionProvider()).getRepository(Widget);
        task = await repository.save(task);
        return repository.findOne(task.id); // Reload task
    }

    public async find(id: number): Promise<Task> {
        const repository =  (await this.connectionProvider()).getRepository(Widget);
        return await repository.findOne(id);
    }

    public async findByIds(ids: number[]): Promise<Task[]> {
        const repository =  (await this.connectionProvider()).getRepository(Widget);
        return await repository.findByIds(ids);
    }

    public async delete(task: Task): Promise<DeleteResult> {
        const repository =  (await this.connectionProvider()).getRepository(Widget);
        return await repository.delete(task);
    }
}
