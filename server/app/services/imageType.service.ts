import 'reflect-metadata';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { ImageType } from '../models/imageType.model';
import { ImageTypeRepository } from '../repository/imageType.repository';
import { createError } from '../utils/error';
import { DeleteResult } from 'typeorm';

@injectable()
export class ImageTypeService {
    @inject(TYPES.ImageTypeRepository)
    private imageTypeRepository: ImageTypeRepository;

    public async createImageType(newImageType: any): Promise<ImageType> {
        const name = await this.imageTypeRepository.findByName(newImageType.name);
        if (name !== undefined) {
            throw createError('Image type with this name already exists.', 409);
        }
        const imageType = new ImageType();
        imageType.name = newImageType.name;
        imageType.description = newImageType.description;
        return await this.imageTypeRepository.create(imageType);
    }

    public async getImageType(id: number): Promise<ImageType> {
        const imageType = await this.imageTypeRepository.find(id);
        if (imageType == null) {
            throw createError('This image type does not exist.', 404);
        }
        return imageType;
    }

    public async getImageTypeByName(name: string): Promise<ImageType> {
        const imageType = await this.imageTypeRepository.findByName(name);
        if (imageType == null) {
            throw createError('This image type does not exist.', 404);
        }
        return imageType;
    }

    public async getImageTypes(): Promise<ImageType[]> {
        return await this.imageTypeRepository.findAll();
    }

    public async updateImageType(updatedImageType: any): Promise<ImageType> {
        const oldImageType = await this.getImageType(updatedImageType.id);
        if (updatedImageType.name != null) {
            oldImageType.name = updatedImageType.name;
        }
        if (updatedImageType.description != null) {
            oldImageType.description = updatedImageType.description;
        }
        return await this.imageTypeRepository.update(oldImageType);
    }

    public async deleteImageType(imageTypeId: string): Promise<DeleteResult> {
        const imageType = await this.imageTypeRepository.findWithForeignKeys(Number(imageTypeId));
        if (imageType == null) {
            throw createError('This image type does not exist', 404);
        }
        // if (imageType.biomarkerTypes.length > 0) {
        //     throw createError('This image type has biomarker types depending on it', 409);
        // }
        if (imageType.images.length > 0) {
            throw createError('This image type has images depending on it', 409);
        }
        return await this.imageTypeRepository.delete(imageType);
    }
}
