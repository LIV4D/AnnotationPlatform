import * as config from 'config';
import * as express from 'express';
import * as fs from 'fs';
import * as multer from 'multer';
import * as path from 'path';
import TYPES from '../types';
import * as tmp from 'tmp';
import { isNullOrUndefined } from 'util';

import { inject, injectable } from 'inversify';
import { IController } from './abstractController.controller';
import { ImageService } from '../services/image.service';
import { Metadata } from '../models/image.model';
import { IImage } from '../interfaces/IImage.interface';
import { IGallery, IGalleryObject } from '../interfaces/gallery.interface';
import { throwIfNotAdmin } from '../utils/userVerification';
import { isAdmin } from '../utils/userVerification';
import { createError } from '../utils/error';

@injectable()
export class ImageController implements IController {
    @inject(TYPES.ImageService)
    private imageService: ImageService;

    private storage = multer.diskStorage({
        destination: config.get('storageFolders.tmp'),
        filename: (req: express.Request, file, callback) => {
            if (isAdmin(req) === false) {
                callback(createError('User is not admin.', 401), null);
            }
            const uniqueFilename = path.parse(tmp.tmpNameSync(config.get('storageFolders.tmp'))).name;
            callback(null, uniqueFilename + path.parse(file.originalname).ext);
        },
    });
    public upload = multer({ storage: this.storage });

    public setRoutes(app: express.Application): void {
        app.post('/api/images/create',
                    this.upload.fields([{ name: 'image', maxCount: 1 }, { name: 'preprocessing', maxCount: 1 }]),
                    this.createImage);
        app.post('/api/images/createNew',
                    this.upload.fields([{ name: 'image', maxCount: 1 }, { name: 'preprocessing', maxCount: 1 }]),
                    this.createImageNew);
        app.post('/api/images/createCLI',
                    this.upload.fields([{ name: 'image', maxCount: 1 }, { name: 'preprocessing', maxCount: 1 }]),
                    this.createImageCLI);
        app.put('/api/images/update/:imageId', this.updateImage);
        app.put('/api/images/updateFile/:imageId',
                    this.upload.single('image'),
                    this.uploadImage);
        app.put('/api/images/updatePreprocessing/:imageId',
                    this.upload.single('preprocessing'),
                    this.uploadPreprocessing);
        app.delete('/api/images/delete/:imageId', this.deleteImage);

        // List
        app.get('/api/images/list', this.list);
        app.get('/api/images/list/:attr([a-zA-Z][a-zA-Z0-9]+)', this.list);
        app.get('/api/images/gallery', this.getGallery);

        // Get
        app.get('/api/images/get/:imageId([0-9]+)', this.getTask);
        app.get('/api/images/get/:imageId([0-9]+)/:attr([a-zA-Z][a-zA-Z0-9]+)', this.getTask);
        app.get('/api/images/get', this.getMultipleTasks);
        app.get('/api/images/get/:attr([a-zA-Z][a-zA-Z0-9]+)', this.getMultipleTasks);

        // Download image files
        app.get('/api/images/download/:imageId/raw', this.getImageFile);
        app.get('/api/images/download/:imageId/preproc', this.getPreprocessingFile);
        app.get('/api/images/download/:imageId/thumbnail', this.getThumbnailFile);
    }

    /**
     * Creates an image using the request's information.
     * Requires the type to be in the body and the files (the absolute path on the server towards the file).
     * Optionally, the image's metadata and a boolean determining whether there's preprocessionf or not.
     * @param req an express request with image data
     * @param res an express response where the image data will be put
     * @param next is the following function in the express application
     */
    private createImage =  (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // throwIfNotAdmin executes in this.upload
        const newImage: IImage = {
            type: req.body.type,
            metadata: isNullOrUndefined(req.body.metadata) ? new Metadata() : req.body.metadata,
            preprocessing: !isNullOrUndefined(req.body.preprocessing) ? req.body.preprocessing : undefined,
        };

        const imageFile: string = req.body.files;
        newImage.metadata['filename'] = imageFile.replace(/[^\\/]*$/, '');

        const preprocessingFile = newImage.preprocessing ? req.body.preprocessing : undefined;
        let preprocessingPath = null;
        if (!isNullOrUndefined(preprocessingFile) && preprocessingFile) {
            newImage.metadata['preprocessingFilename'] = preprocessingFile.originalname;
            preprocessingPath = preprocessingFile.path;
        }

        this.imageService.createImage(newImage, imageFile, preprocessingPath)
            .then(image => res.send(image.proto()))
            .catch(next);
    }

