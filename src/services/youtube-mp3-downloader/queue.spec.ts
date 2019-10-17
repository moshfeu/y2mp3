import { Queue, ITask } from './queue';
import * as flush from 'flush-promises';

describe('Queue', () => {
  let queue: Queue<any>;
  let task1: ITask<any>;
  let task2: ITask<any>;

  beforeEach(() => {
    queue = new Queue();
  });

  const generateTask = (id: string) => ({
    id,
    main: jest.fn(() => {
      return Promise.resolve({});
    }),
    data: {}
  });

  it('should work when addin a single task', () => {
    task1 = generateTask('1');
    queue.add(task1);
    queue.start();
    expect(task1.main).toHaveBeenCalled();
  });

  it.only('should ', async () => {
    const generateAsyncTask = (id: string): { task: ITask<any>, spy: jest.FunctionLike} => {
      const spy = jest.fn();
      return {
        task: {
          id: id,
          main: (): Promise<object> => {
            return new Promise(resolve => {
              setTimeout(() => {
                spy();
                resolve();
              }, 100);
            });
          },
          data: {}
        },
        spy
      }
    };

    const { task: task1, spy: spy1 } = generateAsyncTask('1');
    const { task: task2, spy: spy2 } = generateAsyncTask('2');

    queue.add(task1, task2);
    queue.start();
    jest.runOnlyPendingTimers();
    expect(spy1).toHaveBeenCalled();
    queue.remove(t => t.id === task2.id);
    await flush();
    jest.runOnlyPendingTimers();

    expect(spy2).not.toHaveBeenCalled();
    expect(task2.aborted).toBeTruthy();
  });

  describe('', () => {
    beforeEach(() => {
      task1 = generateTask('1');
      task2 = generateTask('2');

      queue.add(task1, task2);
    });

    it('should run all task in queue', async () => {
      queue.start();
      expect(task1.main).toHaveBeenCalled();
      await flush();
      expect(task2.main).toHaveBeenCalled();
    });

    it('should not run task 2 if removed', async () => {
      queue.remove(t => t.id === task2.id);
      queue.start();
      expect(task1.main).toHaveBeenCalled();
      await flush();
      expect(task2.main).not.toHaveBeenCalled();
    });
  });
});