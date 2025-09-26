import { describe, it, expect } from 'vitest';
import { shuffleArray, generateSeating, hasForbiddenPairConflict, placeFixedSeats, generateSeatingWithRetries } from '../utils.js';

describe('utils', () => {
    it('shuffleArray keeps elements and length', () => {
        const arr = [1, 2, 3, 4, 5];
        const s = shuffleArray(arr);
        expect(s).toHaveLength(arr.length);
        // same set
        expect(s.sort()).toEqual(arr.slice().sort());
    });

    it('generateSeating produces correct rows and cols', () => {
        const shuffled = [1, 2, 3, 4, 5, 6];
        const seating = generateSeating(shuffled, 2, 3);
        expect(seating).toHaveLength(2);
        expect(seating[0]).toHaveLength(3);
        expect(seating.flat()).toEqual(shuffled);
    });

    it('hasForbiddenPairConflict detects horizontal and vertical conflicts', () => {
        const seating = [
            [1, 2, 3],
            [4, 5, 6]
        ];
        expect(hasForbiddenPairConflict(seating, [[1, 2]], 2, 3)).toBe(true); // horizontal
        expect(hasForbiddenPairConflict(seating, [[2, 5]], 2, 3)).toBe(true); // vertical
        expect(hasForbiddenPairConflict(seating, [[7, 8]], 2, 3)).toBe(false);
    });

    it('placeFixedSeats applies fixed seats and removes from shuffled list', () => {
        const seating = [
            [null, null],
            [null, null]
        ];
        const shuffled = [1, 2, 3, 4];
        const remaining = placeFixedSeats(seating, [{ student: 2, row: 0, col: 1 }, { student: 4, row: 1, col: 0 }], shuffled.slice());
        expect(seating[0][1]).toBe(2);
        expect(seating[1][0]).toBe(4);
        expect(remaining).toEqual(expect.not.arrayContaining([2, 4]));
    });

    it('generateSeatingWithRetries returns seating respecting forbidden pairs when possible', () => {
        const seating = generateSeatingWithRetries(6, 2, 3, [[7, 8]], []);
        expect(seating).toHaveLength(2);
        expect(seating[0]).toHaveLength(3);
        // all numbers 1..6 should appear once
        const flat = seating.flat().filter(x => x !== null).sort((a, b) => a - b);
        expect(flat).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('generateSeatingWithRetries throws when fixed seats force forbidden adjacency', () => {
        // create impossible case: fixed seats place 1 and 2 adjacent while forbiddenPairs include [1,2]
        const rows = 1;
        const cols = 2;
        const students = 2;
        const fixedSeats = [{ student: 1, row: 0, col: 0 }, { student: 2, row: 0, col: 1 }];
        expect(() => generateSeatingWithRetries(students, rows, cols, [[1, 2]], fixedSeats)).toThrow(/最大リトライ回数/);
    });
});
