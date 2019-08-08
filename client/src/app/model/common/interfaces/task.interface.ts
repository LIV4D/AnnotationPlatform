interface ITask {

    id: number;
    comment: string;
    isVisible: boolean;
    isComplete: boolean;
    taskGroup: {
        id: number;
        title: string;
        description: string;
    };
    user: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    };
    image: {
        id: number;
        metadata: string;
        type: string;
    };
    annotation: {
        id: number;
    };
}

export type Task = Partial<ITask>;
