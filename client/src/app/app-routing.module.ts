import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { TasksComponent } from './tasks/tasks.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EditorComponent } from './editor/editor.component';
import { GalleryComponent } from './gallery/gallery.component';
import { ManagementComponent } from './management/management.component';

const routes: Routes = [
  // TODO: empty route redirect to tasks clinician if is login
  // TODO: empty route redirect to ? for others if is login
  // TODO: empty route redirect to loginPage if is not login
  // { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '', component: LoginComponent,  pathMatch: 'full'  },
  { path: 'gallery', component: GalleryComponent },
  { path: 'editor', component: EditorComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'tasks', component: TasksComponent },
  { path: 'management', component: ManagementComponent },
  { path: '**', redirectTo: '/editor' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
