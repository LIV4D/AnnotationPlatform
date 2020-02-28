const TYPES = {
    Server: Symbol.for('Server'),
    Application: Symbol.for('Application'),
    Routes: Symbol.for('Routes'),
    Index: Symbol.for('Index'),
    Controller: Symbol.for('Controller'),
    Connection: Symbol.for('Connection'),
    // Repositories
    ImageRepository: Symbol.for('ImageRepository'),
    AnnotationRepository: Symbol.for('AnnotationRepository'),
    TaskRepository: Symbol.for('TaskRepository'),
    TaskTypeRepository: Symbol.for('TaskTypeRepository'),
    UserRepository: Symbol.for('UserRepository'),
    SubmissionEventRepository: Symbol.for('SubmissionEventRepository'),
    ImageTypeRepository: Symbol.for('ImageTypeRepository'),
    // Services
    ImageService: Symbol.for('ImageService'),
    AnnotationService: Symbol.for('AnnotationService'),
    TaskService: Symbol.for('TaskService'),
    TaskTypeService: Symbol.for('TaskTypeService'),
    UserService: Symbol.for('UserService'),
    SubmissionEventService: Symbol.for('SubmissionEventService'),
    ImageTypeService: Symbol.for('ImageTypeService'),
};

export default TYPES;
