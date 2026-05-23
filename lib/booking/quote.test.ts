import { describe, test } from "node:test"
import assert from "node:assert/strict"
import { calculateQuote } from "./quote.ts"

const DAY = "2024-06-15T12:00:00.000Z"
const AT22 = "2024-06-15T22:00:00.000Z"
const AT559 = "2024-06-15T05:59:00.000Z"
const AT600 = "2024-06-15T06:00:00.000Z"

describe("calculateQuote", () => {
  test("base fare: central–central, executive → £40", () => {
    const q = calculateQuote({ pickup: "central", dropoff: "central", vehicleClass: "executive", datetime: DAY })
    assert.equal(q.subtotal, 40)
    assert.equal(q.total, 40)
    assert.equal(q.isNight, false)
  })

  test("business 1.3× → £52", () => {
    const q = calculateQuote({ pickup: "central", dropoff: "central", vehicleClass: "business", datetime: DAY })
    assert.equal(q.total, 52)
  })

  test("first-class 1.7× → £68", () => {
    const q = calculateQuote({ pickup: "central", dropoff: "central", vehicleClass: "first-class", datetime: DAY })
    assert.equal(q.total, 68)
  })

  test("night surcharge +20% at 22:00", () => {
    const q = calculateQuote({ pickup: "central", dropoff: "central", vehicleClass: "executive", datetime: AT22 })
    assert.equal(q.isNight, true)
    assert.equal(q.nightSurcharge, 8)
    assert.equal(q.total, 48)
  })

  test("night surcharge applies at 05:59", () => {
    const q = calculateQuote({ pickup: "central", dropoff: "central", vehicleClass: "executive", datetime: AT559 })
    assert.equal(q.isNight, true)
  })

  test("no night surcharge at 06:00", () => {
    const q = calculateQuote({ pickup: "central", dropoff: "central", vehicleClass: "executive", datetime: AT600 })
    assert.equal(q.isNight, false)
    assert.equal(q.nightSurcharge, 0)
  })

  test("outer–outer → minimum £35", () => {
    const q = calculateQuote({ pickup: "outer", dropoff: "outer", vehicleClass: "executive", datetime: DAY })
    assert.equal(q.subtotal, 35)
    assert.equal(q.total, 35)
  })

  test("zone-pair symmetry: central→outer equals outer→central", () => {
    const q1 = calculateQuote({ pickup: "central", dropoff: "outer", vehicleClass: "executive", datetime: DAY })
    const q2 = calculateQuote({ pickup: "outer", dropoff: "central", vehicleClass: "executive", datetime: DAY })
    assert.equal(q1.total, q2.total)
  })

  test("airport–central: 40 × 2.0 = £80", () => {
    const q = calculateQuote({ pickup: "airport", dropoff: "central", vehicleClass: "executive", datetime: DAY })
    assert.equal(q.total, 80)
  })

  test("currency is GBP", () => {
    const q = calculateQuote({ pickup: "central", dropoff: "inner", vehicleClass: "executive", datetime: DAY })
    assert.equal(q.currency, "GBP")
  })
})
