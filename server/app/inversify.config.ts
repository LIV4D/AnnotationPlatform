import TYPES from './types';
import { Application } from './app';
import { Connection } from 'typeorm';
import { Container } from 'inversify';
import { Server } from './server';
// Controllers
// Services
import { connectionProvider, ConnectionProvider } from './repository/connection.provider';
import { AnnotationRepository } from './repository/annotation.repository';
import { AnnotationService } from './services/annotation.service';
import { AnnotationController } from './controllers/annotation.controller';
import { ImageRepository } from './repository/image.repository';
import { ImageService } from './services/image.service';
import { ImageController } from './controllers/image.controller';
import { SubmissionEventService } from './services/submissionEvent.service';
import { SubmissionEventRepository } from './repository/submissionEvent.repository';
import { SubmissionEventController} from './controllers/submissionEvent.controller '
import { TaskRepository } from './repository/task.repository';
import { TaskService } from './services/task.service';
import { TaskController } from './controllers/task.controller';
import { TaskTypeRepository } from './repository/taskType.repository';
import { TaskTypeService } from './services/taskType.service';
import { TaskTypeController } from './controllers/taskType.controller';
import { UserRepository } from './repository/user.repository';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { IController } from './controllers/abstractController.controller';
const container: Container = new Container();

container.bind(TYPES.Server).to(Server);
container.bind(TYPES.Application).to(Application);

// Controllers
container.bind<IController>(TYPES.Controller).to(UserController);
container.bind<IController>(TYPES.Controller).to(TaskController);
container.bind<IController>(TYPES.Controller).to(ImageController);
container.bind<IController>(TYPES.Controller).to(TaskTypeController);
container.bind<IController>(TYPES.Controller).to(SubmissionEventController);
container.bind<IController>(TYPES.Controller).to(AnnotationController);
// Services
container.bind<UserService>(TYPES.UserService).to(UserService);
container.bind<TaskService>(TYPES.TaskService).to(TaskService);
container.bind<TaskTypeService>(TYPES.TaskTypeService).to(TaskTypeService);
container.bind<SubmissionEventService>(TYPES.SubmissionEventService).to(SubmissionEventService);
container.bind<AnnotationService>(TYPES.AnnotationService).to(AnnotationService);
container.bind<ImageService>(TYPES.ImageService).to(ImageService);
// Repositories
container.bind<ConnectionProvider>('ConnectionProvider').toProvider<Connection>(connectionProvider);
container.bind<ImageRepository>(TYPES.ImageRepository).to(ImageRepository);
container.bind<AnnotationRepository>(TYPES.AnnotationRepository).to(AnnotationRepository);
container.bind<TaskRepository>(TYPES.TaskRepository).to(TaskRepository);
container.bind<TaskTypeRepository>(TYPES.TaskTypeRepository).to(TaskTypeRepository);
container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind<SubmissionEventRepository>(TYPES.SubmissionEventRepository).to(SubmissionEventRepository);

export { container };
