import { ImageBorderService } from './../right-menu/biomarkers/image-border.service';
import { LayersService } from './../editor/layers/layers.service';
import {ToolPropertiesComponent} from './tool-properties/tool-properties.component';
import { Point } from './../../model/point';
import { PixelBucket } from './../../model/pixel-bucket';
import { PixelCrayon } from './../../model/pixel-crayon';
import { Eraser } from './../../model/eraser';
import { Hand } from './../../model/hand';
import { ToolPropertiesService } from './tool-properties/tool-properties.service';
import { Tool } from './../../model/tool';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EditorService } from '../editor/editor.service';
import { PointByPointBucket } from './../../model/point-by-point-bucket';
import { LassoEraser } from '../../model/lasso-eraser';
import { BioPicker } from '../../model/biopicker';
export const TOOL_NAMES = {
    PAN: 'pan',
    ERASER: 'eraser',
    BRUSH: 'brush',
    FILL_BRUSH: 'fillBrush',
    FILL_VECTOR: 'fillVector',
    UNDO: 'undo',
    REDO: 'redo',
    LASSO_ERASER: 'lassoEraser',
    BIO_PICKER: 'bioPicker',
};

@Injectable({
    providedIn: 'root'
})
export class ToolboxService {

    selectedTool: BehaviorSubject<Tool>;
    listOfTools: Tool[];
    totalPropertiesComponent: ToolPropertiesComponent;


    constructor(private toolPropertiesService: ToolPropertiesService,
        private layersService: LayersService, private editorService: EditorService, public imageBorderService: ImageBorderService) {

        this.listOfTools = [
            new Hand(TOOL_NAMES.PAN, '../assets/icons/hand.svg', 'Pan (P)'),
            new Eraser(TOOL_NAMES.ERASER, '../assets/icons/eraser.svg', 'Eraser (E)'),
            new LassoEraser(TOOL_NAMES.LASSO_ERASER, '../assets/icons/lasso-eraser.svg', 'Erase Brush (G)'),
            new PixelCrayon(TOOL_NAMES.BRUSH, '../assets/icons/brush.svg', 'Brush (B)'),
            // new Tool( '../assets/icons/lasso.png', 'Partial selection tool'),
            new PixelBucket(TOOL_NAMES.FILL_BRUSH, '../assets/icons/brush-fill.svg', 'Fill Brush (F)'),
            // new PointByPointBucket(TOOL_NAMES.FILL_VECTOR, '../assets/icons/vector.svg', 'Fill Vector (V)'),
            new BioPicker(TOOL_NAMES.BIO_PICKER, '../assets/icons/picker.svg', 'Pick Biomarker (L)'),
            new Tool(TOOL_NAMES.UNDO, '../assets/icons/undo.svg',
                     navigator.platform.indexOf('Mac') === -1 ? 'Undo (Ctrl + Z)' : 'Undo (Cmd + Z)'),
            new Tool(TOOL_NAMES.REDO, '../assets/icons/redo.svg',
                     navigator.platform.indexOf('Mac') === -1 ? 'Redo (Ctrl + Y)' : 'Redo (Cmd + Y)')
        ];
        this.selectedTool = new BehaviorSubject<Tool>(this.listOfTools[0]);
    }

    getToolPropertiesService(): ToolPropertiesService {
        return this.toolPropertiesService;
    }

    setToolPropertiesComponent(tool: ToolPropertiesComponent): void {
        this.totalPropertiesComponent = tool;
    }

    getToolPropertiesComponent(): ToolPropertiesComponent {
        return this.totalPropertiesComponent;
    }

    setSelectedTool(newSelectedTool: Tool): void {
        if (newSelectedTool.name === TOOL_NAMES.UNDO) {
            this.layersService.undo();
        } else if (newSelectedTool.name === TOOL_NAMES.REDO) {
            this.layersService.redo();
        } else {
            this.selectedTool.next(newSelectedTool);
        }
    }

    onCursorDown(point: Point): void {
        if (this.imageBorderService.showBorders && this.selectedTool.getValue().name !== TOOL_NAMES.PAN) {
            // this.imageBorderService.showBorders = false;
            // this.layersService.toggleBorders(false);
        }
        this.selectedTool.getValue().onCursorDown(point);
        this.setUndoRedoState();
    }

    onCursorUp(): void {
        this.selectedTool.getValue().onCursorUp();
        // this.setUndoRedoState(); // WTF ?????
    }

    onCursorOut(point: Point): void {
        this.selectedTool.getValue().onCursorOut(point);
        // this.setUndoRedoState(); // WTF?????
    }

    onCursorMove(point: Point): void {
        this.selectedTool.getValue().onCursorMove(point);
        // this.setUndoRedoState(); // WTF?????
    }

    onCancel(): void {
        this.selectedTool.getValue().onCancel();
        this.setUndoRedoState();
    }

    setUndoRedoState(): void {
        if (this.layersService.undoStack.getLength() === 0) {
            this.listOfTools.filter((tool) => tool.name === TOOL_NAMES.UNDO)[0].disabled = true;
        } else {
            this.listOfTools.filter((tool) => tool.name === TOOL_NAMES.UNDO)[0].disabled = false;
        }

        if (this.layersService.redoStack.getLength() === 0) {
            this.listOfTools.filter((tool) => tool.name === TOOL_NAMES.REDO)[0].disabled = true;
        } else {
            this.listOfTools.filter((tool) => tool.name === TOOL_NAMES.REDO)[0].disabled = false;
        }
    }
}
