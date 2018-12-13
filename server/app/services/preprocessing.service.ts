import 'reflect-metadata';
import * as config from 'config';
import * as express from 'express';
import * as fs from 'fs';
import * as multer from 'multer';
import * as path from 'path';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { Preprocessing } from '../models/preprocessing.model';
import { PreprocessingRepository } from '../repository/preprocessing.repository';
import { createError } from '../utils/error';
import { isAdmin } from '../utils/userVerification';

@injectable()
export class PreprocessingService {
    @inject(TYPES.PreprocessingRepository)
    private preprocessingRepository: PreprocessingRepository;
    private storage = multer.diskStorage({
        destination: config.get('fileStorage.path'),
        filename: (req: express.Request, file, callback) => {
            if (isAdmin(req) === false) {
                callback(createError('User is not admin.', 401), null);
            }
            // Insert filename into request to get it into the controller.
            req.body.filename = file.originalname;
            // Check if file exists
            this.preprocessingRepository.findForImageForPreprocessingType(
                { id: req.body.imageId } as any, { id: req.body.preprocessingTypeId } as any).then(preprocessing => {
                if (preprocessing) {
                    // Delete previous preprocessing in case of an update.
                    fs.unlinkSync(preprocessing.path);
                    req.body.isUpdate = true;
                }
                callback(null, file.originalname);
            });
        },
    });
    public upload = multer({ storage: this.storage });

    public async uploadPreprocessing(newPreprocessing: any) {
        const preprocessing: Preprocessing = new Preprocessing();
        preprocessing.path = path.join(config.get('fileStorage.path'), newPreprocessing.filename);
        preprocessing.preprocessingType = { id: newPreprocessing.preprocessingTypeId } as any;
        preprocessing.image = { id: newPreprocessing.imageId } as any;
        return await this.preprocessingRepository.create(preprocessing);
    }

    public async updatePreprocessingForImageForType(newPreprocessing: any) {
        const oldPreprocessing: Preprocessing = await this.preprocessingRepository.findForImageForPreprocessingType(
            { id: newPreprocessing.imageId } as any,
            { id: newPreprocessing.preprocessingTypeId } as any);
        oldPreprocessing.path = path.join(config.get('fileStorage.path'), newPreprocessing.filename);
        return await this.preprocessingRepository.update(oldPreprocessing);
    }

    public async getPreprocessing(preprocessingId: string) {
        const preprocessing = await this.preprocessingRepository.find(preprocessingId);
        if (preprocessing == null) {
            throw createError('This preprocessing does not exist.', 404);
        }
        return preprocessing;
    }

    public async getPreprocessingForImageForType(imageId: string, preprocessingTypeId: string) {
        const preprocessing = await this.preprocessingRepository.findForImageForPreprocessingType(
            { id: imageId } as any, { id: preprocessingTypeId } as any);
        if (preprocessing == null) {
            throw createError('This preprocessing does not exist.', 404);
        }
        return preprocessing;
    }

    public async getPreprocessings() {
        return await this.preprocessingRepository.findAll();
    }

    public async getPreprocessingsForImage(imageId: string) {
        return await this.preprocessingRepository.findAllForImage({ id: imageId } as any);
    }

    public async deletePreprocessingForImageForType(imageId: string, preprocessingTypeId: string) {
        const preprocessing = await this.preprocessingRepository.findForImageForPreprocessingType(
            { id: imageId } as any, { id: preprocessingTypeId } as any);
        if (preprocessing == null) {
            throw createError('Preprocessing does not exist.', 404);
        }
        return await this.preprocessingRepository.delete(preprocessing);
    }
}
