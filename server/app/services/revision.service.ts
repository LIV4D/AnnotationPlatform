import 'reflect-metadata';
import TYPES from '../types';
import * as express from 'express';
import { inject, injectable } from 'inversify';
import { Revision } from '../models/revision.model';
import { RevisionRepository } from '../repository/revision.repository';
import { DeleteResult } from 'typeorm';
import { createError } from '../utils/error';
import { throwIfNotAdmin } from '../utils/userVerification';
import { ImageService } from './image.service';

@injectable()
export class RevisionService {
    @inject(TYPES.RevisionRepository)
    private revisionRepository: RevisionRepository;
    @inject(TYPES.ImageService)
    private imageService: ImageService;

    public async createRevision(newRevision: any): Promise<Revision> {
        if (await this.revisionRepository.findForUserForImage(newRevision.userId, newRevision.imageId)) {
            throw createError('Revision for this user and this image already exists', 409);
        }
        if (newRevision.diagnostic && newRevision.diagnostic.length > 1000) {
            throw createError('Diagnostic text is too long (>1000)', 403);
        }
        const revision = new Revision();
        revision.svg = newRevision.svg;
        revision.diagnostic = newRevision.diagnostic;
        revision.user = { id: newRevision.userId } as any;
        revision.image = { id: newRevision.imageId } as any;
        return await this.revisionRepository.create(revision);
    }

    public async getRevision(id: number, req: express.Request): Promise<Revision> {
        const revision = await this.revisionRepository.find(id);
        if (revision == null) {
            throw createError('This revision does not exist.', 404);
        }
        if (req.user.id !== revision.user.id) {
            throwIfNotAdmin(req);
        }
        return revision;
    }

    public async getRevisions(): Promise<Revision[]> {
        return await this.revisionRepository.findAll();
    }

    public async getRevisionsByUser(userId: string): Promise<Revision[]> {
        return await this.revisionRepository.findByUser(userId);
    }

    public async getRevisionForUserForImage(userId: string, imageId: number): Promise<Revision> {
        const revision = await this.revisionRepository.findForUserForImage(userId, imageId);
        if (revision == null) {
            throw createError('This revision does not exist.', 404);
        }
        return revision;
    }

    public async updateRevisionForUserForImage(updatedRevision: any): Promise<Revision> {
        const oldRevision = await this.revisionRepository.findForUserForImage(updatedRevision.userId, updatedRevision.imageId);
        if (updatedRevision.diagnostic && updatedRevision.diagnostic.length > 1000) {
            throw createError('Diagnostic text is too long (>1000)', 403);
        }
        if (!oldRevision) {
            const newRevision = new Revision();
            if (!updatedRevision.svg) {
                newRevision.svg = (await this.imageService.getImage(updatedRevision.imageId)).baseRevision;
            } else {
                newRevision.svg = updatedRevision.svg;
            }
            newRevision.diagnostic = updatedRevision.diagnostic;
            newRevision.user = { id: updatedRevision.userId } as any;
            newRevision.image = { id: updatedRevision.imageId } as any;
            return await this.revisionRepository.create(newRevision);
        } else {
            oldRevision.svg = updatedRevision.svg;
            oldRevision.diagnostic = updatedRevision.diagnostic;
            return await this.revisionRepository.update(oldRevision);
        }
    }

    public async deleteRevisionForUserForImage(userId: string, imageId: number): Promise<DeleteResult> {
        const revision = await this.revisionRepository.findForUserForImage(userId, imageId);
        if (revision == null) {
            throw createError('Revision not found', 404);
        }
        return await this.revisionRepository.delete(revision);
    }
}
