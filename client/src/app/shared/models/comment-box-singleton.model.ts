import { CommentBoxComponent } from 'src/app/ui/editor/comment-box/comment-box.component';

export class CommentBoxSingleton {

  private static instance: CommentBoxSingleton;
  comments: CommentBoxComponent[] = [];
  comment_Id: string;

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

  /**
   * Finally, any singleton should define some business logic, which can be
   * executed on its instance.
   */
  getTextAreaValues(): string[] {
    return this.comments.map( value => value.textAreaValue );
  }

  setUUID(userId: string) {
    this.comment_Id = userId;
  }

  getUUID(): string {
    return this.comment_Id;
  }
}