    private createImageNew =  (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // throwIfNotAdmin executes in this.upload
        const newImage: IImage = {
            type: req.body.type,
            metadata: req.body.metadata,
            preprocessing: !isNullOrUndefined(req.body.files['preprocessing']),
        };

        const imageFile = req.body.files['image'][0];
        newImage.metadata['filename'] = imageFile.originalname;

        const preprocessingFile = newImage.preprocessing ? req.body.files['preprocessing'][0] : undefined;
        let preprocessingPath = null;
        if (preprocessingFile !== undefined) {
            newImage.metadata['preprocessingFilename'] = preprocessingFile.originalname;
            preprocessingPath = preprocessingFile.path;
        }

        this.imageService.createImage(newImage, imageFile.path, preprocessingPath)
            .then(image => res.send(image.proto()))
            .catch(next);
    }

    private createImageCLI =  (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // throwIfNotAdmin executes in this.upload
        const newImage: IImage = {
            type: req.body.type,
            metadata: !isNullOrUndefined(req.body.metadata) ? req.body.metadata : {},
            preprocessing: !isNullOrUndefined(req.files['preprocessing']),
        };

        const imageFile = req.files['image'][0];
        newImage.metadata['filename'] = imageFile.originalname;

        const preprocessingFile = newImage.preprocessing ? req.files['preprocessing'][0] : undefined;
        let preprocessingPath = null;
        if (preprocessingFile !== undefined) {
            newImage.metadata['preprocessingFilename'] = preprocessingFile.originalname;
            preprocessingPath = preprocessingFile.path;
        }

        this.imageService.createImage(newImage, imageFile.path, preprocessingPath)
            .then(image => res.send(image.proto()))
            .catch(next);
    }

