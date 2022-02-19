import { Queue, ITask } from './queue';
import * as flush from 'flush-promises';

describe('Queue', () => {
  let queue: Queue<any>;
  let task1: ITask<any>;
  let task2: ITask<any>;

  beforeEach(() => {
    queue = new Queue(false);
  });

  const generateTask = (id: string, mainSpy?: jest.Mock) => ({
    id,
    main: mainSpy ?? jest.fn(() => {
      return Promise.resolve();
    }),
    data: {}
  });

  it('should work when adding a single task', () => {
    task1 = generateTask('1');
    queue.add(task1);
    queue.start();
    expect(task1.main).toHaveBeenCalled();
  });

  describe('autoStart', () => {
    it('should auto start the queue by default', () => {
      queue = new Queue();
      task1 = generateTask('1');
      queue.add(task1);

      expect(task1.main).toHaveBeenCalled();
    });
  });

  describe('multiple tasks', () => {
    describe('sync', () => {
      let spy1: jest.Mock;

      beforeEach(() => {
        spy1 = jest.fn(() => Promise.resolve());

        task1 = generateTask('1', spy1);
        task2 = generateTask('2', jest.fn(() => Promise.resolve()));

        queue.add(task1, task2);
      });

      it('should run all task in queue', async () => {
        queue.start();
        expect(task1.main).toHaveBeenCalled();
        await spy1();
        expect(task2.main).toHaveBeenCalled();
      });

      it('should not run task 2 if removed', async () => {
        queue.remove(task2.id);
        queue.start();
        expect(task1.main).toHaveBeenCalled();
        expect(task2.main).not.toHaveBeenCalled();
      });

      it('should abort an async task when it removed from the queue', async () => {
        queue.add(task1, task2);
        queue.start();
        expect(task1.main).toHaveBeenCalled();
        queue.remove(task2.id);

        expect(task2.main).not.toHaveBeenCalled();
        expect(task2.aborted).toBe(true);
      });
    });
  });
});