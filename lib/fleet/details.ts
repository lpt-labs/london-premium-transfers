export type VehicleDetail = {
  longDescription: string
  recommendedFor: string[]
}

export const vehicleDetails: Record<string, VehicleDetail> = {
  "executive-sedan": {
    longDescription:
      "A refined sedan combining comfort and efficiency, purpose-built for the London executive who expects punctual, composed service on every journey. The immaculate leather interior and complimentary Wi-Fi let you transition seamlessly from the boardroom to the terminal without missing a beat. Whether you are heading to Heathrow at dawn or concluding a late-night client meeting in the City, the Premium Sedan delivers a professional arrival every time.",
    recommendedFor: [
      "Airport transfers",
      "Solo business trips",
      "Cross-city client runs",
      "Early-morning departures",
    ],
  },
  "executive-estate": {
    longDescription:
      "The estate variant of our executive range adds generous, uncompromised luggage capacity without surrendering a single element of the polished experience expected on every executive journey. Ideal when extended travel demands additional kit — golf bags, presentation equipment, or multiple suitcases — the Executive Estate carries it all in the boot while preserving the refined ambience in the cabin. A single vehicle solution for travellers who refuse to choose between comfort and practicality.",
    recommendedFor: [
      "Airport transfers with luggage",
      "Corporate relocation trips",
      "Weekend away travel",
      "Event transfers",
    ],
  },
  "business-saloon": {
    longDescription:
      "An elevated saloon for clients who require a noticeably superior cabin, with premium audio, ambient lighting, and a sense of occasion that goes well beyond the everyday executive standard. Long wheelbase options are available on request for added legroom, making extended journeys across London or inter-city routes a genuinely restorative experience. Chilled water is provided as standard, and the professional driver ensures uninterrupted privacy throughout.",
    recommendedFor: [
      "Inter-city business travel",
      "VIP airport arrivals",
      "Client entertainment transfers",
      "Extended hourly hire",
      "Cross-country routes",
    ],
  },
  "business-suv": {
    longDescription:
      "The SUV format suits clients who prefer a commanding view of the road and the quiet reassurance of a larger, more imposing vehicle on motorway and inter-city routes. Privacy glass and a raised seating position create a secure, discreet environment, while chilled water and a professional driver complete the business-class experience. Particularly favoured by executives who regularly commute between London and regional UK offices.",
    recommendedFor: [
      "Motorway and inter-city runs",
      "Security-conscious travel",
      "Small group transfers",
      "Corporate roadshows",
    ],
  },
  "first-class-saloon": {
    longDescription:
      "The pinnacle of private hire, the First Class Saloon delivers an S-Class-grade cabin with near-silent progress and an atmosphere of unhurried luxury for the most discerning travellers. Massage seats, a panoramic roof, and champagne on request transform every journey into an occasion — whether a Heathrow arrival setting the tone for an important week, or a celebratory transfer to mark a milestone. Drivers are handpicked for their discretion, local knowledge, and impeccable presentation.",
    recommendedFor: [
      "Ultra-premium airport arrivals",
      "High-profile client transfers",
      "Special occasions and celebrations",
      "Diplomatic and VIP travel",
      "First-class road alternatives to rail",
    ],
  },
  "first-class-van": {
    longDescription:
      "Full first-class refinement extended across a larger group, the First Class MPV ensures that every seat in the vehicle is as comfortable and considered as the one beside it. Captain's chairs, individual climate zones, and privacy glass mean a party of up to six can travel together without any passenger feeling like an afterthought. Champagne on request and a concierge-level driver complete an experience that sets the standard for group executive travel in London.",
    recommendedFor: [
      "Group airport transfers",
      "Board-level away days",
      "Event and gala transportation",
      "Multi-passenger VIP arrivals",
      "Corporate team travel",
    ],
  },
}
