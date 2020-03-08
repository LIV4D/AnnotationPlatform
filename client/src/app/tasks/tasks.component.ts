import { Component} from '@angular/core';
import { TaskFacadeService } from './tasks.facade.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent {

   constructor( private router: Router, private facadeService: TaskFacadeService) {
   }
    /**
     * Logs tasks component: Executed each time a tab is changed
     * May be usefull
     * @param val: event
     */
    log(val) { }
}
