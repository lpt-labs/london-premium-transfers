import type { Zone, VehicleClass } from "./quote.ts"

export interface BookingInput {
  pickup: Zone
  dropoff: Zone
  vehicleClass: VehicleClass
  datetime: string
  name: string
  email: string
  phone: string
}

type ParseResult =
  | { ok: true; data: BookingInput }
  | { ok: false; errors: Record<string, string> }

const ZONES = new Set<string>(["central", "inner", "outer", "airport"])
const VEHICLE_CLASSES = new Set<string>(["executive", "business", "first-class"])
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000

export function parseBookingInput(raw: Record<string, string>): ParseResult {
  const errors: Record<string, string> = {}

  if (!raw.pickup || !ZONES.has(raw.pickup)) {
    errors.pickup = "Please select a pickup zone."
  }
  if (!raw.dropoff || !ZONES.has(raw.dropoff)) {
    errors.dropoff = "Please select a dropoff zone."
  }
  if (!raw.vehicleClass || !VEHICLE_CLASSES.has(raw.vehicleClass)) {
    errors.vehicleClass = "Please select a vehicle class."
  }

  if (!raw.datetime) {
    errors.datetime = "Please select a pickup date and time."
  } else {
    const dt = new Date(raw.datetime)
    if (isNaN(dt.getTime())) {
      errors.datetime = "Invalid date and time."
    } else if (dt.getTime() <= Date.now()) {
      errors.datetime = "Pickup time must be in the future."
    } else if (dt.getTime() > Date.now() + NINETY_DAYS_MS) {
      errors.datetime = "Pickup time must be within the next 90 days."
    }
  }

  if (!raw.name || raw.name.trim().length === 0) {
    errors.name = "Please enter your name."
  }
  if (!raw.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.email)) {
    errors.email = "Please enter a valid email address."
  }
  if (!raw.phone || !/^\+?[\d\s\-().]{7,}$/.test(raw.phone)) {
    errors.phone = "Please enter a valid phone number (at least 7 digits)."
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    data: {
      pickup: raw.pickup as Zone,
      dropoff: raw.dropoff as Zone,
      vehicleClass: raw.vehicleClass as VehicleClass,
      datetime: raw.datetime,
      name: raw.name.trim(),
      email: raw.email.trim().toLowerCase(),
      phone: raw.phone.trim(),
    },
  }
}
