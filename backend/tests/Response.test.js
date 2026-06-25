import { describe, it, expect, vi } from 'vitest';
import { success, error } from '../src/utils/Response.js';

describe('Response', () => {
  const mockRes = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  describe('success', () => {
    it('should send a success response with default values', () => {
      const res = mockRes();
      success(res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true, message: 'OK', status: 200, data: null,
      });
    });

    it('should send a success response with custom data and status', () => {
      const res = mockRes();
      success(res, { id: 1 }, 'Created', 201);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true, message: 'Created', status: 201, data: { id: 1 },
      });
    });
  });

  describe('error', () => {
    it('should send an error response with default values', () => {
      const res = mockRes();
      error(res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false, message: 'Error', details: null, status: 500,
      });
    });

    it('should send an error response with custom values', () => {
      const res = mockRes();
      error(res, 'Bad Request', 400, { field: 'email' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false, message: 'Bad Request', details: { field: 'email' }, status: 400,
      });
    });
  });
});
