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
  { path: 'management', canActivate: [AuthorizationGuard], component: ManagementComponent, data: {authorizedRoles: ['admin']} },
  { path: 'accessdenied', component: AccessDeniedComponent },
  { path: '**', redirectTo: '/editor', data: {authorizedRoles: []}  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
