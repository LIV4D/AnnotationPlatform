import { ConnectionProvider } from './connection.provider';
import { injectable, inject } from 'inversify';
import { Revision } from '../models/revision.model';
import { DeleteResult } from 'typeorm';

@injectable()
export class RevisionRepository {
    private connectionProvider: ConnectionProvider;

    constructor(
        @inject('ConnectionProvider') connectionProvider: ConnectionProvider,
    ) {
        this.connectionProvider = connectionProvider;
    }

    public async findAll(): Promise<Revision[]> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Revision).find({ relations:['user', 'image'] }));
    }

    public async create(revision: Revision): Promise<Revision> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Revision).save(revision));
    }

    public async update(revision: Revision): Promise<Revision> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Revision).save(revision));
    }

    public async find(id: number): Promise<Revision> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Revision).findOne({ where: { id }, relations : ['user', 'image'] }));
    }

    public async findByUser(userId: string): Promise<Revision[]> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Revision).find({ relations:['user', 'image'], where: {user: {id: userId}} }));
    }

    public async findForUserForImage(userId: string, imageId: number): Promise<Revision> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Revision).findOne({ user: { id: userId }, image: { id: imageId } }));
    }

    public async delete(revision: Revision): Promise<DeleteResult> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Revision).delete(revision));
    }
}
