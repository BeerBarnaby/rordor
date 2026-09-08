import { describe, it, expect, beforeEach } from 'vitest';
import { RhythmCalculator } from '../rhythmCalculator';

describe('RhythmCalculator', () => {
  let calculator: RhythmCalculator;

  beforeEach(() => {
    calculator = new RhythmCalculator(6);
  });

  it('should handle insufficient tap data (0 or 1 tap)', () => {
    const initialResult = calculator.calculateResult();
    expect(initialResult.state).toBe('insufficient');
    expect(initialResult.bpm).toBe(0);

    const firstTapResult = calculator.addTap(1000);
    expect(firstTapResult.state).toBe('insufficient');
    expect(firstTapResult.bpm).toBe(0);
  });

  it('should calculate exactly 100 BPM when interval is 600ms', () => {
    let now = 1000;
    calculator.addTap(now);

    // Add taps every 600ms (60,000 / 600 = 100 BPM)
    for (let i = 0; i < 5; i++) {
      now += 600;
      calculator.addTap(now);
    }

    const result = calculator.calculateResult();
    expect(result.bpm).toBe(100);
    expect(result.state).toBe('good');
    expect(result.feedbackMessage).toContain('จังหวะดี');
  });

  it('should calculate exactly 120 BPM when interval is 500ms', () => {
    let now = 1000;
    calculator.addTap(now);

    // Add taps every 500ms (60,000 / 500 = 120 BPM)
    for (let i = 0; i < 5; i++) {
      now += 500;
      calculator.addTap(now);
    }

    const result = calculator.calculateResult();
    expect(result.bpm).toBe(120);
    expect(result.state).toBe('good');
    expect(result.feedbackMessage).toContain('จังหวะดี');
  });

  it('should detect when rhythm is too slow (<100 BPM)', () => {
    let now = 1000;
    calculator.addTap(now);

    // Add taps every 750ms (60,000 / 750 = 80 BPM)
    for (let i = 0; i < 4; i++) {
      now += 750;
      calculator.addTap(now);
    }

    const result = calculator.calculateResult();
    expect(result.bpm).toBe(80);
    expect(result.state).toBe('slow');
    expect(result.feedbackMessage).toContain('ช้าไป');
  });

  it('should detect when rhythm is too fast (>120 BPM)', () => {
    let now = 1000;
    calculator.addTap(now);

    // Add taps every 400ms (60,000 / 400 = 150 BPM)
    for (let i = 0; i < 4; i++) {
      now += 400;
      calculator.addTap(now);
    }

    const result = calculator.calculateResult();
    expect(result.bpm).toBe(150);
    expect(result.state).toBe('fast');
    expect(result.feedbackMessage).toContain('เร็วไป');
  });

  it('should maintain rolling window size of 6 intervals (7 timestamps)', () => {
    let now = 1000;
    
    // Start with 5 slow taps (800ms = 75 BPM)
    calculator.addTap(now);
    for (let i = 0; i < 4; i++) {
      now += 800;
      calculator.addTap(now);
    }

    // Now switch to fast taps (500ms = 120 BPM) and push 8 of them
    for (let i = 0; i < 8; i++) {
      now += 500;
      calculator.addTap(now);
    }

    const result = calculator.calculateResult();
    // The rolling window should have discarded old slow taps and calculate ~120 BPM
    expect(result.bpm).toBe(120);
    expect(result.state).toBe('good');
  });
});
