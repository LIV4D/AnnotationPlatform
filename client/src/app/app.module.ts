import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginModule } from './login/login.module';
import { SharedModule} from './shared/shared.module';
import { EditorComponent } from './editor/editor.component';
import { GalleryComponent } from './gallery/gallery.component';
import { TasksComponent } from './tasks/tasks.component';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
   declarations: [
      AppComponent,
      EditorComponent,
      GalleryComponent,
      TasksComponent,
      DashboardComponent,
   ],
   imports: [
      BrowserModule,
      AppRoutingModule,
      LoginModule,
      SharedModule
   ],
   providers: [],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
