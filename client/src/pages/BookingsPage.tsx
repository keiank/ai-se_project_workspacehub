import { useEffect, useState, type FormEvent } from 'react';
import { PageHeader } from '../components/PageHeader';
import { StatusPanel } from '../components/StatusPanel';
import { useAuth } from '../hooks/useAuth';
import { bookingService } from '../services/bookingService';
import type { Booking } from '../types/models';
import { formatDateTimeInput } from '../utils/date';
import { canCreateBooking, canDeleteResources, canEditBooking } from '../utils/permissions';

interface BookingFormState {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
}

type BookingFormErrors = Partial<Record<keyof BookingFormState, string>>;

const buildBookingFormState = (booking: Booking): BookingFormState => ({
  title: booking.title,
  description: booking.description,
  startsAt: formatDateTimeInput(booking.startsAt),
  endsAt: formatDateTimeInput(booking.endsAt),
});

export const BookingsPage = () => {
  const { isFeatureEnabled, user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingEdits, setBookingEdits] = useState<Record<string, BookingFormState>>({});
  const [createState, setCreateState] = useState<BookingFormState>({
    title: '',
    description: '',
    startsAt: '',
    endsAt: '',
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [bookingErrors, setBookingErrors] = useState<Record<string, string>>({});
  const [createTouched, setCreateTouched] = useState<
    Partial<Record<keyof BookingFormState, boolean>>
  >({});
  const [editTouched, setEditTouched] = useState<
    Record<string, Partial<Record<keyof BookingFormState, boolean>>>
  >({});

  const validateBookingFormState = (form: BookingFormState): BookingFormErrors => {
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

  useEffect(() => {
    const loadBookings = async () => {
      if (!isFeatureEnabled('scheduling')) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError(null);

      try {
        const nextBookings = await bookingService.list();
        setBookings(nextBookings);
        setBookingEdits(
          Object.fromEntries(
            nextBookings.map((booking) => [booking._id, buildBookingFormState(booking)]),
          ),
        );
      } catch (loadError) {
        setLoadError(loadError instanceof Error ? loadError.message : 'Unable to load bookings');
      } finally {
        setLoading(false);
      }
    };

    void loadBookings();
  }, [isFeatureEnabled]);

  const canCreate = canCreateBooking(user);

  const createErrors = validateBookingFormState(createState);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canCreate) {
      setCreateError('You do not have permission to create bookings.');
      return;
    }

    setCreateError(null);
    const normalizedState = {
      ...createState,
      title: createState.title.trim(),
    };

    const errors = validateBookingFormState(normalizedState);
    if (Object.keys(errors).length) {
      setCreateTouched({
        title: true,
        description: true,
        startsAt: true,
        endsAt: true,
      });
      return;
    }

    try {
      const booking = await bookingService.create(normalizedState);
      setBookings((current) =>
        [...current, booking].sort((left, right) => left.startsAt.localeCompare(right.startsAt)),
      );
      setBookingEdits((current) => ({
        ...current,
        [booking._id]: buildBookingFormState(booking),
      }));
      setCreateState({
        title: '',
        description: '',
        startsAt: '',
        endsAt: '',
      });
      setCreateTouched({});
      setCreateError(null);
    } catch (createError) {
      setCreateError(
        createError instanceof Error ? createError.message : 'Unable to create booking',
      );
    }
  };

  const handleEdit = (bookingId: string, field: keyof BookingFormState, value: string) => {
    setBookingEdits((current) => ({
      ...current,
      [bookingId]: {
        ...current[bookingId],
        [field]: value,
      },
    }));
  };

  const handleSave = async (bookingId: string) => {
    const booking = bookings.find((entry) => entry._id === bookingId);
    if (!booking) {
      setBookingErrors((current) => ({
        ...current,
        [bookingId]: 'Booking not found.',
      }));
      return;
    }

    setBookingErrors((current) => ({ ...current, [bookingId]: '' }));
    const formState = bookingEdits[bookingId] ?? buildBookingFormState(booking);

    const normalizedState = {
      ...formState,
      title: formState.title.trim(),
    };

    const errors = validateBookingFormState(normalizedState);
    if (Object.keys(errors).length) {
      setEditTouched((current) => ({
        ...current,
        [bookingId]: {
          title: true,
          description: true,
          startsAt: true,
          endsAt: true,
        },
      }));
      return;
    }

    try {
      const updatedBooking = await bookingService.update(bookingId, normalizedState);
      setBookings((current) =>
        current.map((entry) => (entry._id === bookingId ? updatedBooking : entry)),
      );
      setBookingEdits((current) => ({
        ...current,
        [bookingId]: buildBookingFormState(updatedBooking),
      }));
      setBookingErrors((current) => ({ ...current, [bookingId]: '' }));
      setEditTouched((current) => {
        const next = { ...current };
        delete next[bookingId];
        return next;
      });
    } catch (saveError) {
      setBookingErrors((current) => ({
        ...current,
        [bookingId]: saveError instanceof Error ? saveError.message : 'Unable to update booking',
      }));
    }
  };

  const handleDelete = async (bookingId: string) => {
    try {
      await bookingService.delete(bookingId);
      setBookings((current) => current.filter((booking) => booking._id !== bookingId));
      setBookingEdits((current) => {
        const nextEdits = { ...current };
        delete nextEdits[bookingId];
        return nextEdits;
      });
      setBookingErrors((current) => {
        const nextErrors = { ...current };
        delete nextErrors[bookingId];
        return nextErrors;
      });
    } catch (deleteError) {
      setBookingErrors((current) => ({
        ...current,
        [bookingId]:
          deleteError instanceof Error ? deleteError.message : 'Unable to delete booking',
      }));
    }
  };

  if (!isFeatureEnabled('scheduling')) {
    return (
      <StatusPanel
        title="Scheduling disabled"
        message="This page is hidden by the organization feature flags."
      />
    );
  }

  if (loading) {
    return <StatusPanel title="Loading bookings" message="Fetching schedule items." />;
  }

  if (loadError) {
    return <StatusPanel title="Bookings unavailable" message={loadError} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Manage simple shared bookings with conflict prevention on the API."
        title="Bookings"
      />
      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <form className="rounded-3xl bg-white p-6 shadow-sm" onSubmit={handleCreate}>
          <h2 className="text-xl font-semibold text-ink">Create booking</h2>
          <div className="mt-4 space-y-4">
            <input
              className="w-full rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 placeholder:text-[#94A3B880] disabled:cursor-not-allowed disabled:bg-slate-100"
              disabled={!canCreate}
              onChange={(event) =>
                setCreateState((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              onBlur={() => setCreateTouched((current) => ({ ...current, title: true }))}
              placeholder="Booking title"
              value={createState.title}
            />
            {createTouched.title && createErrors.title ? (
              <p className="text-sm text-danger">{createErrors.title}</p>
            ) : null}
            <textarea
              className="min-h-28 w-full rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 placeholder:text-[#94A3B880] disabled:cursor-not-allowed disabled:bg-slate-100"
              disabled={!canCreate}
              onChange={(event) =>
                setCreateState((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              onBlur={() =>
                setCreateTouched((current) => ({
                  ...current,
                  description: true,
                }))
              }
              placeholder="Booking description"
              value={createState.description}
            />
            {createTouched.description && createErrors.description ? (
              <p className="text-sm text-danger">{createErrors.description}</p>
            ) : null}
            <input
              className="w-full rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 disabled:cursor-not-allowed disabled:bg-slate-100"
              disabled={!canCreate}
              onChange={(event) =>
                setCreateState((current) => ({
                  ...current,
                  startsAt: event.target.value,
                }))
              }
              onBlur={() => setCreateTouched((current) => ({ ...current, startsAt: true }))}
              type="datetime-local"
              value={createState.startsAt}
            />
            {createTouched.startsAt && createErrors.startsAt ? (
              <p className="text-sm text-danger">{createErrors.startsAt}</p>
            ) : null}
            <input
              className="w-full rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 disabled:cursor-not-allowed disabled:bg-slate-100"
              disabled={!canCreate}
              onChange={(event) =>
                setCreateState((current) => ({
                  ...current,
                  endsAt: event.target.value,
                }))
              }
              onBlur={() => setCreateTouched((current) => ({ ...current, endsAt: true }))}
              type="datetime-local"
              value={createState.endsAt}
            />
            {createTouched.endsAt && createErrors.endsAt ? (
              <p className="text-sm text-danger">{createErrors.endsAt}</p>
            ) : null}
            {createError ? <p className="text-sm text-danger">{createError}</p> : null}
            <button
              className="rounded-[12px] bg-ink px-4 py-3 font-medium text-white transition hover:opacity-80 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canCreate}
              type="submit"
            >
              Create booking
            </button>
          </div>
        </form>
        {bookings.length ? (
          <ul className="space-y-4">
            {bookings.map((booking) => {
              const canEdit = canEditBooking(user, booking);
              const formState = bookingEdits[booking._id];
              const editErrors = validateBookingFormState(
                formState ?? buildBookingFormState(booking),
              );

              return (
                <li key={booking._id}>
                  <article className="rounded-3xl bg-white p-6 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        className="rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 disabled:bg-slate-100 md:col-span-2"
                        disabled={!canEdit}
                        onChange={(event) => handleEdit(booking._id, 'title', event.target.value)}
                        onBlur={() =>
                          setEditTouched((current) => ({
                            ...current,
                            [booking._id]: {
                              ...current[booking._id],
                              title: true,
                            },
                          }))
                        }
                        value={formState?.title ?? booking.title}
                      />
                      {editTouched[booking._id]?.title && editErrors.title ? (
                        <p className="text-sm text-danger">{editErrors.title}</p>
                      ) : null}
                      <textarea
                        className="min-h-24 rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 disabled:bg-slate-100 md:col-span-2"
                        disabled={!canEdit}
                        onChange={(event) =>
                          handleEdit(booking._id, 'description', event.target.value)
                        }
                        onBlur={() =>
                          setEditTouched((current) => ({
                            ...current,
                            [booking._id]: {
                              ...current[booking._id],
                              description: true,
                            },
                          }))
                        }
                        value={formState?.description ?? booking.description}
                      />
                      {editTouched[booking._id]?.description && editErrors.description ? (
                        <p className="text-sm text-danger">{editErrors.description}</p>
                      ) : null}
                      <input
                        className="rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 disabled:bg-slate-100"
                        disabled={!canEdit}
                        onChange={(event) =>
                          handleEdit(booking._id, 'startsAt', event.target.value)
                        }
                        onBlur={() =>
                          setEditTouched((current) => ({
                            ...current,
                            [booking._id]: {
                              ...current[booking._id],
                              startsAt: true,
                            },
                          }))
                        }
                        type="datetime-local"
                        value={formState?.startsAt ?? formatDateTimeInput(booking.startsAt)}
                      />
                      {editTouched[booking._id]?.startsAt && editErrors.startsAt ? (
                        <p className="text-sm text-danger">{editErrors.startsAt}</p>
                      ) : null}
                      <input
                        className="rounded-2xl border border-slate-200 transition hover:border-slate-300 px-4 py-3 disabled:bg-slate-100"
                        disabled={!canEdit}
                        onChange={(event) => handleEdit(booking._id, 'endsAt', event.target.value)}
                        onBlur={() =>
                          setEditTouched((current) => ({
                            ...current,
                            [booking._id]: {
                              ...current[booking._id],
                              endsAt: true,
                            },
                          }))
                        }
                        type="datetime-local"
                        value={formState?.endsAt ?? formatDateTimeInput(booking.endsAt)}
                      />
                      {editTouched[booking._id]?.endsAt && editErrors.endsAt ? (
                        <p className="text-sm text-danger">{editErrors.endsAt}</p>
                      ) : null}
                    </div>
                    {bookingErrors[booking._id] ? (
                      <p className="mt-4 text-sm text-danger">{bookingErrors[booking._id]}</p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        className="rounded-[10px] bg-ink px-4 py-2 text-sm font-medium text-white transition hover:opacity-80 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!canEdit}
                        onClick={() => void handleSave(booking._id)}
                        type="button"
                      >
                        Save
                      </button>
                      {canDeleteResources(user) ? (
                        <button
                          className="rounded-[10px] px-5 py-2.5 text-sm font-normal text-danger transition hover:bg-rose-50 active:opacity-70"
                          onClick={() => void handleDelete(booking._id)}
                          type="button"
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        ) : (
          <StatusPanel
            title="No bookings"
            message="Add the first scheduling entry for this organization."
          />
        )}
      </section>
    </div>
  );
};
