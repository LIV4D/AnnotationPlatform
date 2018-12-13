import 'reflect-metadata';
import TYPES from '../types';
import * as xml2js from 'xml2js';
import { BiomarkerType } from '../models/biomarkerType.model';
import { BiomarkerTypeRepository } from '../repository/biomarkerType.repository';
import { inject, injectable } from 'inversify';
import { ImageType } from '../models/imageType.model';
import { getConnection, QueryFailedError, DeleteResult } from 'typeorm';
import { createError } from '../utils/error';

@injectable()
export class BiomarkerTypeService {
    @inject(TYPES.BiomarkerTypeRepository)
    private biomarkerTypeRepository: BiomarkerTypeRepository;

    public async createBiomarkerType(newBiomarkerType: any): Promise<BiomarkerType> {
        const name = await this.biomarkerTypeRepository.findByName(newBiomarkerType.name);
        if (name !== undefined) {
            throw createError('Biomarker with this name already exists.', 409);
        }
        const biomarkerType = new BiomarkerType();
        biomarkerType.name = newBiomarkerType.name;
        biomarkerType.color = newBiomarkerType.color;
        if (newBiomarkerType.parentId != null) {
            biomarkerType.parent = { id: newBiomarkerType.parentId } as any;
        }
        // Boolean to create biomarkerType only if imageTypes are valid.
        let imageTypesValid = false;
        if (newBiomarkerType.imageTypes != null) {
            newBiomarkerType.imageTypes = newBiomarkerType.imageTypes
                .map((imageType: string|number) => ({ id: Number(imageType) }));

            const parent = await this.biomarkerTypeRepository.find(newBiomarkerType.parentId);
            if (newBiomarkerType.parentId != null && newBiomarkerType.imageTypes.some((imageType: ImageType) =>
                parent.imageTypes.findIndex(element => element.id === imageType.id) < 0)
            ) {
                throw createError('The child cannot have imageTypes that the parent does not have.', 409);
            }
            imageTypesValid = true;
        }
        return await getConnection().transaction(async transactionalEntityManager => {
            let result = await transactionalEntityManager.getRepository(BiomarkerType).create(biomarkerType);
            if (imageTypesValid) {
                result.imageTypes = newBiomarkerType.imageTypes;
                result = await transactionalEntityManager.getRepository(BiomarkerType).save(result);
            }
            return result;
        })
        .catch(err => {
            if (err instanceof QueryFailedError) {
                throw createError((err as any).detail, 409);
            }
            throw (err);
        });
    }

    public async getBiomarkerType(id: number): Promise<BiomarkerType> {
        const biomarkerType = await this.biomarkerTypeRepository.find(id);
        if (biomarkerType == null) {
            throw createError('This biomarker type does not exist.', 404);
        }
        return biomarkerType;
    }

    public async getBiomarkerTypeByName(name: string): Promise<BiomarkerType> {
        const biomarkerType = await this.biomarkerTypeRepository.findByName(name);
        if (biomarkerType == null) {
            throw createError('This biomarker type does not exist.', 404);
        }
        return biomarkerType;
    }

    public async getBiomarkerTypes(): Promise<BiomarkerType[]> {
        const biomarkerTypes = await this.biomarkerTypeRepository.findAll();
        return this.buildTree(biomarkerTypes);
    }

    public buildTree(biomarkerTypes: BiomarkerType[], parentId?: number) {
        const tree: any[] = [];
        for (const element of biomarkerTypes) {
            if ((parentId == null && element.parent == null) ||
                (element.parent != null && element.parent.id === parentId)) {

                const biomarkerType: any = { ...element };
                delete biomarkerType.parent;
                biomarkerType.children = this.buildTree(biomarkerTypes, element.id);
                tree.push(biomarkerType);
            }
        }
        return tree;
    }

    public async updateBiomarkerType(updatedBiomarkerType: any) {
        const oldBiomarkerType = await this.getBiomarkerType(updatedBiomarkerType.id);
        if (updatedBiomarkerType.color != null) {
            oldBiomarkerType.color = updatedBiomarkerType.color;
        }
        return await this.biomarkerTypeRepository.update(oldBiomarkerType);
    }

    public async deleteBiomarkerType(biomarkerTypeId: string): Promise<DeleteResult> {
        const biomarkerTypeToDelete = await this.getBiomarkerType(Number(biomarkerTypeId));
        if (biomarkerTypeToDelete == null) {
            throw createError('This biomarker type does not exist', 404);
        }
        const biomarkerTypes = await this.biomarkerTypeRepository.findAll();
        for (const biomarkerType of biomarkerTypes) {
            if (biomarkerType.parent != null && biomarkerType.parent.id === biomarkerTypeToDelete.id) {
                throw createError('Cannot delete a biomarker type that has a parent', 409);
            }
        }
        // Typeorm behaves differently if these keys are present during delete
        delete biomarkerTypeToDelete.imageTypes;
        delete biomarkerTypeToDelete.parent;
        return await this.biomarkerTypeRepository.delete(biomarkerTypeToDelete);
    }

    public async generateSvg(imageTypeId: number) {
        const biomarkerTypes = await this.biomarkerTypeRepository.findAll();
        const svgTree = {
            svg: {
                $: {
                    'xmlns:rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                    'xmlns': 'http://www.w3.org/2000/svg',
                    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
                    'xmlns:sodipodi': 'http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd',
                    'sodipodi:docname': 'fullAnnotations.svg',
                },
                g: this.constructSvgTree(biomarkerTypes, imageTypeId),
            },
        };
        const builder = new xml2js.Builder();
        return builder.buildObject(svgTree);
    }

    public constructSvgTree(table: BiomarkerType[], imageTypeId: number, parentId?: number) {
        const jsonTree: any[] = [];
        for (const element of table) {
            // If element has not the correct imageTypeId then skip.
            if (element.imageTypes == null || element.imageTypes.some(imageType => imageType.id === imageTypeId) === false) {
                continue;
            }
            /* Root: parentId == null when it is called from generateSvg and the parent == null indicates that we have to
                insert a rootElement and we are at the root of the jsonTree.
               Children: if a parent is defined for the element and this parent is the same that is calling the function
                to build a subTree, then we have to insert the element. */
            if ((parentId == null && element.parent == null) ||
                (element.parent != null && element.parent.id === parentId)) {

                const subTree = this.constructSvgTree(table, imageTypeId, element.id);
                jsonTree.push(this.createSvgElement(element, subTree));
            }
        }
        return jsonTree;
    }

    private createSvgElement(element: BiomarkerType, subTree: any[]) {
        if (subTree.length === 0) {
            // Leaf
            return {
                $: {
                    id: element.name,
                    color: element.color,
                    preserveAspectRatio: 'none',
                },
            };
        } else {
            // Images are leafs
            const imageTable: any[] = [];
            const groupTable: any[] = [];
            for (const subElement of subTree) {
                // Color indicate if subElement is a leaf
                if (subElement.$.color != null) {
                    imageTable.push(subElement);
                } else {
                    groupTable.push(subElement);
                }
            }
            return {
                $: { id: element.name },
                image: imageTable,
                g: groupTable,
            };
        }
    }
}