    /**
     * Uploads the image specified in the request.
     * Requires the image id in the parameters of the route
     * @param req an express request with image data
     * @param res an express response where the image data will be put
     * @param next is the following function in the express application
     */
    private uploadImage = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // throwIfNotAdmin executes in this.upload
        const imageId = req.params.imageId;
        this.imageService.updateImageFile(+imageId, req.file.path)
            .then(() => this.imageService.updateMetadata(+imageId, { filename: req.file.originalname })
                            .then(image => res.send(image)))
                            .catch(next)
            .catch(next);
    }

    /**
     * Uploads the preprocessing image specified in the request.
     * Requires the image id in the parameters of the route
     * @param req an express request with image data
     * @param res an express response where the image data will be put
     * @param next is the following function in the express application
     */
    private uploadPreprocessing = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // throwIfNotAdmin executes in this.upload
        const imageId = req.params.imageId;
        this.imageService.updatePreprocessingFile(+imageId, req.file.path)
            .then(() => this.imageService.updateMetadata(+imageId, { preprocessingFilename: req.file.originalname })
                            .then(image => res.send(image)))
                            .catch(next)
            .catch(next);
    }

    /**
     * Updates the image specified in the request.
     * Requires the image id in the parameters of the route.
     * Requires the image type and its new metadata in the body of the request.
     * @param req an express request with image data
     * @param res an express response where the image data will be put
     * @param next is the following function in the express application
     */
    private updateImage = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req.user);
        const newImage: IImage = {
            type: req.body.type,
            metadata: req.body.metadata,
        };
        newImage.id = +req.params.imageId;
        this.imageService.updateImage(newImage)
            .then(image => res.send(image))
            .catch(next);
    }

    /**
     * Deletes the image specified in the request.
     * Requires the image id in the parameters of the route.
     * @param req an express request with image data
     * @param res an express response where the image data will be put
     * @param next is the following function in the express application
     */
    private deleteImage = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req.user);
        const imageId = +req.params.imageId;
        this.imageService.deleteImage(imageId)
            .then(() => res.sendStatus(204))
            .catch(next);
    }

    /**
     * Gets all the images in the database ordered so that they can be used for the gallery view.
     * @param req an express request with image data
     * @param res an express response where the image data will be put
     * @param next is the following function in the express application
     */
    private getGallery = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const arr: IGalleryObject[] = [];
        // get Images with params setted
        this.imageService.getImagesWithCount(req.query.sort, req.query.order, req.query.page, req.query.pageSize, req.query.filters)
            .then(imageViewModel => {
                imageViewModel[0].map((image: { id: number; type: any; metadata: any; }) => {
                    const  item = {
                        id: image.id,
                        type: image.type,
                        metadata: image.metadata,
                    } as IGalleryObject;
                    // Read thumbnail
                    try {
                        const thumbPath = path.resolve(this.imageService.getThumbnailPathSync(image.id));
                        item.thumbnail = 'data:image/jpg;base64, ' + fs.readFileSync(thumbPath, 'base64');
                    } catch {
                        console.error(`Thumbnail for image ` + image.id.toString() + ` not found.`);
                    }

                    arr.push(item);
                });

                const gallery: IGallery = {
                    objects: arr,
                    objectCount: imageViewModel[1],
                };
                res.send(gallery);
            })
            .catch(next);
    }

    /**
     * Gets all the images within the database, unsorted.
     * @param req an express request with image data
     * @param res an express response where the image data will be put
     * @param next is the following function in the express application
     */
    private list = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.imageService.getAllImages()
            .then(images => {
                res.send(images.map(image => {
                    switch (req.params.attr) {
                        case undefined: return image;
                        case 'proto': return image.proto();
                        case 'metata': return image.metadata;
                    }
                    return null;
                }));
            }).catch(next);
    }

    /**
     * Gets a task associated with the image.
     * Requires the image id in the parameters of the route
     * @param req an express request with image data
     * @param res an express response where the image data will be put
     * @param next is the following function in the express application
     */
    private getTask = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.imageService.getImage(+req.params.imageId)
            .then(image => {
                switch (req.params.attr) {
                    case undefined: res.send(image); break;
                    case 'proto': res.send(image.proto()); break;
                    case 'metata': res.send(image.metadata); break;
                }
            }).catch(next);
    }

    /**
     * Gets all tasks associated with the id of multiple images
     * Requires the image ids in the body of the request.
     * @param req an express request with image data
     * @param res an express response where the image data will be put
     * @param next is the following function in the express application
     */
    private getMultipleTasks = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.imageService.getImages(req.body.ids)
            .then(images => {
                res.send(images.map(image => {
                    switch (req.params.attr) {
                        case undefined: return image;
                        case 'proto': return image.proto();
                        case 'metata': return image.metadata;
                    }
                    return null;
                }));
            }).catch(next);
    }

    /**
     * Gets the path associated with the image's file on the server.
     * Requires the image id in the parameters of the route.
     * @param req an express request with image data
     * @param res an express response where the image data will be put
     * @param next is the following function in the express application
     */
    private getImageFile = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.imageService.getImagePath(+req.params.imageId)
            .then(imgPath => {
                res.sendFile(path.resolve(imgPath));
            })
            .catch(next);
    }

    /**
     * Gets the path associated with the image's preprocessing file on the server.
     * Requires the image id in the parameters of the route.
     * @param req an express request with image data
     * @param res an express response where the image data will be put
     * @param next is the following function in the express application
     */
    private getPreprocessingFile = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.imageService.getPrepocessingPath(+req.params.imageId)
            .then(prePath => {
                res.sendFile(path.resolve(prePath));
            })
            .catch(next);
    }

    /**
     * Gets the path associated with the image's thumbnail file on the server.
     * Requires the image id in the parameters of the route.
     * @param req an express request with image data
     * @param res an express response where the image data will be put
     * @param next is the following function in the express application
     */
    private getThumbnailFile = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.imageService.getThumbnailPath(+req.params.imageId)
            .then(thumbPath => {
                res.sendFile(path.resolve(thumbPath));
            })
            .catch(next);
    }

}
