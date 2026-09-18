import { type FormEvent } from 'react';

import { act, renderHook } from '@testing-library/react';

import useTabModalSubmit from './useTabModalSubmit';

const obj = { metadata: { name: 'test-vm' } };

const createSubmitEvent = (): FormEvent<HTMLFormElement> =>
  ({ preventDefault: jest.fn() }) as unknown as FormEvent<HTMLFormElement>;

describe('useTabModalSubmit', () => {
  it('should not call onSubmit from executeSubmit when disabled', () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
      useTabModalSubmit({
        closeOnSubmit: true,
        isDisabled: true,
        obj,
        onClose: jest.fn(),
        onSubmit,
      }),
    );

    act(() => {
      result.current.executeSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should prevent default and not call onSubmit from handleSubmit when disabled', () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
      useTabModalSubmit({
        closeOnSubmit: true,
        isDisabled: true,
        obj,
        onClose: jest.fn(),
        onSubmit,
      }),
    );
    const event = createSubmitEvent();

    act(() => {
      result.current.handleSubmit(event);
    });

    expect(event.preventDefault).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should call onSubmit from executeSubmit when enabled', async () => {
    const onSubmit = jest.fn().mockResolvedValue(obj);
    const { result } = renderHook(() =>
      useTabModalSubmit({
        closeOnSubmit: false,
        isDisabled: false,
        obj,
        onClose: jest.fn(),
        onSubmit,
      }),
    );

    await act(async () => {
      result.current.executeSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith(obj);
  });

  it('should not start a second submit while one is in flight', async () => {
    let resolveSubmit: (value: unknown) => void = () => undefined;
    const onSubmit = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve;
        }),
    );
    const { result } = renderHook(() =>
      useTabModalSubmit({
        closeOnSubmit: false,
        isDisabled: false,
        obj,
        onClose: jest.fn(),
        onSubmit,
      }),
    );

    await act(async () => {
      result.current.executeSubmit();
      result.current.executeSubmit();
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSubmit(obj);
    });
  });

  it('should reset submitting state when onSubmit throws synchronously', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    const onSubmit = jest.fn();
    onSubmit.mockImplementationOnce(() => {
      throw new Error('sync fail');
    });
    const { result } = renderHook(() =>
      useTabModalSubmit({
        closeOnSubmit: false,
        isDisabled: false,
        obj,
        onClose: jest.fn(),
        onSubmit,
      }),
    );

    try {
      await act(async () => {
        result.current.executeSubmit();
      });

      expect(result.current.isSubmitting).toBe(false);

      onSubmit.mockResolvedValue(obj);

      await act(async () => {
        result.current.executeSubmit();
      });

      expect(onSubmit).toHaveBeenCalledTimes(2);
    } finally {
      consoleError.mockRestore();
    }
  });
});
