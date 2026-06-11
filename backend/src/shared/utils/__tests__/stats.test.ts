import { average, median, round2 } from '../stats';

describe('round2', () => {
  it('rounds to two decimal places', () => {
    expect(round2(21.6666)).toBe(21.67);
  });
});

describe('average', () => {
  it('returns null for an empty list', () => {
    expect(average([])).toBeNull();
  });

  it('computes the mean rounded to two decimals', () => {
    expect(average([10, 20, 35])).toBe(21.67);
  });
});

describe('median', () => {
  it('returns null for an empty list', () => {
    expect(median([])).toBeNull();
  });

  it('returns the middle value for an odd-length list', () => {
    expect(median([5, 1, 3])).toBe(3);
  });

  it('averages the two middle values for an even-length list', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });
});
