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
import { CommentBoxComponent } from './editor/comment-box/comment-box.component';
import { Tab } from './shared/constants/tab';



const routes: Routes = [
  // TODO: empty route redirect to tasks clinician if is login
  // TODO: empty route redirect to ? for others if is login
  // TODO: empty route redirect to loginPage if is not login
  // { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '', component: LoginComponent,  pathMatch: 'full', data: {authorizedRoles: []} },
  { path: 'gallery', component: GalleryComponent, data: {authorizedRoles: ['admin', 'researcher'], tab: Tab.GALLERY} },
  { path: 'editor', component: EditorComponent, data: {authorizedRoles: [], tab: Tab.EDITOR}  },
  { path: 'dashboard', component: DashboardComponent, data: {authorizedRoles: [], tab: Tab.DASHBOARD}  },
  { path: 'tasks', component: TasksComponent, data: {authorizedRoles: [], tab: Tab.TASKS} },
  { path: 'management', canActivate: [AuthorizationGuard], component: ManagementComponent, data: {authorizedRoles: ['admin', 'researcher'], tab: Tab.MANAGEMENT} },
  { path: 'comment', component: CommentBoxComponent, data: {authorizedRoles: []} },
  { path: 'accessdenied', component: AccessDeniedComponent },
  { path: '**', component: NonExistentPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
