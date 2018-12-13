import { HOTKEYS } from './../../hotkeys';
import { CommentsComponent } from './comments/comments.component';
import { ROUTES } from './../../routes';
import { Router } from '@angular/router';
import { EditorService } from './../editor/editor.service';
import { AppService } from './../../app.service';
import { BackgroundCanvas } from './../../model/background-canvas';
import { EditLayoutComponent } from './../edit-layout.component';
import { TaskDialogComponent } from './tasks/task-dialog.component';
import { BiomarkersComponent } from './biomarkers/biomarkers.component';
import { Component, OnInit, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { LocalStorage } from './../../model/local-storage';

@Component({
    selector: 'app-right-menu',
    templateUrl: './right-menu.component.html',
    styleUrls: ['./right-menu.component.scss']
})
export class RightMenuComponent implements OnInit {
    loaded: boolean;
    saveText: string;
    tasks: any[] = [];
    @Input() canvas: BackgroundCanvas;
    @Output() flip: EventEmitter<any> = new EventEmitter();
    @ViewChild('biomarkers') biomarkers: BiomarkersComponent;
    @ViewChild(CommentsComponent) comments: CommentsComponent;
    constructor(public appService: AppService, public editorService: EditorService, public router: Router, public dialog: MatDialog) {
        this.loaded = false;
        this.saveText = navigator.platform.indexOf('Mac') === -1 ? '(Ctrl + S)' : '(Cmd + S)';
    }

    ngOnInit(): void {
        this.getTasks();
    }

    // Retrieves the image types from the server
    getTasks(): void {
        if (!this.editorService.imageLocal) {
            this.editorService.getTasks().subscribe(res => {
                this.tasks = res;
            });
        }
    }

    public svgLoaded(arbre: SVGGElement[]): void {
        this.loaded = true;
        setTimeout(() => {
            this.biomarkers.init(arbre);
        }, 0);
    }

    public flipHorizontal(): void {
        this.flip.emit(null);
    }

    public saveLocal(): void {
        this.editorService.saveSVGFile();
    }

    public openTaskDialog(): void {
        if (Object.keys(this.tasks).length > 0) {
            const dialogRef = this.dialog.open(TaskDialogComponent, {
                data: { tasks: this.tasks },
                width: '600px',
            });
            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    LocalStorage.save(this.editorService, this.editorService.layersService);
                    this.saveRevision();
                }
            });
        } else {
            this.saveRevision();
        }
    }

    public saveRevision(): void {
        const diagnostic = this.comments.comment.nativeElement.value;
        this.editorService.saveToDB(diagnostic);
        if (localStorage.getItem('previousPage') === 'tasks') {
            this.router.navigate([`/${ROUTES.TASKS}`]);
        } else {
            this.router.navigate([`/${ROUTES.GALLERY}`]);
        }

    }

    public saveDB(): void {
        this.openTaskDialog();
    }

    public onKeyDown(event: KeyboardEvent): void {
        if (this.appService.keyEventsEnabled) {
            switch (event.keyCode) {
                case HOTKEYS.KEY_CTRL_S_SAVE: {
                    if (this.commandOrCtrlPressed(event)) {
                        if (this.appService.localEditing) {
                            this.saveLocal();
                        } else {
                            this.saveDB();
                        }
                    }
                    break;
                }
            }
        }
    }

    public commandOrCtrlPressed(event: KeyboardEvent): boolean {
        return navigator.platform.indexOf('Mac') === -1 ? event.ctrlKey : event.metaKey;
    }
}
