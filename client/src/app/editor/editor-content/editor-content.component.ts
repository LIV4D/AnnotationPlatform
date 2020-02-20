import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { EditorService } from 'src/app/shared/services/Editor/editor.service';

@Component({
  selector: 'app-editor-content',
  templateUrl: './editor-content.component.html',
  styleUrls: ['./editor-content.component.scss']
})
export class EditorContentComponent implements OnInit {

  @Output() svgLoaded: EventEmitter<any> = new EventEmitter();

  constructor(public editorService: EditorService) { }

  ngOnInit(): void {
    console.log('EditorContentComponent::ngOnInit()');
    this.editorService.init(this.svgLoaded);
  }

}
