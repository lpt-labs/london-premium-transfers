// "use client" required for tab selection state (useState) and form interaction
"use client"

import { useState } from "react"
import { Icon } from "@/components/Icon"

type Tab = "transfer" | "hourly" | "long-distance"

const tabs: { id: Tab; label: string }[] = [
  { id: "transfer", label: "Transfer" },
  { id: "hourly", label: "Hourly" },
  { id: "long-distance", label: "Long Distance" },
]

const passengerOptions = [1, 2, 3, 4, 5, 6, 7, 8] as const
const durationOptions = [
  { value: "2", label: "2 hours" },
  { value: "3", label: "3 hours" },
  { value: "4", label: "4 hours" },
  { value: "6", label: "6 hours" },
  { value: "8", label: "8 hours" },
  { value: "12", label: "12 hours" },
] as const
const luggageOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const

const inputClass =
  "w-full rounded-m border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink-mute focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"

const labelClass = "mb-1.5 block text-xs font-medium text-ink-soft"

export default function BookingWidget() {
  const [tab, setTab] = useState<Tab>("transfer")

  return (
    <div
      id="booking-anchor"
      className="mx-auto w-full max-w-[1440px] px-pad md:-mt-20"
    >
      <div className="rounded-xl border border-line bg-paper shadow-s3">
        {/* Tab bar */}
        <div
          role="tablist"
          aria-label="Booking type"
          className="flex gap-0 border-b border-line"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={
                "flex-1 px-4 py-4 text-sm font-medium transition-colors first:rounded-tl-xl last:rounded-tr-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent " +
                (tab === t.id
                  ? "border-b-2 border-ink text-ink"
                  : "text-ink-mute hover:text-ink-soft")
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form
          method="GET"
          action="/book"
          id={`panel-${tab}`}
          role="tabpanel"
          aria-label={tabs.find((t) => t.id === tab)?.label}
          className="p-6"
        >
          <input type="hidden" name="service" value={tab} />

          {tab === "transfer" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <label htmlFor="pickup" className={labelClass}>
                  Pickup location
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute">
                    <Icon name="pin" size={15} stroke={1.5} />
                  </span>
                  <input
                    id="pickup"
                    name="pickup"
                    type="text"
                    placeholder="Address or airport"
                    className={inputClass + " pl-9"}
                  />
                </div>
              </div>

              <div className="lg:col-span-1">
                <label htmlFor="dropoff" className={labelClass}>
                  Dropoff location
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute">
                    <Icon name="pin" size={15} stroke={1.5} />
                  </span>
                  <input
                    id="dropoff"
                    name="dropoff"
                    type="text"
                    placeholder="Address or airport"
                    className={inputClass + " pl-9"}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="date" className={labelClass}>
                  Date
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="time" className={labelClass}>
                  Time
                </label>
                <input
                  id="time"
                  name="time"
                  type="time"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="passengers" className={labelClass}>
                  Passengers
                </label>
                <select id="passengers" name="passengers" className={inputClass}>
                  {passengerOptions.map((n) => (
                    <option key={n} value={n}>
                      {n} passenger{n !== 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="return"
                  name="return"
                  value="1"
                  className="h-4 w-4 rounded border-line accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                />
                <label htmlFor="return" className="text-sm text-ink-soft cursor-pointer">
                  Return trip
                </label>
              </div>
            </div>
          )}

          {tab === "hourly" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <label htmlFor="hourly-pickup" className={labelClass}>
                  Pickup location
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute">
                    <Icon name="pin" size={15} stroke={1.5} />
                  </span>
                  <input
                    id="hourly-pickup"
                    name="pickup"
                    type="text"
                    placeholder="Address or area"
                    className={inputClass + " pl-9"}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="hourly-date" className={labelClass}>
                  Date
                </label>
                <input
                  id="hourly-date"
                  name="date"
                  type="date"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="hourly-time" className={labelClass}>
                  Start time
                </label>
                <input
                  id="hourly-time"
                  name="time"
                  type="time"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="duration" className={labelClass}>
                  Duration
                </label>
                <select id="duration" name="duration" className={inputClass}>
                  {durationOptions.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="hourly-passengers" className={labelClass}>
                  Passengers
                </label>
                <select id="hourly-passengers" name="passengers" className={inputClass}>
                  {passengerOptions.map((n) => (
                    <option key={n} value={n}>
                      {n} passenger{n !== 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {tab === "long-distance" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <label htmlFor="ld-pickup" className={labelClass}>
                  Pickup location
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute">
                    <Icon name="pin" size={15} stroke={1.5} />
                  </span>
                  <input
                    id="ld-pickup"
                    name="pickup"
                    type="text"
                    placeholder="City or address"
                    className={inputClass + " pl-9"}
                  />
                </div>
              </div>

              <div className="lg:col-span-1">
                <label htmlFor="ld-dropoff" className={labelClass}>
                  Dropoff location
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute">
                    <Icon name="pin" size={15} stroke={1.5} />
                  </span>
                  <input
                    id="ld-dropoff"
                    name="dropoff"
                    type="text"
                    placeholder="City or address"
                    className={inputClass + " pl-9"}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ld-date" className={labelClass}>
                  Date
                </label>
                <input
                  id="ld-date"
                  name="date"
                  type="date"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="ld-time" className={labelClass}>
                  Time
                </label>
                <input
                  id="ld-time"
                  name="time"
                  type="time"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="ld-passengers" className={labelClass}>
                  Passengers
                </label>
                <select id="ld-passengers" name="passengers" className={inputClass}>
                  {passengerOptions.map((n) => (
                    <option key={n} value={n}>
                      {n} passenger{n !== 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="luggage" className={labelClass}>
                  Luggage
                </label>
                <select id="luggage" name="luggage" className={inputClass}>
                  {luggageOptions.map((n) => (
                    <option key={n} value={n}>
                      {n === 0 ? "No luggage" : `${n} piece${n !== 1 ? "s" : ""}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-8 py-4 text-sm font-medium text-paper transition-colors hover:bg-ink-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
            >
              Get an instant fare
              <Icon name="arrow" size={16} stroke={2} />
            </button>
            <p className="text-xs text-ink-mute">No card required</p>
          </div>
        </form>
      </div>
    </div>
  )
}
