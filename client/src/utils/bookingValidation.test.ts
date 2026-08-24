import { describe, it, expect } from 'vitest';
import { validateBookingFormState, BookingFormState, BookingFormErrors } from './bookingValidation';

describe('validateBookingFormState', () => {
  it('returns an empty object when the form is valid', () => {
    const form: BookingFormState = {
      title: 'Team sync',
      description: 'Weekly planning',
      startsAt: '2026-08-14T10:00:00.000Z',
      endsAt: '2026-08-14T11:00:00.000Z',
    };

    const errors: BookingFormErrors = validateBookingFormState(form);
    expect(errors).toEqual({});
  });

  it('sets `title` when missing or shorter than 2 characters', () => {
    const cases: string[] = ['', 'A'];

    for (const title of cases) {
      const form: BookingFormState = {
        title,
        description: '',
        startsAt: '2026-08-14T10:00:00.000Z',
        endsAt: '2026-08-14T11:00:00.000Z',
      };

      const errors: BookingFormErrors = validateBookingFormState(form);
      expect(errors.title).toBeDefined();
      expect(typeof errors.title).toBe('string');
    }
  });

  it('sets `startsAt` when not provided', () => {
    const form: BookingFormState = {
      title: 'Valid',
      description: '',
      startsAt: '',
      endsAt: '2026-08-14T11:00:00.000Z',
    };

    const errors: BookingFormErrors = validateBookingFormState(form);
    expect(errors.startsAt).toBeDefined();
    expect(typeof errors.startsAt).toBe('string');
  });

  it('sets `endsAt` when not provided', () => {
    const form: BookingFormState = {
      title: 'Valid',
      description: '',
      startsAt: '2026-08-14T10:00:00.000Z',
      endsAt: '',
    };

    const errors: BookingFormErrors = validateBookingFormState(form);
    expect(errors.endsAt).toBeDefined();
    expect(typeof errors.endsAt).toBe('string');
  });

  it('sets `startsAt` when the value is an invalid date', () => {
    const form: BookingFormState = {
      title: 'Valid',
      description: '',
      startsAt: 'not-a-date',
      endsAt: '2026-08-14T11:00:00.000Z',
    };

    const errors: BookingFormErrors = validateBookingFormState(form);
    expect(errors.startsAt).toBeDefined();
    expect(typeof errors.startsAt).toBe('string');
  });

  it('sets `endsAt` when the value is an invalid date', () => {
    const form: BookingFormState = {
      title: 'Valid',
      description: '',
      startsAt: '2026-08-14T10:00:00.000Z',
      endsAt: 'not-a-date',
    };

    const errors: BookingFormErrors = validateBookingFormState(form);
    expect(errors.endsAt).toBeDefined();
    expect(typeof errors.endsAt).toBe('string');
  });

  it('sets `endsAt` when endsAt is not strictly after startsAt (equal)', () => {
    const time = '2026-08-14T10:00:00.000Z';
    const form: BookingFormState = {
      title: 'Valid',
      description: '',
      startsAt: time,
      endsAt: time,
    };

    const errors: BookingFormErrors = validateBookingFormState(form);
    expect(errors.endsAt).toBeDefined();
    expect(typeof errors.endsAt).toBe('string');
  });

  it('sets `endsAt` when endsAt is before startsAt', () => {
    const form: BookingFormState = {
      title: 'Valid',
      description: '',
      startsAt: '2026-08-14T11:00:00.000Z',
      endsAt: '2026-08-14T10:00:00.000Z',
    };

    const errors: BookingFormErrors = validateBookingFormState(form);
    expect(errors.endsAt).toBeDefined();
    expect(typeof errors.endsAt).toBe('string');
  });
});
