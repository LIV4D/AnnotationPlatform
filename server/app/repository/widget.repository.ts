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

    public async findAll(): Promise<Widget[]> {
        const repository =  (await this.connectionProvider()).getRepository(Widget);
        return await repository.find();
    }

    public async create(widget: Widget): Promise<Widget> {
        const repository =  (await this.connectionProvider()).getRepository(Widget);
        widget = await repository.save(widget);
        return repository.findOne(widget.id); // Reload task
    }

    public async find(id: number): Promise<Widget> {
        const repository =  (await this.connectionProvider()).getRepository(Widget);
        return await repository.findOne(id);
    }

    public async findByIds(ids: number[]): Promise<Widget[]> {
        const repository =  (await this.connectionProvider()).getRepository(Widget);
        return await repository.findByIds(ids);
    }

    public async delete(task: Widget): Promise<DeleteResult> {
        const repository =  (await this.connectionProvider()).getRepository(Widget);
        return await repository.delete(task);
    }
}
