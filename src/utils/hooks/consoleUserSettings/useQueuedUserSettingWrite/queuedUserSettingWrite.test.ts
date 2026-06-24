import { createQueuedUserSettingWrite } from './queuedUserSettingWrite';

describe('createQueuedUserSettingWrite', () => {
  it('executes writes sequentially', async () => {
    const writeOrder: number[] = [];
    let releaseFirstWrite: () => void = () => undefined;
    const firstWriteGate = new Promise<void>((resolve) => {
      releaseFirstWrite = resolve;
    });

    const queuedWrite = createQueuedUserSettingWrite();

    const firstWrite = queuedWrite(1, async () => {
      await firstWriteGate;
      writeOrder.push(1);
    });
    const secondWrite = queuedWrite(2, async () => {
      writeOrder.push(2);
    });

    releaseFirstWrite();
    await Promise.all([firstWrite, secondWrite]);

    expect(writeOrder).toEqual([1, 2]);
  });

  it('resolves all callers from the same coalesced batch', async () => {
    const queuedWrite = createQueuedUserSettingWrite();
    let releaseInflight: () => void = () => undefined;
    const inflightGate = new Promise<void>((resolve) => {
      releaseInflight = resolve;
    });

    const inflightWrite = queuedWrite('inflight', async () => {
      await inflightGate;
    });

    const writtenValues: unknown[] = [];
    const writeCb = jest.fn(async (value: unknown) => {
      writtenValues.push(value);
    });

    const firstWrite = queuedWrite('first', writeCb);
    const secondWrite = queuedWrite('second', writeCb);

    releaseInflight();
    await Promise.all([inflightWrite, firstWrite, secondWrite]);

    expect(writeCb).toHaveBeenCalledTimes(1);
    expect(writtenValues).toEqual(['second']);
  });

  it('propagates write errors to coalesced waiters', async () => {
    const queuedWrite = createQueuedUserSettingWrite();
    const writeError = new Error('write failed');
    let releaseSetup: () => void = () => undefined;
    const setupGate = new Promise<void>((resolve) => {
      releaseSetup = resolve;
    });

    const setupWrite = queuedWrite('setup', async () => {
      await setupGate;
    });

    const firstWrite = queuedWrite(true, async () => undefined);
    const secondWrite = queuedWrite(false, async () => {
      throw writeError;
    });

    releaseSetup();
    await setupWrite;

    await expect(firstWrite).rejects.toThrow('write failed');
    await expect(secondWrite).rejects.toThrow('write failed');
  });

  it('processes a follow-up write after the previous one completes', async () => {
    const writtenValues: number[] = [];
    const queuedWrite = createQueuedUserSettingWrite();

    await queuedWrite(1, async (value) => {
      writtenValues.push(value);
    });
    await queuedWrite(2, async (value) => {
      writtenValues.push(value);
    });

    expect(writtenValues).toEqual([1, 2]);
  });
});
