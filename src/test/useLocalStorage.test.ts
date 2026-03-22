import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('returns stored value when localStorage already has data', () => {
    localStorage.setItem('test_key', JSON.stringify('stored_value'));
    const { result } = renderHook(() => useLocalStorage('test_key', 'initial'));
    expect(result.current[0]).toBe('stored_value');
  });

  it('returns initial value for object type when localStorage is empty', () => {
    const defaultVal = { count: 0 };
    const { result } = renderHook(() => useLocalStorage('test_obj', defaultVal));
    expect(result.current[0]).toEqual(defaultVal);
  });

  it('returns stored object when localStorage has data', () => {
    const stored = { count: 42 };
    localStorage.setItem('test_obj', JSON.stringify(stored));
    const { result } = renderHook(() => useLocalStorage('test_obj', { count: 0 }));
    expect(result.current[0]).toEqual(stored);
  });

  it('setValue updates state and localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', 'initial'));
    act(() => {
      result.current[1]('new_value');
    });
    expect(result.current[0]).toBe('new_value');
    expect(JSON.parse(localStorage.getItem('test_key')!)).toBe('new_value');
  });

  it('setValue with function updater works correctly', () => {
    const { result } = renderHook(() => useLocalStorage('test_count', 5));
    act(() => {
      result.current[1]((prev) => prev + 1);
    });
    expect(result.current[0]).toBe(6);
    expect(JSON.parse(localStorage.getItem('test_count')!)).toBe(6);
  });

  it('setValue with function updater works for arrays', () => {
    const { result } = renderHook(() => useLocalStorage<string[]>('test_arr', []));
    act(() => {
      result.current[1]((prev) => [...prev, 'item1']);
    });
    expect(result.current[0]).toEqual(['item1']);
    act(() => {
      result.current[1]((prev) => [...prev, 'item2']);
    });
    expect(result.current[0]).toEqual(['item1', 'item2']);
  });

  it('handles malformed JSON gracefully by returning initial value', () => {
    localStorage.setItem('bad_key', '{not valid json');
    const { result } = renderHook(() => useLocalStorage('bad_key', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('sets localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage<number[]>('test_nums', []));
    act(() => {
      result.current[1]([1, 2, 3]);
    });
    const stored = JSON.parse(localStorage.getItem('test_nums')!);
    expect(stored).toEqual([1, 2, 3]);
  });
});
