import TYPES from './types';
import { Application } from './app';
import { Connection } from 'typeorm';
import { Container } from 'inversify';
import { Server } from './server';
// Controllers
import { BiomarkerTypeController } from './controllers/biomarkerType.controller';
import { ImageController } from './controllers/image.controller';
import { ImageTypeController } from './controllers/imageType.controller';
import { IRegistrableController } from './controllers/registrable.controller';
import { PreprocessingController } from './controllers/preprocessing.controller';
import { PreprocessingTypeController } from './controllers/preprocessingType.controller';
import { RevisionController } from './controllers/revision.controller';
import { TaskController } from './controllers/task.controller';
import { TaskTypeController } from './controllers/taskType.controller';
import { UserController } from './controllers/user.controller';
// Services
import { BiomarkerTypeService } from './services/biomarkerType.service';
import { ImageService } from './services/image.service';
import { ImageTypeService } from './services/imageType.service';
import { PreprocessingService } from './services/preprocessing.service';
import { PreprocessingTypeService } from './services/preprocessingType.service';
import { RevisionService } from './services/revision.service';
import { TaskService } from './services/task.service';
import { TaskTypeService } from './services/taskType.service';
import { UserService } from './services/user.service';
// Repositories
import { BiomarkerTypeRepository } from './repository/biomarkerType.repository';
import { connectionProvider, ConnectionProvider } from './repository/connection.provider';
import { ImageRepository } from './repository/image.repository';
import { ImageTypeRepository } from './repository/imageType.repository';
import { PreprocessingRepository } from './repository/preprocessing.repository';
import { PreprocessingTypeRepository } from './repository/preprocessingType.repository';
import { RevisionRepository } from './repository/revision.repository';
import { TaskRepository } from './repository/task.repository';
import { TaskTypeRepository } from './repository/taskType.repository';
import { UserRepository } from './repository/user.repository';

const container: Container = new Container();

container.bind(TYPES.Server).to(Server);
container.bind(TYPES.Application).to(Application);

// Controllers
container.bind<IRegistrableController>(TYPES.Controller).to(BiomarkerTypeController);
container.bind<IRegistrableController>(TYPES.Controller).to(ImageController);
container.bind<IRegistrableController>(TYPES.Controller).to(ImageTypeController);
container.bind<IRegistrableController>(TYPES.Controller).to(PreprocessingController);
container.bind<IRegistrableController>(TYPES.Controller).to(PreprocessingTypeController);
container.bind<IRegistrableController>(TYPES.Controller).to(RevisionController);
container.bind<IRegistrableController>(TYPES.Controller).to(TaskController);
container.bind<IRegistrableController>(TYPES.Controller).to(TaskTypeController);
container.bind<IRegistrableController>(TYPES.Controller).to(UserController);
// Services
container.bind<BiomarkerTypeService>(TYPES.BiomarkerTypeService).to(BiomarkerTypeService);
container.bind<ImageService>(TYPES.ImageService).to(ImageService);
container.bind<ImageTypeService>(TYPES.ImageTypeService).to(ImageTypeService);
container.bind<PreprocessingService>(TYPES.PreprocessingService).to(PreprocessingService);
container.bind<PreprocessingTypeService>(TYPES.PreprocessingTypeService).to(PreprocessingTypeService);
container.bind<RevisionService>(TYPES.RevisionService).to(RevisionService);
container.bind<TaskService>(TYPES.TaskService).to(TaskService);
container.bind<TaskTypeService>(TYPES.TaskTypeService).to(TaskTypeService);
container.bind<UserService>(TYPES.UserService).to(UserService);
// Repositories
container.bind<BiomarkerTypeRepository>(TYPES.BiomarkerTypeRepository).to(BiomarkerTypeRepository);
container.bind<ConnectionProvider>('ConnectionProvider').toProvider<Connection>(connectionProvider);
container.bind<ImageRepository>(TYPES.ImageRepository).to(ImageRepository);
container.bind<ImageTypeRepository>(TYPES.ImageTypeRepository).to(ImageTypeRepository);
container.bind<PreprocessingRepository>(TYPES.PreprocessingRepository).to(PreprocessingRepository);
container.bind<PreprocessingTypeRepository>(TYPES.PreprocessingTypeRepository).to(PreprocessingTypeRepository);
container.bind<RevisionRepository>(TYPES.RevisionRepository).to(RevisionRepository);
container.bind<TaskRepository>(TYPES.TaskRepository).to(TaskRepository);
container.bind<TaskTypeRepository>(TYPES.TaskTypeRepository).to(TaskTypeRepository);
container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository);

export { container };
