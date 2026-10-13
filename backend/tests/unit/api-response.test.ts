import { Response } from 'express';
import { sendSuccess, sendError } from '../../src/utils/api-response';
import { AppError, NotFoundError, ValidationError } from '../../src/utils/errors';

function createMockResponse(): Partial<Response> & { _status: number; _json: unknown } {
  const res: Partial<Response> & { _status: number; _json: unknown } = {
    _status: 200,
    _json: null,
    status(code: number) {
      this._status = code;
      return this as unknown as Response;
    },
    json(body: unknown) {
      this._json = body;
      return this as unknown as Response;
    },
  };
  return res;
}

describe('API Response Helpers', () => {
  it('sendSuccess should format standard success payload', () => {
    const res = createMockResponse();
    sendSuccess(res as unknown as Response, { user: 'test' }, 'Data retrieved');

    expect(res._status).toBe(200);
    expect(res._json).toEqual({
      success: true,
      message: 'Data retrieved',
      data: { user: 'test' },
    });
  });

  it('sendError should format standard error payload', () => {
    const res = createMockResponse();
    sendError(res as unknown as Response, 'Resource missing', 404, ['item not found']);

    expect(res._status).toBe(404);
    expect(res._json).toEqual({
      success: false,
      message: 'Resource missing',
      errors: ['item not found'],
    });
  });
});

describe('Custom Errors', () => {
  it('AppError creates operational error with statusCode', () => {
    const err = new AppError('Something bad', 500);
    expect(err.statusCode).toBe(500);
    expect(err.isOperational).toBe(true);
    expect(err.message).toBe('Something bad');
  });

  it('NotFoundError sets 404 status code', () => {
    const err = new NotFoundError('User not found');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('User not found');
  });

  it('ValidationError sets 422 status code with errors array', () => {
    const err = new ValidationError('Invalid inputs', ['email invalid']);
    expect(err.statusCode).toBe(422);
    expect(err.errors).toEqual(['email invalid']);
  });
});
