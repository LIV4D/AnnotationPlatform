import TYPES from './types';
import { Application } from './app';
import { Connection } from 'typeorm';
import { Container } from 'inversify';
import { Server } from './server';
// Controllers
// Services
import { connectionProvider, ConnectionProvider } from './repository/connection.provider';
import { ImageRepository } from './repository/image.repository';
import { AnnotationRepository } from './repository/annotation.repository';
import { TaskRepository } from './repository/task.repository';
import { TaskGroupRepository } from './repository/taskGroup.repository';
import { UserRepository } from './repository/user.repository';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { IController } from './controllers/abstractController.controller';
import { TaskController } from './controllers/task.controller';
import { TaskService } from './services/task.service';
import { EvenementService } from './services/evenement.service';
import { EvenementRepository } from './repository/evenement.repository';
import { AnnotationService } from './services/annotation.service';
import { ImageService } from './services/image.service';
import { TaskGroupService } from './services/taskGroup.service';
import { ImageController } from './controllers/image.controller';
import { TaskGroupController } from './controllers/taskGroup.controller';
import { AnnotationController } from './controllers/annotation.controller';

const container: Container = new Container();

container.bind(TYPES.Server).to(Server);
container.bind(TYPES.Application).to(Application);

// Controllers
container.bind<IController>(TYPES.Controller).to(UserController);
container.bind<IController>(TYPES.Controller).to(TaskController);
container.bind<IController>(TYPES.Controller).to(ImageController);
container.bind<IController>(TYPES.Controller).to(TaskGroupController);
container.bind<IController>(TYPES.Controller).to(AnnotationController);
// Services
container.bind<UserService>(TYPES.UserService).to(UserService);
container.bind<TaskService>(TYPES.TaskService).to(TaskService);
container.bind<TaskGroupService>(TYPES.TaskGroupService).to(TaskGroupService);
container.bind<EvenementService>(TYPES.EvenementService).to(EvenementService);
container.bind<AnnotationService>(TYPES.AnnotationService).to(AnnotationService);
container.bind<ImageService>(TYPES.ImageService).to(ImageService);
// Repositories
container.bind<ConnectionProvider>('ConnectionProvider').toProvider<Connection>(connectionProvider);
container.bind<ImageRepository>(TYPES.ImageRepository).to(ImageRepository);
container.bind<AnnotationRepository>(TYPES.AnnotationRepository).to(AnnotationRepository);
container.bind<TaskRepository>(TYPES.TaskRepository).to(TaskRepository);
container.bind<TaskGroupRepository>(TYPES.TaskGroupRepository).to(TaskGroupRepository);
container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind<EvenementRepository>(TYPES.EvenementRepository).to(EvenementRepository);

export { container };
