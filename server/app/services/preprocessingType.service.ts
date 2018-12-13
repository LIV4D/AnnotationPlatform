import 'reflect-metadata';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { PreprocessingType } from '../models/preprocessingType.model';
import { PreprocessingTypeRepository } from '../repository/preprocessingType.repository';
import { createError } from '../utils/error';

@injectable()
export class PreprocessingTypeService {
    @inject(TYPES.PreprocessingTypeRepository)
    private preprocessingTypeRepository: PreprocessingTypeRepository;

    public async getPreprocessingTypes(): Promise<PreprocessingType[]> {
        return await this.preprocessingTypeRepository.findAll();
    }

    public async createPreprocessingType(newPreprocessingType: any): Promise<PreprocessingType> {
        const name = await this.preprocessingTypeRepository.findByName(newPreprocessingType.name);
        if (name !== undefined) {
            throw createError('Preprocessing type with this name already exists.', 409);
        }
        const preprocessingType = new PreprocessingType();
        preprocessingType.name = newPreprocessingType.name;
        preprocessingType.description = newPreprocessingType.description;
        return await this.preprocessingTypeRepository.create(preprocessingType);
    }

    public async updatePreprocessingType(updatedPreprocessingType: any): Promise<PreprocessingType> {
        const oldPreprocessingType = await this.preprocessingTypeRepository.find(updatedPreprocessingType.id);
        if (oldPreprocessingType == null) {
            throw createError('Preprocessing type not found', 404);
        }
        // default is used for the client.
        if (oldPreprocessingType.name === 'Default' && updatedPreprocessingType.name !== 'Default') {
            throw createError('Cannot update default preprocessing type name.', 403);
        }
        oldPreprocessingType.name = updatedPreprocessingType.name;
        oldPreprocessingType.description = updatedPreprocessingType.description;
        return await this.preprocessingTypeRepository.update(oldPreprocessingType);
    }

    public async getPreprocessingType(id: number): Promise<PreprocessingType> {
        const preprocessingType = await this.preprocessingTypeRepository.find(id);
        if (preprocessingType == null) {
            throw createError('This preprocessing type does not exist', 404);
        }
        return preprocessingType;
    }

    public async getPreprocessingTypeByName(name: string): Promise<PreprocessingType> {
        const preprocessingType = await this.preprocessingTypeRepository.findByName(name);
        if (preprocessingType == null) {
            throw createError('This preprocessing type does not exist', 404);
        }
        return preprocessingType;
    }
}
