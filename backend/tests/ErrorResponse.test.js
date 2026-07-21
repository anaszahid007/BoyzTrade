import { describe, it, expect } from 'vitest';
import ErrorResponse from '../src/utils/ErrorResponse.js';

describe('ErrorResponse', () => {
  it('should create an error with default values', () => {
    const err = new ErrorResponse();
    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(500);
    expect(err.message).toBe('Internal Server Error');
    expect(err.details).toBeNull();
  });

  it('should create an error with custom status and message', () => {
    const err = new ErrorResponse(404, 'Not found');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Not found');
  });

  it('should create an error with details', () => {
    const err = new ErrorResponse(400, 'Validation failed', { field: 'email' });
    expect(err.statusCode).toBe(400);
    expect(err.details).toEqual({ field: 'email' });
  });

  it('should capture stack trace', () => {
    const err = new ErrorResponse(500, 'Test');
    expect(err.stack).toBeDefined();
  });
});
