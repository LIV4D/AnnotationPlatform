import { ConnectionProvider } from './connection.provider';
import { injectable, inject } from 'inversify';
import { BiomarkerType } from '../models/biomarkerType.model';
import { DeleteResult } from 'typeorm';

@injectable()
export class BiomarkerTypeRepository {
    private connectionProvider: ConnectionProvider;

    constructor(
        @inject('ConnectionProvider') connectionProvider: ConnectionProvider,
    ) {
        this.connectionProvider = connectionProvider;
    }

    public async findAll(): Promise<BiomarkerType[]> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(BiomarkerType).find({ relations : ['parent', 'imageTypes'] }));
    }

    public async create(biomarkerType: BiomarkerType): Promise<BiomarkerType> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(BiomarkerType).save(biomarkerType));
    }

    public async update(biomarkerType: BiomarkerType): Promise<BiomarkerType> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(BiomarkerType).save(biomarkerType));
    }

    public async find(id: number): Promise<BiomarkerType> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(BiomarkerType).findOne({ where: { id }, relations : ['parent', 'imageTypes'] }));
    }

    public async findByName(name: string): Promise<BiomarkerType> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(BiomarkerType).findOne({ where: { name }, relations : ['parent', 'imageTypes'] }));
    }

    public async delete(biomarkerType: BiomarkerType): Promise<DeleteResult> {
        return await this.connectionProvider().then(connection =>
            connection.getRepository(BiomarkerType).delete(biomarkerType));
    }
}
