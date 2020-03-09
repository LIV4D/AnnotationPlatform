import { Component} from '@angular/core';
import { TaskFacadeService } from './tasks.facade.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent {

   constructor( private router: Router, private facadeService: TaskFacadeService) {}
}
