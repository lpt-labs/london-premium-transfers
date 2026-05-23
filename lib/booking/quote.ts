export type Zone = "central" | "inner" | "outer" | "airport"
export type VehicleClass = "executive" | "business" | "first-class"

export interface QuoteInput {
  pickup: Zone
  dropoff: Zone
  vehicleClass: VehicleClass
  datetime: string
}

export interface Quote {
  subtotal: number
  nightSurcharge: number
  total: number
  currency: "GBP"
  isNight: boolean
}

// ── Pricing constants ─────────────────────────────────────────────────────────
// Base fare applied before zone-pair and vehicle multipliers.
const BASE = 40

// Zone-pair multiplier table. Keys are the two zones sorted alphabetically and
// joined with "-". Unlisted pairs fall back to 1.0.
const ZONE_PAIR: Record<string, number> = {
  "airport-airport": 1.5,
  "airport-central": 2.0,
  "airport-inner": 1.7,
  "airport-outer": 1.5,
  "central-central": 1.0,
  "central-inner": 1.2,
  "central-outer": 1.5,
  "inner-inner": 0.9,
  "inner-outer": 1.1,
  "outer-outer": 0.7,
}

const VEHICLE: Record<VehicleClass, number> = {
  executive: 1.0,
  business: 1.3,
  "first-class": 1.7,
}

// Absolute floor — no journey quotes below this even if the math comes out lower.
const MINIMUM = 35

// Night surcharge applied between 22:00 and 05:59 UTC.
const NIGHT_RATE = 0.2
// ─────────────────────────────────────────────────────────────────────────────

function isNight(iso: string): boolean {
  const h = new Date(iso).getUTCHours()
  return h >= 22 || h < 6
}

export function calculateQuote(input: QuoteInput): Quote {
  const { pickup, dropoff, vehicleClass, datetime } = input
  const pairKey = [pickup, dropoff].sort().join("-")
  const raw = BASE * (ZONE_PAIR[pairKey] ?? 1.0) * VEHICLE[vehicleClass]
  const subtotal = Math.round(Math.max(raw, MINIMUM) * 100) / 100
  const night = isNight(datetime)
  const nightSurcharge = night ? Math.round(subtotal * NIGHT_RATE * 100) / 100 : 0
  return {
    subtotal,
    nightSurcharge,
    total: Math.round((subtotal + nightSurcharge) * 100) / 100,
    currency: "GBP",
    isNight: night,
  }
}
