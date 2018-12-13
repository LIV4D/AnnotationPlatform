import { ConnectionProvider } from './connection.provider';
import { Image } from '../models/image.model';
import { injectable, inject } from 'inversify';
import { Preprocessing } from '../models/preprocessing.model';
import { PreprocessingType } from '../models/preprocessingType.model';
import { DeleteResult } from 'typeorm';

@injectable()
export class PreprocessingRepository {
    private connectionProvider: ConnectionProvider;

    constructor(
        @inject('ConnectionProvider') connectionProvider: ConnectionProvider,
    ) {
        this.connectionProvider = connectionProvider;
    }

    public async findAll(): Promise<Preprocessing[]> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Preprocessing).find());
    }

    public async findAllForImage(image: Image): Promise<Preprocessing[]> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Preprocessing).find({ where: { image } }));
    }

    public async create(preprocessing: Preprocessing): Promise<Preprocessing> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Preprocessing).save(preprocessing));
    }

    public async update(preprocessing: Preprocessing): Promise<Preprocessing> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Preprocessing).save(preprocessing));
    }

    public async find(id: string): Promise<Preprocessing> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Preprocessing).findOne({ where: { id } }));
    }

    public async findForImageForPreprocessingType(image: Image, preprocessingType: PreprocessingType): Promise<Preprocessing> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Preprocessing).findOne({ where: { image, preprocessingType } }));
    }

    public async findByPath(path: string): Promise<Preprocessing> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Preprocessing).findOne({ where: { path } }));
    }

    public async delete(preprocessing: Preprocessing): Promise<DeleteResult> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(Preprocessing).delete(preprocessing));
    }
}
