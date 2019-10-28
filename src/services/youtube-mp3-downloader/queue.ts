export interface ITask<T> {
  id: string;
  data: T;
  aborted?: boolean;
  main: (task: this) => Promise<object>;
};

export class Queue<T> {
  private tasks: ITask<T>[] = [];
  private currentTask: ITask<T>;
  private inProcess = false;

  constructor(private autoStart = true) {}

  add(...tasks: ITask<T>[]): void {
    this.tasks.push(...tasks);
    if (!this.inProcess && this.autoStart) {
      this.start();
    }
  }

  remove(taskId: ITask<T>['id']): void {
    if (this.taskIsCurrent(taskId)) {
      this.abortCurrentTask();
      this.process();
    } else {
      this.findAndAbortTask(taskId);
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
    this.currentTask = this.tasks.shift();
    try {
      await this.currentTask.main(this.currentTask);
      this.process();
    } catch (error) {
      console.info('task failed:', this.currentTask);
      this.remove(this.currentTask.id);
    }
  }

  private taskIsCurrent(taskId: ITask<T>['id']): boolean {
    return taskId === this.currentTask?.id;
  }

  private findAndAbortTask(taskId: string) {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
      // in case someone memorized it as reference
      this.tasks[taskIndex].aborted = true;
      if (taskIndex > -1) {
        this.tasks.splice(taskIndex, 1);
      }
    } else {
      console.info('tried to remove not exists task', taskId);
    }
  }

  private abortCurrentTask() {
    this.currentTask.aborted = true;
  }
}