"use server"

import { parseBookingInput } from "@/lib/booking/schema"
import { calculateQuote, type Quote } from "@/lib/booking/quote"

export interface ActionResult {
  ok: boolean
  quote?: Quote
  errors?: Record<string, string>
}

export async function submitBooking(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const fields = [
    "pickup",
    "dropoff",
    "vehicleClass",
    "datetime",
    "name",
    "email",
    "phone",
  ] as const

  const raw: Record<string, string> = {}
  for (const key of fields) {
    raw[key] = (formData.get(key) as string | null) ?? ""
  }

  const parsed = parseBookingInput(raw)
  if (!parsed.ok) {
    // Log only field names — no PII values in the server log.
    console.log("[booking] validation failed fields:", Object.keys(parsed.errors).join(", "))
    return { ok: false, errors: parsed.errors }
  }

  const { data } = parsed
  return {
    ok: true,
    quote: calculateQuote({
      pickup: data.pickup,
      dropoff: data.dropoff,
      vehicleClass: data.vehicleClass,
      datetime: data.datetime,
    }),
  }
}
