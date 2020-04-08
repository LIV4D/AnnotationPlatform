import { Task } from 'src/app/shared/models/serverModels/task.model';

export class BridgeSingleton {
  private static instance: BridgeSingleton;
  currentTask : Task;

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() {}

  /**
   * The static method that controls the access to the singleton instance.
   *
   * This implementation let you subclass the Singleton class while keeping
   * just one instance of each subclass around.
   */
  public static getInstance(): BridgeSingleton {
      if (!BridgeSingleton.instance) {
        BridgeSingleton.instance = new BridgeSingleton();
      }

      return BridgeSingleton.instance;
  }

  /**
   * Finally, any singleton should define some business logic, which can be
   * executed on its instance.
   */
  getCurrentTask(): Task {
    return this.currentTask;
  }

  setCurrentTask(task: Task) {
    this.currentTask = task;
  }
}
