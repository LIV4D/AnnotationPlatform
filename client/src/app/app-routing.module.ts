import { AuthorizationGuard } from './shared/guard/authorization.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { TasksComponent } from './tasks/tasks.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EditorComponent } from './editor/editor.component';
import { GalleryComponent } from './gallery/gallery.component';
import { ManagementComponent } from './management/management.component';
import { AccessDeniedComponent } from './user-control/access-denied/access-denied.component';
import { NonExistentPageComponent } from './user-control/non-existent-page/non-existent-page.component';
import { ZoomngxComponent } from './zoomngx/zoomngx.component';
import { CommentBoxComponent } from './editor/comment-box/comment-box.component';

const routes: Routes = [
  // TODO: empty route redirect to tasks clinician if is login
  // TODO: empty route redirect to ? for others if is login
  // TODO: empty route redirect to loginPage if is not login
  // { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '', component: LoginComponent,  pathMatch: 'full', data: {authorizedRoles: []}  },
  { path: 'gallery', component: GalleryComponent, data: {authorizedRoles: []}  },
  { path: 'editor', component: EditorComponent, data: {authorizedRoles: []}  },
  { path: 'dashboard', component: DashboardComponent, data: {authorizedRoles: []}  },
  { path: 'tasks', component: TasksComponent, data: {authorizedRoles: []} },
  { path: 'management/:modelName', canActivate: [AuthorizationGuard], component: ManagementComponent, data: {authorizedRoles: ['admin']} },
  { path: 'management', canActivate: [AuthorizationGuard], component: ManagementComponent, data: {authorizedRoles: ['admin']} },
  { path: 'zoomtest', component: ZoomngxComponent, data: {authorizedRoles: []} },
  { path: 'comment', component: CommentBoxComponent, data: {authorizedRoles: []} },
  { path: 'accessdenied', component: AccessDeniedComponent },
  { path: '**', component: NonExistentPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
