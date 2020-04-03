import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { BackgroundCanvas } from 'src/app/shared/services/Editor/Tools/background-canvas.service';
import { BiomarkersComponent } from './biomarkers/biomarkers.component';
import { EditorService } from 'src/app/shared/services/Editor/editor.service';
import { AppService } from 'src/app/shared/services/app.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-right-menu',
  templateUrl: './right-menu.component.html',
  styleUrls: ['./right-menu.component.scss']
})
export class RightMenuComponent implements OnInit {
  loaded: boolean;
  saveText: string;
  // tasks: Task[] = [];
  @Input() canvas: BackgroundCanvas;
  @Output() flip: EventEmitter<any> = new EventEmitter();
  @ViewChild('biomarkers') biomarkers: BiomarkersComponent;
  // @ViewChild(CommentsComponent) comments: CommentsComponent;

  // public commentService: CommentsService, , private taskService: TasksService
  constructor(public appService: AppService, public editorService: EditorService,
              public router: Router, public dialog: MatDialog) {
    this.loaded = true;
    this.saveText = navigator.platform.indexOf('Mac') === -1 ? '(Ctrl + S)' : '(Cmd + S)';
  }

  ngOnInit(): void {
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


  // public onKeyDown(event: KeyboardEvent): void {
  //     if (this.appService.keyEventsEnabled) {
  //         switch (event.keyCode) {
  //             case HOTKEYS.KEY_CTRL_S_SAVE: {
  //                 if (this.commandOrCtrlPressed(event)) {
  //                     if (this.appService.localEditing) {
  //                         this.saveLocal();
  //                     } else {
  //                         this.saveDB();
  //                     }
  //                 }
  //                 break;
  //             }
  //         }
  //     }
  // }

  public commandOrCtrlPressed(event: KeyboardEvent): boolean {
      return navigator.platform.indexOf('Mac') === -1 ? event.ctrlKey : event.metaKey;
  }

}
