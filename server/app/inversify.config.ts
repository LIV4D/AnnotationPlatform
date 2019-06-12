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
import { IController } from './controllers/registrable.controller';

const container: Container = new Container();

container.bind(TYPES.Server).to(Server);
container.bind(TYPES.Application).to(Application);

// Controllers
container.bind<IController>(TYPES.Controller).to(UserController);
// Services
container.bind<UserService>(TYPES.UserService).to(UserService);
// Repositories
container.bind<ConnectionProvider>('ConnectionProvider').toProvider<Connection>(connectionProvider);
container.bind<ImageRepository>(TYPES.ImageRepository).to(ImageRepository);
container.bind<AnnotationRepository>(TYPES.RevisionRepository).to(AnnotationRepository);
container.bind<TaskRepository>(TYPES.TaskRepository).to(TaskRepository);
container.bind<TaskGroupRepository>(TYPES.TaskTypeRepository).to(TaskGroupRepository);
container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository);

export { container };
