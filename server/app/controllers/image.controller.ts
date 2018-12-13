import * as express from 'express';
import * as path from 'path';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { IRegistrableController } from './registrable.controller';
import { ImageService } from '../services/image.service';
import { IGallery } from '../interfaces/gallery.interface';
import { IGalleryObject } from '../interfaces/galleryObject.interface';
import { throwIfNotAdmin } from '../utils/userVerification';

@injectable()
export class ImageController implements IRegistrableController {
    @inject(TYPES.ImageService)
    private imageService: ImageService;

    public register(app: express.Application): void {
        app.post('/api/images',
            this.imageService.upload.single('image'),
            this.uploadImage);
        app.put('/api/images/:imageId',
            this.imageService.upload.single('image'),
            this.uploadImage);
        app.get('/api/images/:imageId/', this.getImage);
        app.get('/api/images/:imageId/baseRevision/', this.getImageBaseRevision);
        app.get('/api/images/', this.getImages);
        app.delete('/api/images/:imageId', this.deleteImage);
        app.get('/api/gallery/', this.getGallery);
        app.get('/api/images/:imageId/getFile', this.getImageFile);
    }

    private uploadImage = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // throwIfNotAdmin executes in imageService.upload
        const newImage: any = {
            baseRevision: req.body.baseRevision,
            finalRevision: req.body.finalRevision,
            filename: req.body.filename,
            imageTypeId: req.body.imageTypeId,
            eye: req.body.eye,
            hospital: req.body.hospital,
            patient: req.body.patient,
            visit: req.body.visit,
            code: req.body.code,
            extra: req.body.extra,
        };
        if (req.params.imageId != null) {
            newImage.imageId = req.params.imageId;
            // Request is an update
            this.imageService.updateImage(newImage)
                .then(image => res.send(image))
                .catch(next);
        } else {
            this.imageService.uploadImage(newImage)
                .then(image => res.send(image))
                .catch(next);
        }
    }

    private getImageBaseRevision = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.imageService.getImage(req.params.imageId)
            .then(image => res.send({ svg: image.baseRevision }))
            .catch(next);
    }

    private getImage = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.imageService.getImage(req.params.imageId)
            .then(image => res.send(image))
            .catch(next);
    }

    private getImageFile = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.imageService.getImage(req.params.imageId)
            .then(image => {
                    res.sendFile(path.resolve(image.path));
                })
            .catch(next);
    }

    private getImages = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.imageService.getImages()
            .then(images => {
                images.map(image => {
                    delete image.baseRevision;
                });
                res.send(images);
            })
            .catch(next);
    }

    private deleteImage = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.imageService.deleteImage(req.params.imageId)
            .then(() => res.sendStatus(204))
            .catch(next);
    }

    private getGallery = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const fs = require('fs');
        const arr: IGalleryObject[] = [];
        this.imageService.getImagesWithCount(req.query.sort, req.query.order, req.query.page, req.query.pageSize, req.query.filters)
            .then(imageViewModel => {
                imageViewModel.images.map(image => {
                    let dataUrl = '';
                    try {
                        const base64Image = fs.readFileSync(path.resolve(image.path), 'base64');
                        dataUrl = 'data:image/png;base64, ' + base64Image;
                        const item = {
                            id: image.id,
                            imageType: image.imageType.name,
                            src: dataUrl,
                            baseRevision: image.baseRevision,
                            eye: image.eye,
                            hospital: image.hospital,
                            patient: image.patient,
                            visit: image.visit,
                            code: image.code,
                        };
                        arr.push(item);
                    } catch {
                        console.log('Image non-trouvée: ', image.id);
                    }
                });
                const gallery: IGallery = {
                    objects: arr,
                    objectCount: imageViewModel.count,
                };
                res.send(gallery);
            })
            .catch(next);
    }
}
