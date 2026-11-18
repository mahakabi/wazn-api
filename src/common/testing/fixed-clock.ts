import { type Clock } from '../domain/clock';

const MS_PER_SECOND = 1000;

export class FixedClock implements Clock {
  constructor(private current: Date = new Date('2026-11-18T12:00:00.000Z')) {}

  now(): Date {
    return new Date(this.current);
  }

  advanceSeconds(seconds: number): void {
    this.current = new Date(this.current.getTime() + seconds * MS_PER_SECOND);
  }
}
