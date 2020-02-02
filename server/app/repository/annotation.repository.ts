import { ConnectionProvider } from './connection.provider';
import { injectable, inject } from 'inversify';
import { Annotation } from '../models/annotation.model';
import { DeleteResult } from 'typeorm';

@injectable()
export class AnnotationRepository {
    private connectionProvider: ConnectionProvider;

    constructor(
        @inject('ConnectionProvider') connectionProvider: ConnectionProvider,
    ) {
        this.connectionProvider = connectionProvider;
    }

    public async findAll(): Promise<Annotation[]> {
        const connection = await this.connectionProvider();
        return await connection.getRepository(Annotation).find();
    }

    public async create(annotation: Annotation): Promise<Annotation> {
        const repository =  (await this.connectionProvider()).getRepository(Annotation);
        annotation = await repository.save(annotation, );
        return await repository.findOne(annotation.id); // Reload foreign relation
    }

    public async update(annotation: Annotation): Promise<Annotation> {
        const repository =  (await this.connectionProvider()).getRepository(Annotation);
        annotation = await repository.save(annotation, );
        return await repository.findOne(annotation.id); // Reload foreign relation
    }

    public async find(id: number): Promise<Annotation> {
        const repository =  (await this.connectionProvider()).getRepository(Annotation);
        return await repository.findOne(id);
    }

    public async findByIds(ids: number[]): Promise<Annotation[]> {
        const repository =  (await this.connectionProvider()).getRepository(Annotation);
        return await repository.findByIds(ids);
    }

    public async findForImage(imageId: number): Promise<Annotation> {
        const repository =  (await this.connectionProvider()).getRepository(Annotation);
        return await repository.findOne({ image: { id: imageId } });
    }

    public async delete(annotation: Annotation): Promise<DeleteResult> {
        const repository =  (await this.connectionProvider()).getRepository(Annotation);
        return await repository.delete(annotation);
    }
}
