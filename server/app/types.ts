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
    TaskTypeRepository: Symbol.for('TaskGroupRepository'),
    UserRepository: Symbol.for('UserRepository'),
    EvenementRepository: Symbol.for('EvenementRepository'),
    // Services
    ImageService: Symbol.for('ImageService'),
    AnnotationService: Symbol.for('AnnotationService'),
    TaskService: Symbol.for('TaskService'),
    TaskGroupService: Symbol.for('TaskGroupService'),
    UserService: Symbol.for('UserService'),
    EvenementService: Symbol.for('EvenementService'),
};

export default TYPES;
