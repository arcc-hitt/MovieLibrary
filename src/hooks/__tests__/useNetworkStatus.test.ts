import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNetworkStatus, useNetworkAwareAPI } from '../useNetworkStatus';

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: true,
});

// Mock navigator.connection
const mockConnection = {
    effectiveType: '4g',
    type: 'wifi',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
};

Object.defineProperty(navigator, 'connection', {
    writable: true,
    value: mockConnection,
});

describe('useNetworkStatus', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (navigator as any).onLine = true;
        mockConnection.effectiveType = '4g';
    });

    it('initializes with online status', () => {
        const { result } = renderHook(() => useNetworkStatus());

        expect(result.current.isOnline).toBe(true);
        expect(result.current.isSlowConnection).toBe(false);
        expect(result.current.connectionType).toBe('4g');
    });

    it('detects slow connection', () => {
        mockConnection.effectiveType = '2g';

        const { result } = renderHook(() => useNetworkStatus());

        expect(result.current.isSlowConnection).toBe(true);
    });

    it('detects very slow connection', () => {
        mockConnection.effectiveType = 'slow-2g';

        const { result } = renderHook(() => useNetworkStatus());

        expect(result.current.isSlowConnection).toBe(true);
    });

    it('handles online/offline events', () => {
        const { result } = renderHook(() => useNetworkStatus());

        // Simulate going offline
        act(() => {
            (navigator as any).onLine = false;
            window.dispatchEvent(new Event('offline'));
        });

        expect(result.current.isOnline).toBe(false);

        // Simulate going back online
        act(() => {
            (navigator as any).onLine = true;
            window.dispatchEvent(new Event('online'));
        });

        expect(result.current.isOnline).toBe(true);
    });

    it('handles connection changes', () => {
        const { result } = renderHook(() => useNetworkStatus());

        expect(mockConnection.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

        // Simulate connection change
        act(() => {
            mockConnection.effectiveType = '3g';
            const changeHandler = mockConnection.addEventListener.mock.calls.find(
                call => call[0] === 'change'
            )?.[1];
            changeHandler?.();
        });

        expect(result.current.connectionType).toBe('3g');
    });

    it('cleans up event listeners on unmount', () => {
        const { unmount } = renderHook(() => useNetworkStatus());

        unmount();

        expect(mockConnection.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
});

describe('useNetworkAwareAPI', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (navigator as any).onLine = true;
        mockConnection.effectiveType = '4g';
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('makes successful request when online', async () => {
        const { result } = renderHook(() => useNetworkAwareAPI());
        const mockOperation = vi.fn().mockResolvedValue('success');

        const promise = result.current.makeRequest(mockOperation);

        await act(async () => {
            const response = await promise;
            expect(response).toBe('success');
        });

        expect(mockOperation).toHaveBeenCalledOnce();
    });

    it('throws error when offline', async () => {
        (navigator as any).onLine = false;
        const { result } = renderHook(() => useNetworkAwareAPI());
        const mockOperation = vi.fn();

        await expect(result.current.makeRequest(mockOperation)).rejects.toThrow(
            'No internet connection. Please check your network and try again.'
        );

        expect(mockOperation).not.toHaveBeenCalled();
    });

    it('uses longer timeout for slow connections', async () => {
        mockConnection.effectiveType = '2g';
        const { result } = renderHook(() => useNetworkAwareAPI());

        const mockOperation = vi.fn().mockImplementation(() =>
            new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timeout')), 20000);
            })
        );

        const promise = result.current.makeRequest(mockOperation);

        // Fast forward time to trigger timeout
        act(() => {
            vi.advanceTimersByTime(15000);
        });

        await expect(promise).rejects.toThrow('Request timeout');
    });

    it('retries failed requests with exponential backoff', async () => {
        const { result } = renderHook(() => useNetworkAwareAPI());
        const mockOperation = vi.fn()
            .mockRejectedValueOnce(new Error('Network error'))
            .mockRejectedValueOnce(new Error('Network error'))
            .mockResolvedValueOnce('success');

        const promise = result.current.makeRequest(mockOperation, { retries: 2, retryDelay: 1000 });

        // Fast forward through retry delays
        act(() => {
            vi.advanceTimersByTime(1000); // First retry delay
        });

        act(() => {
            vi.advanceTimersByTime(2000); // Second retry delay (exponential backoff)
        });

        const result_value = await act(async () => {
            return await promise;
        });

        expect(result_value).toBe('success');
        expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    it('does not retry 4xx errors (except 429)', async () => {
        const { result } = renderHook(() => useNetworkAwareAPI());
        const mockOperation = vi.fn().mockRejectedValue({ status_code: 404 });

        await expect(result.current.makeRequest(mockOperation, { retries: 2 })).rejects.toEqual({
            status_code: 404
        });

        expect(mockOperation).toHaveBeenCalledOnce();
    });

    it('retries 429 rate limiting errors', async () => {
        const { result } = renderHook(() => useNetworkAwareAPI());
        const mockOperation = vi.fn()
            .mockRejectedValueOnce({ status_code: 429 })
            .mockResolvedValueOnce('success');

        const promise = result.current.makeRequest(mockOperation, { retries: 1, retryDelay: 1000 });

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        const result_value = await act(async () => {
            return await promise;
        });

        expect(result_value).toBe('success');
        expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('throws last error after all retries exhausted', async () => {
        const { result } = renderHook(() => useNetworkAwareAPI());
        const lastError = new Error('Final error');
        const mockOperation = vi.fn()
            .mockRejectedValueOnce(new Error('First error'))
            .mockRejectedValueOnce(lastError);

        const promise = result.current.makeRequest(mockOperation, { retries: 1, retryDelay: 100 });

        act(() => {
            vi.advanceTimersByTime(100);
        });

        await expect(promise).rejects.toThrow('Final error');
        expect(mockOperation).toHaveBeenCalledTimes(2);
    });
});