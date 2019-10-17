export interface ITask<T> {
  id: string;
  data: T;
  aborted?: boolean;
  main: (task: this) => Promise<object>;
};

export class Queue<T> {
  private tasks: ITask<T>[] = [];
  private inProcess = false;

  add(...tasks: ITask<T>[]): void {
    this.tasks.push(...tasks);
    if (!this.inProcess) {
      this.start();
    }
  }

  remove(callback: (task: ITask<T>) => boolean): void {
    const taskIndex = this.tasks.findIndex(callback);
    // in case someone memorized it as reference
    this.tasks[taskIndex].aborted = true;
    if (taskIndex > -1) {
      this.tasks.splice(taskIndex, 1);
    }
  }

  start() {
    this.process();
  }

  private async process() {
    if (!this.tasks.length) {
      this.inProcess = false;
      return;
    }
    this.inProcess = true;
    const task = this.tasks.shift();
    await task.main(task);
    this.process();
  }
}