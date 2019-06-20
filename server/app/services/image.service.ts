import 'reflect-metadata';
import * as config from 'config';
import * as express from 'express';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { Image } from '../models/image.model';
import { ImageRepository } from '../repository/image.repository';
import { createError } from '../utils/error';
import { isAdmin } from '../utils/userVerification';
import { IImage } from '../../../common/common_interfaces/interfaces';

@injectable()
export class ImageService {
    @inject(TYPES.ImageRepository)
    private imageRepository: ImageRepository;
    private storage = multer.diskStorage({
        destination: config.get('fileStorage.path'),
        filename: (req: express.Request, file, callback) => {
            if (isAdmin(req) === false) {
                callback(createError('User is not admin.', 401), null);
            }
            // Insert filename into request to get it into the controller.
            req.body.filename = file.originalname;
            // Update an already existing image.
            if (req.params.imageId != null) {
                this.imageRepository.find(req.params.imageId).then(image => {
                    if (image == null) {
                        callback(createError('Image does not exist', 404), null);
                    } else {
                        fs.unlinkSync(image.path);
                        callback(null, file.originalname);
                    }
                });
            } else if (fs.existsSync(path.join(config.get('fileStorage.path'), file.originalname))) {
                callback(createError('Image with this name already exists', 409), null);
            } else {
                this.imageRepository.findByPath(path.join(config.get('fileStorage.path'), file.originalname)).then(image => {
                    if (image == null) {
                        callback(null, file.originalname);
                    } else {
                        throw createError('Image already exists', 409);
                    }
                });
            }
        },
    });
    public upload = multer({ storage: this.storage });

    public async uploadImage(newImage: IImage) {
        if (newImage.filename == null) {
            throw createError('Request misses a image file on image key', 403);
        }
        const image = new Image();
        image.path = path.join(config.get('fileStorage.path'), newImage.filename);
        image.type = newImage.type;
        image.metadata = newImage.metadata;
        return await this.imageRepository.create(image);
    }

    public async updateImage(updatedImage: IImage) {
        const oldImage = await this.getImage(updatedImage.id);
        // If file changes
        if (updatedImage.filename != null) {
            oldImage.path = path.join(config.get('fileStorage.path'), updatedImage.filename);
            delete updatedImage.filename;
        }
        for (const key of Object.keys(updatedImage)) {
            if (updatedImage[key] != null) {
                oldImage[key] = updatedImage[key];
            }
        }
        return await this.imageRepository.update(oldImage);
    }

    public async getImage(imageId: number) {
        const image = await this.imageRepository.find(imageId);
        if (image == null) {
            throw createError('This image does not exist.', 404);
        }
        return image;
    }

    public async getImages() {
        return await this.imageRepository.findAll();
    }

    public async getImagesWithCount(sort?: string, order?: string, page?: number, pageSize?: number, filters?: string) {
        return await this.imageRepository.findAllWithCount(sort, order, page, pageSize, filters);
    }

    public async deleteImage(imageId: number) {
        const image = await this.imageRepository.findWithForeignKeys(imageId);
        if (image == null) {
            throw createError('This image does not exist.', 404);
        }
        if (image.preprocessingPath.length > 0) {
            throw createError('This image has preprocessings depending on it', 409);
        }
        if (image.annotations.length > 0) {
            throw createError('This image has revisions depending on it', 409);
        }
        if (image.tasks.length > 0) {
            throw createError('This image has tasks depending on it', 409);
        }
        if (fs.existsSync(image.path)) {
            fs.unlinkSync(image.path);
        }
        this.imageRepository.delete(image);
    }
}
