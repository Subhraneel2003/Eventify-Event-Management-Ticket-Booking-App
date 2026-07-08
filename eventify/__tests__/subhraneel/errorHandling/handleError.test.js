import { handleError } from '../../../src/errorHandling/handleError';

describe('handleError', () => {
    it('throws a server error when response exists', () => {
        const error = {
            response: {
                status: 500,
                data: { message: 'Internal error' },
            },
        };

        expect(() => handleError(error, 'test')).toThrow('Server error: 500');
    });

    it('throws a no response error when request exists without response', () => {
        const error = { request: {} };

        expect(() => handleError(error, 'test')).toThrow('No response from server');
    });

    it('throws the original error message for setup errors', () => {
        const error = { message: 'Bad request' };

        expect(() => handleError(error, 'test')).toThrow('Bad request');
    });
});
