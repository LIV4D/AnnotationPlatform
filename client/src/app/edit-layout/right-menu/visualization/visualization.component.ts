import { EditorService } from './../../editor/editor.service';
import { HOTKEYS } from './../../../hotkeys';
import { AppService } from './../../../app.service';
import { BackgroundCanvas } from './../../../model/background-canvas';
import { VisualizationService } from './visualization.service';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-visualization',
    templateUrl: './visualization.component.html',
    styleUrls: ['./visualization.component.scss']
})
export class VisualizationComponent implements OnInit {
    minBrightness: number;
    maxBrightness: number;
    minContrast: number;
    maxContrast: number;
    brightness: number;
    contrast: number;
    preprocessingChecked: boolean;
    autoContrastChecked: boolean;
    @Input() canvas: BackgroundCanvas;
    @Output() flip: EventEmitter<any> = new EventEmitter();

    constructor(private visualizationService: VisualizationService, public appService: AppService, public editorService: EditorService) {
        this.minContrast = -255;
        this.maxContrast = 255;
        this.minBrightness = -100;
        this.maxBrightness = 100;
        this.brightness = 0;
        this.contrast = 0;
        this.preprocessingChecked = false;
        this.autoContrastChecked = false;
    }

    ngOnInit(): void {
    }

    public changeBrightness(event: any): void {
        if (event.type === 'input') {
            this.brightness = Number(event.target.value);
            this.visualizationService.applyChanges(this.canvas, Number(event.target.value), this.contrast);
        } else {
            this.brightness = Number(event.value);
            this.visualizationService.applyChanges(this.canvas, Number(event.value), this.contrast);
        }
    }

    public changeContrast(event: any): void {
        if (event.type === 'input') {
            this.contrast = Number(event.target.value);
            this.visualizationService.applyChanges(this.canvas, this.brightness, Number(event.target.value));
        } else {
            this.contrast = Number(event.value);
            this.visualizationService.applyChanges(this.canvas, this.brightness, Number(event.value));
        }
    }

    public flipHorizontal(): void {
        this.flip.emit(null);
    }

    public resetBrightness(): void {
        this.brightness = 0;
        this.visualizationService.applyChanges(this.canvas, this.brightness, this.contrast);
    }

    public resetContrast(): void {
        this.contrast = 0;
        this.visualizationService.applyChanges(this.canvas, this.brightness, this.contrast);
    }

    public togglePreprocessing(): void {
        this.preprocessingChecked = !this.preprocessingChecked;
        this.visualizationService.tooglePretreatments(this.preprocessingChecked);
        this.visualizationService.applyChanges(this.editorService.backgroundCanvas, this.brightness, this.contrast,
                                               this.autoContrastChecked);
    }

    public toggleAutoContrast(): void {
        this.autoContrastChecked = !this.autoContrastChecked;
        this.visualizationService.applyChanges(this.editorService.backgroundCanvas, this.brightness, this.contrast,
                                               this.autoContrastChecked);
    }

    public resetVisualization(): void {
        this.contrast = 0;
        this.brightness = 0;
        this.autoContrastChecked = false;
        if (this.preprocessingChecked) {
            this.togglePreprocessing();
        } else {
            this.visualizationService.applyChanges(this.editorService.backgroundCanvas, this.brightness, this.contrast,
                                                   this.autoContrastChecked);
        }
    }

    enableOnKeyDown(): void {
        this.appService.keyEventsEnabled = true;
    }

    disableOnKeyDown(): void {
        this.appService.keyEventsEnabled = false;
    }

    public onKeyDown(event: KeyboardEvent): void {
        if (this.appService.keyEventsEnabled) {
            switch (event.keyCode) {
                case HOTKEYS.KEY_M_FLIP: {
                    this.flipHorizontal();
                    break;
                }
                case HOTKEYS.KEY_T_PRETREATMENTS: {
                    this.togglePreprocessing();
                    break;
                }
            }
        }
    }
}



