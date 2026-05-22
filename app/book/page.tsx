import BookingForm from "@/components/BookingForm"
import Footer from "@/components/Footer"

export const metadata = {
  title: "Book a Transfer — London Premium Transfers",
  description:
    "Get an instant quote for your executive transfer. Airport pickups, city rides, and hourly hire across London and the UK.",
}

export default function BookPage() {
  return (
    <>
      <main className="flex-1 bg-paper">
        <div className="mx-auto max-w-[1440px] px-pad py-section">
          {/* Section header — matches Fleet/Services pattern */}
          <header className="mb-16 max-w-xl">
            <p className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-ink-mute">
              <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              Instant estimate
            </p>
            <h1 className="mb-6 font-sans text-4xl font-normal leading-none tracking-tight md:text-5xl">
              Book a{" "}
              <em className="font-serif font-normal italic">transfer</em>
            </h1>
            <p className="text-lg leading-relaxed text-ink-soft">
              Select your pickup and dropoff zones, vehicle class, and travel time to get an instant price estimate. A member of our team will confirm your booking within two hours.
            </p>
          </header>

          {/* Non-dismissable disclaimer — required by spec */}
          <div
            role="note"
            className="mb-12 rounded-l border border-line bg-paper-2 px-6 py-4 text-sm text-ink-soft"
          >
            Quotes shown are estimates from a static demo pricing model; not a booking confirmation.
          </div>

          <div className="max-w-2xl">
            <BookingForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
