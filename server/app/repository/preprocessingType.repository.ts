import { ConnectionProvider } from './connection.provider';
import { injectable, inject } from 'inversify';
import { PreprocessingType } from '../models/preprocessingType.model';

@injectable()
export class PreprocessingTypeRepository {
    private connectionProvider: ConnectionProvider;

    constructor(
        @inject('ConnectionProvider') connectionProvider: ConnectionProvider,
    ) {
        this.connectionProvider = connectionProvider;
    }

    public async findAll(): Promise<PreprocessingType[]> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(PreprocessingType).find());
    }

    public async create(preprocessingType: PreprocessingType): Promise<PreprocessingType> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(PreprocessingType).save(preprocessingType));
    }

    public async update(preprocessingType: PreprocessingType): Promise<PreprocessingType> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(PreprocessingType).save(preprocessingType));
    }

    public async find(id: number): Promise<PreprocessingType> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(PreprocessingType).findOne({ where: { id } }));
    }

    public async findByName(name: string): Promise<PreprocessingType> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(PreprocessingType).findOne({ where: { name } }));
    }
}
