export class CommentBoxSingleton {

  private static instance: CommentBoxSingleton;
  comments = [];

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
  public static getInstance(): CommentBoxSingleton {
      if (!CommentBoxSingleton.instance) {
        CommentBoxSingleton.instance = new CommentBoxSingleton();
      }

      return CommentBoxSingleton.instance;
  }
}
