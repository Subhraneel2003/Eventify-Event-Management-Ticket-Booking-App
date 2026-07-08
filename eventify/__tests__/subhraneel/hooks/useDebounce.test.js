import React from 'react';
import { render, act } from '@testing-library/react-native';
import { useDebounce } from '../../../src/hooks/useDebounce';
import { Text } from 'react-native';

function TestComponent({ value, delay }) {
    const debouncedValue = useDebounce(value, delay);
    return <Text testID="debounced">{debouncedValue}</Text>;
}

describe('useDebounce', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('returns the initial value immediately', () => {
        const { getByTestId } = render(<TestComponent value="A" delay={500} />);

        expect(getByTestId('debounced').props.children).toBe('A');
    });

    it('updates the debounced value only after the delay', () => {
        const { getByTestId, rerender } = render(<TestComponent value="A" delay={500} />);

        rerender(<TestComponent value="B" delay={500} />);

        expect(getByTestId('debounced').props.children).toBe('A');

        act(() => {
            jest.advanceTimersByTime(500);
        });

        expect(getByTestId('debounced').props.children).toBe('B');
    });

    it('resets the timer when value changes before the delay', () => {
        const { getByTestId, rerender } = render(<TestComponent value="A" delay={500} />);

        rerender(<TestComponent value="B" delay={500} />);
        act(() => {
            jest.advanceTimersByTime(200);
        });

        rerender(<TestComponent value="C" delay={500} />);
        act(() => {
            jest.advanceTimersByTime(300);
        });

        expect(getByTestId('debounced').props.children).toBe('A');

        act(() => {
            jest.advanceTimersByTime(200);
        });

        expect(getByTestId('debounced').props.children).toBe('C');
    });
});
