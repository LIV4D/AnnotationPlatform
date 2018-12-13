import { ConnectionProvider } from './connection.provider';
import { injectable, inject } from 'inversify';
import { ImageType } from '../models/imageType.model';
import { DeleteResult } from 'typeorm';

@injectable()
export class ImageTypeRepository {
    private connectionProvider: ConnectionProvider;

    constructor(
        @inject('ConnectionProvider') connectionProvider: ConnectionProvider,
    ) {
        this.connectionProvider = connectionProvider;
    }

    public async findAll(): Promise<ImageType[]> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(ImageType).find());
    }

    public async create(imageType: ImageType): Promise<ImageType> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(ImageType).save(imageType));
    }

    public async update(imageType: ImageType): Promise<ImageType> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(ImageType).save(imageType));
    }

    public async find(id: number): Promise<ImageType> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(ImageType).findOne({ where: { id } }));
    }

    public async findByName(name: string): Promise<ImageType> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(ImageType).findOne({ where: { name } }));
    }

    public async findWithForeignKeys(id: number): Promise<ImageType> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(ImageType).findOne({ where: { id }, relations: ['biomarkerTypes', 'images'] }));
    }

    public async delete(imageType: ImageType): Promise<DeleteResult> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(ImageType).delete(imageType));
    }
}
