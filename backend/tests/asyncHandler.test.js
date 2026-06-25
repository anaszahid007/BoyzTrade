import { describe, it, expect, vi } from 'vitest';
import asyncHandler from '../src/utils/asyncHandler.js';

describe('asyncHandler', () => {
  it('should call the wrapped function with req, res, next', async () => {
    const fn = vi.fn().mockResolvedValue('done');
    const wrapped = asyncHandler(fn);

    const req = {};
    const res = {};
    const next = vi.fn();

    await wrapped(req, res, next);

    expect(fn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next with error when wrapped function throws', async () => {
    const error = new Error('test error');
    const fn = vi.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(fn);

    const req = {};
    const res = {};
    const next = vi.fn();

    await wrapped(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
