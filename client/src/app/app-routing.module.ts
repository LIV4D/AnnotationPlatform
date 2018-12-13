import { NoImageGuard } from './edit-layout/editor/no-image.guard';
import { TasksComponent } from './tasks/tasks.component';
import { EditLayoutComponent } from './edit-layout/edit-layout.component';
import { GalleryComponent } from './gallery/gallery.component';
import { environment } from './../environments/environment';
import { LoginGuard } from './login/login.guard';
import { ROUTES } from './routes';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { LoginComponent } from './login/login.component';


const routes: Routes = [
    { path: ROUTES.LOGIN, component: LoginComponent },
    { path: ROUTES.EDITOR, component: EditLayoutComponent, canActivate: [LoginGuard, NoImageGuard] },
    { path: ROUTES.GALLERY, component: GalleryComponent, canActivate: [LoginGuard] },
    { path: ROUTES.TASKS, component: TasksComponent, canActivate: [LoginGuard] },
    { path: '', redirectTo: '/' + ROUTES.LOGIN, pathMatch: 'full' },
    { path: '**', component: LoginComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
