import { runExclusiveForVm } from './vmCancelCleanupQueue';

const flushMicrotasks = () => Promise.resolve();

describe('runExclusiveForVm', () => {
  it('runs tasks for the same key sequentially, one at a time', async () => {
    const order: string[] = [];
    let resolveFirst: () => void = () => undefined;

    const first = runExclusiveForVm('sequential-key', async () => {
      order.push('first-start');
      await new Promise<void>((resolve) => {
        resolveFirst = resolve;
      });
      order.push('first-end');
    });

    const second = runExclusiveForVm('sequential-key', async () => {
      order.push('second-start');
    });

    await flushMicrotasks();
    // The second task must not have started yet: the first is still pending.
    expect(order).toEqual(['first-start']);

    resolveFirst();
    await Promise.all([first, second]);

    expect(order).toEqual(['first-start', 'first-end', 'second-start']);
  });

  it('runs tasks for different keys independently', async () => {
    const order: string[] = [];
    let resolveA: () => void = () => undefined;

    const taskA = runExclusiveForVm('independent-key-a', async () => {
      order.push('a-start');
      await new Promise<void>((resolve) => {
        resolveA = resolve;
      });
      order.push('a-end');
    });

    const taskB = runExclusiveForVm('independent-key-b', async () => {
      order.push('b-start');
    });

    await taskB;

    // taskB (a different key) completed while taskA is still pending.
    expect(order).toContain('a-start');
    expect(order).toContain('b-start');
    expect(order).not.toContain('a-end');

    resolveA();
    await taskA;
    expect(order).toContain('a-end');
  });

  it('continues running queued tasks even if an earlier task rejects', async () => {
    const order: string[] = [];

    const first = runExclusiveForVm('rejecting-key', async () => {
      order.push('first');
      throw new Error('boom');
    });

    const second = runExclusiveForVm('rejecting-key', async () => {
      order.push('second');
    });

    await expect(first).rejects.toThrow('boom');
    await expect(second).resolves.toBeUndefined();
    expect(order).toEqual(['first', 'second']);
  });

  it('propagates each task result to its own caller', async () => {
    const succeeded = runExclusiveForVm('propagate-key', async () => undefined);
    const failed = runExclusiveForVm('propagate-key', async () => {
      throw new Error('fail');
    });

    await expect(succeeded).resolves.toBeUndefined();
    await expect(failed).rejects.toThrow('fail');
  });

  it('serializes more than two tasks queued on the same key', async () => {
    const order: string[] = [];
    let resolveFirst: () => void = () => undefined;

    const first = runExclusiveForVm('three-key', async () => {
      order.push('1-start');
      await new Promise<void>((resolve) => {
        resolveFirst = resolve;
      });
      order.push('1-end');
    });

    const second = runExclusiveForVm('three-key', async () => {
      order.push('2');
    });

    const third = runExclusiveForVm('three-key', async () => {
      order.push('3');
    });

    await flushMicrotasks();
    expect(order).toEqual(['1-start']);

    resolveFirst();
    await Promise.all([first, second, third]);

    expect(order).toEqual(['1-start', '1-end', '2', '3']);
  });
});
