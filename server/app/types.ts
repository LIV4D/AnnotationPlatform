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
    TaskPriorityRepository: Symbol.for('TaskPriorityRepository'),
    ImageTypeRepository: Symbol.for('ImageTypeRepository'),
    // Services
    ImageService: Symbol.for('ImageService'),
    AnnotationService: Symbol.for('AnnotationService'),
    TaskService: Symbol.for('TaskService'),
    TaskTypeService: Symbol.for('TaskTypeService'),
    UserService: Symbol.for('UserService'),
    TaskPriorityService: Symbol.for('TaskPriorityService'),
    SubmissionEventService: Symbol.for('SubmissionEventService'),
    ImageTypeService: Symbol.for('ImageTypeService'),
    ManagementService: Symbol.for('ManagementService'),
};

export default TYPES;
