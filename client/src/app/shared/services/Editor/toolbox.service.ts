import { Injectable } from '@angular/core';

import { Tool } from './Tools/tool.service';
import { Point } from './Tools/point.service';
import { FillBrush } from './Tools/fill-brush.service';
import { Brush } from './Tools/brush.service';
import { Eraser } from './Tools/eraser.service';
import { Hand } from './Tools/hand.service';
import { LassoEraser } from './Tools/lasso-eraser.service';
import { BioPicker } from './Tools/biopicker.service';

import { TOOL_NAMES } from './../../constants/tools';

import { BehaviorSubject } from 'rxjs';

import { LayersService } from './layers.service';
import { EditorService } from './editor.service';
import { ToolPropertiesService } from './tool-properties.service';
import { BiomarkerService } from './biomarker.service';


@Injectable({
    providedIn: 'root'
})
export class ToolboxService {

    selectedTool: BehaviorSubject<Tool>;
    listOfTools: Tool[];

    constructor(private layersService: LayersService, private editorService: EditorService,
                private toolPropertiesService: ToolPropertiesService, private biomarkerService: BiomarkerService) {

        this.listOfTools = [
            new Hand(TOOL_NAMES.PAN, '../assets/icons/hand.svg', 'Pan (P)',
                editorService, layersService),
            new Brush(TOOL_NAMES.BRUSH, '../assets/icons/brush.svg', 'Brush (B)',
                editorService, layersService, toolPropertiesService),
            // new Tool( '../assets/icons/lasso.png', 'Partial selection tool'),
            new FillBrush(TOOL_NAMES.FILL_BRUSH, '../assets/icons/brush-fill.svg', 'Fill Brush (F)',
                editorService, layersService, toolPropertiesService),
            // new PointByPointBucket(TOOL_NAMES.FILL_VECTOR, '../assets/icons/vector.svg', 'Fill Vector (V)'),
            new Eraser(TOOL_NAMES.ERASER, '../assets/icons/eraser.svg', 'Eraser (E)',
                editorService, layersService, toolPropertiesService),
            new LassoEraser(TOOL_NAMES.LASSO_ERASER, '../assets/icons/lasso-eraser.svg', 'Lasso Eraser (G)',
                editorService, layersService),
            new BioPicker(TOOL_NAMES.BIO_PICKER, '../assets/icons/picker.svg', 'Pick Biomarker (K)',
                editorService, layersService, biomarkerService),
            new Tool(TOOL_NAMES.UNDO, '../assets/icons/undo.svg',
                navigator.platform.indexOf('Mac') === -1 ? 'Undo (Ctrl + Z)' : 'Undo (Cmd + Z)',
                editorService, layersService),
            new Tool(TOOL_NAMES.REDO, '../assets/icons/redo.svg',
                navigator.platform.indexOf('Mac') === -1 ? 'Redo (Ctrl + Y)' : 'Redo (Cmd + Y)',
                editorService, layersService)
        ];

        this.selectedTool = new BehaviorSubject<Tool>(this.listOfTools[0]);
    }

    setSelectedTool(newSelectedTool: string): void {
        const newSelectedToolTool: Tool = this.listOfTools.filter((tool) => tool.name === newSelectedTool)[0];
        this.selectedTool.next(newSelectedToolTool);
    }

    setUndo() {
        // this.layersService.undo();
    }

    setRedo() {
        // this.layersService.redo();
    }

    setUndoRedoState(): void {
        // if (this.layersService.undoStack.getLength() === 0) {
        //     this.listOfTools.filter((tool) => tool.name === TOOL_NAMES.UNDO)[0].disabled = true;
        // } else {
        //     this.listOfTools.filter((tool) => tool.name === TOOL_NAMES.UNDO)[0].disabled = false;
        // }

        // if (this.layersService.redoStack.getLength() === 0) {
        //     this.listOfTools.filter((tool) => tool.name === TOOL_NAMES.REDO)[0].disabled = true;
        // } else {
        //     this.listOfTools.filter((tool) => tool.name === TOOL_NAMES.REDO)[0].disabled = false;
        // }
    }

    public onCursorDown(point: Point): void {
        // if (this.imageBorderService.showBorders && this.selectedTool.getValue().name !== TOOL_NAMES.PAN) {
        //     // this.imageBorderService.showBorders = false;
        //     // this.layersService.toggleBorders(false);
        // }
        this.selectedTool.getValue().onCursorDown(point);
        this.setUndoRedoState();
    }

    public onCursorUp(): void {
        this.selectedTool.getValue().onCursorUp();
    }

    public onCursorOut(point: Point): void {
        this.selectedTool.getValue().onCursorOut(point);
    }

    public onCursorMove(point: Point): void {
        this.selectedTool.getValue().onCursorMove(point);
    }

    public onCancel(): void {
        this.selectedTool.getValue().onCancel();
        this.setUndoRedoState();
    }

}
