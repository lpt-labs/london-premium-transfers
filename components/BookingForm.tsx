// "use client" is required here because this component uses React state and
// event-driven form submission via useActionState.
"use client"

import { useActionState, useRef, useEffect } from "react"
import { submitBooking, type ActionResult } from "@/app/book/actions"

const ZONES = [
  { value: "central", label: "Central London" },
  { value: "inner", label: "Inner London" },
  { value: "outer", label: "Outer London" },
  { value: "airport", label: "Airport" },
] as const

const VEHICLE_CLASSES = [
  { value: "executive", label: "Executive" },
  { value: "business", label: "Business Class" },
  { value: "first-class", label: "First Class" },
] as const

const initial: ActionResult = { ok: false }

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-1 text-sm text-danger">
      {message}
    </p>
  )
}

export default function BookingForm() {
  const [state, formAction, pending] = useActionState(submitBooking, initial)
  const errorSummaryRef = useRef<HTMLDivElement>(null)

  // Move focus to error summary after a failed submission so screen readers
  // announce the validation failures immediately.
  useEffect(() => {
    if (state.errors && errorSummaryRef.current) {
      errorSummaryRef.current.focus()
    }
  }, [state.errors])

  const e = state.errors ?? {}

  return (
    <form action={formAction} noValidate>
      {/* Error summary — announced by screen readers on focus */}
      {state.errors && (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          aria-live="assertive"
          className="mb-8 rounded-l border border-danger bg-danger/5 p-6 focus:outline-none"
        >
          <p className="text-sm font-medium text-danger">
            Please fix the highlighted fields before continuing.
          </p>
        </div>
      )}

      {/* Quote result */}
      {state.ok && state.quote && (
        <div
          role="status"
          aria-live="polite"
          className="mb-8 rounded-l border border-ok bg-ok/5 p-6"
        >
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-ok">
            Estimated quote
          </p>
          <p className="text-3xl font-normal tracking-tight text-ink">
            £{state.quote.total.toFixed(2)}{" "}
            <span className="text-base font-normal text-ink-soft">GBP</span>
          </p>
          {state.quote.isNight && (
            <p className="mt-2 text-sm text-ink-soft">
              Includes 20% night surcharge (22:00–06:00 UTC).
            </p>
          )}
          <p className="mt-3 text-xs text-ink-mute">
            Base: £{state.quote.subtotal.toFixed(2)} · Night surcharge: £{state.quote.nightSurcharge.toFixed(2)}
          </p>
        </div>
      )}

      <fieldset className="mb-8">
        <legend className="mb-6 text-base font-medium text-ink">Journey details</legend>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Pickup zone */}
          <div>
            <label htmlFor="pickup" className="mb-2 block text-sm font-medium text-ink">
              Pickup zone
            </label>
            <select
              id="pickup"
              name="pickup"
              aria-describedby={e.pickup ? "pickup-error" : undefined}
              aria-invalid={!!e.pickup}
              className="w-full rounded-m border border-line bg-paper px-4 py-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <option value="">Select zone</option>
              {ZONES.map((z) => (
                <option key={z.value} value={z.value}>
                  {z.label}
                </option>
              ))}
            </select>
            <FieldError id="pickup-error" message={e.pickup} />
          </div>

          {/* Dropoff zone */}
          <div>
            <label htmlFor="dropoff" className="mb-2 block text-sm font-medium text-ink">
              Dropoff zone
            </label>
            <select
              id="dropoff"
              name="dropoff"
              aria-describedby={e.dropoff ? "dropoff-error" : undefined}
              aria-invalid={!!e.dropoff}
              className="w-full rounded-m border border-line bg-paper px-4 py-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <option value="">Select zone</option>
              {ZONES.map((z) => (
                <option key={z.value} value={z.value}>
                  {z.label}
                </option>
              ))}
            </select>
            <FieldError id="dropoff-error" message={e.dropoff} />
          </div>

          {/* Vehicle class */}
          <div>
            <label htmlFor="vehicleClass" className="mb-2 block text-sm font-medium text-ink">
              Vehicle class
            </label>
            <select
              id="vehicleClass"
              name="vehicleClass"
              aria-describedby={e.vehicleClass ? "vehicleClass-error" : undefined}
              aria-invalid={!!e.vehicleClass}
              className="w-full rounded-m border border-line bg-paper px-4 py-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <option value="">Select class</option>
              {VEHICLE_CLASSES.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
            <FieldError id="vehicleClass-error" message={e.vehicleClass} />
          </div>

          {/* Pickup datetime */}
          <div>
            <label htmlFor="datetime" className="mb-2 block text-sm font-medium text-ink">
              Pickup date and time
            </label>
            <input
              type="datetime-local"
              id="datetime"
              name="datetime"
              aria-describedby={e.datetime ? "datetime-error" : undefined}
              aria-invalid={!!e.datetime}
              className="w-full rounded-m border border-line bg-paper px-4 py-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            />
            <FieldError id="datetime-error" message={e.datetime} />
          </div>
        </div>
      </fieldset>

      <fieldset className="mb-8">
        <legend className="mb-6 text-base font-medium text-ink">Contact details</legend>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Name */}
          <div className="sm:col-span-2">
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-ink">
              Full name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              autoComplete="name"
              aria-describedby={e.name ? "name-error" : undefined}
              aria-invalid={!!e.name}
              className="w-full rounded-m border border-line bg-paper px-4 py-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            />
            <FieldError id="name-error" message={e.name} />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink">
              Email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              aria-describedby={e.email ? "email-error" : undefined}
              aria-invalid={!!e.email}
              className="w-full rounded-m border border-line bg-paper px-4 py-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            />
            <FieldError id="email-error" message={e.email} />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-ink">
              Phone number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              autoComplete="tel"
              aria-describedby={e.phone ? "phone-error" : undefined}
              aria-invalid={!!e.phone}
              className="w-full rounded-m border border-line bg-paper px-4 py-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            />
            <FieldError id="phone-error" message={e.phone} />
          </div>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-accent-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-60"
      >
        {pending ? "Calculating…" : "Get quote"}
      </button>
    </form>
  )
}
