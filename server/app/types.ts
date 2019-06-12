const TYPES = {
    Server: Symbol.for('Server'),
    Application: Symbol.for('Application'),
    Routes: Symbol.for('Routes'),
    Index: Symbol.for('Index'),
    Controller: Symbol.for('Controller'),
    Connection: Symbol.for('Connection'),
    // Repositories
    BiomarkerTypeRepository: Symbol.for('BiomarkerTypeRepository'),
    ImageRepository: Symbol.for('ImageRepository'),
    ImageTypeRepository: Symbol.for('ImageTypeRepository'),
    PreprocessingRepository: Symbol.for('PreprocessingRepository'),
    PreprocessingTypeRepository: Symbol.for('PreprocessingTypeRepository'),
    RevisionRepository: Symbol.for('RevisionRepository'),
    TaskRepository: Symbol.for('TaskRepository'),
    TaskGroupRepository: Symbol.for('TaskGroupRepository'),
    UserRepository: Symbol.for('UserRepository'),
    // Services
    BiomarkerTypeService: Symbol.for('BiomarkerTypeService'),
    ImageService: Symbol.for('ImageService'),
    ImageTypeService: Symbol.for('ImageTypeService'),
    PreprocessingService: Symbol.for('PreprocessingService'),
    PreprocessingTypeService: Symbol.for('PreprocessingTypeService'),
    RevisionService: Symbol.for('RevisionService'),
    TaskService: Symbol.for('TaskService'),
    TaskGroupService: Symbol.for('TaskGroupService'),
    UserService: Symbol.for('UserService'),
};

export default TYPES;
