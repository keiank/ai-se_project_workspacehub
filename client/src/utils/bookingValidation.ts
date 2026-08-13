interface BookingFormState {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
}

type BookingFormErrors = Partial<Record<keyof BookingFormState, string>>;

export const validateBookingFormState = (form: BookingFormState): BookingFormErrors => {
  const errors: BookingFormErrors = {};

  if (!form.title || form.title.trim().length < 2) {
    errors.title = 'Title must be at least 2 characters.';
  }

  if (!form.startsAt) {
    errors.startsAt = 'Start date/time is required.';
  }

  if (!form.endsAt) {
    errors.endsAt = 'End date/time is required.';
  }

  const starts = new Date(form.startsAt);
  const ends = new Date(form.endsAt);

  if (form.startsAt && Number.isNaN(starts.getTime())) {
    errors.startsAt = 'Start date/time is invalid.';
  }

  if (form.endsAt && Number.isNaN(ends.getTime())) {
    errors.endsAt = 'End date/time is invalid.';
  }

  if (
    form.startsAt &&
    form.endsAt &&
    !Number.isNaN(starts.getTime()) &&
    !Number.isNaN(ends.getTime()) &&
    !(ends.getTime() > starts.getTime())
  ) {
    errors.endsAt = 'End date/time must be after start date/time.';
  }

  return errors;
};
