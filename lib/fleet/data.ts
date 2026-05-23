import type { Vehicle } from "@/lib/fleet/types"

export const vehicles: Vehicle[] = [
  {
    id: "executive-sedan",
    name: "Premium Sedan",
    vehicleClass: "executive",
    capacity: 3,
    features: ["Leather interior", "Climate control", "Complimentary Wi-Fi"],
    description:
      "A refined sedan combining comfort and efficiency. Ideal for solo business travellers and airport runs requiring a composed, professional arrival.",
  },
  {
    id: "executive-estate",
    name: "Executive Estate",
    vehicleClass: "executive",
    capacity: 3,
    features: ["Extended luggage space", "Leather interior", "Complimentary Wi-Fi"],
    description:
      "The estate variant adds generous luggage capacity without sacrificing the polished experience expected on every executive journey.",
  },
  {
    id: "business-saloon",
    name: "Business Saloon",
    vehicleClass: "business",
    capacity: 3,
    features: ["Premium audio", "Ambient lighting", "Chilled water provided"],
    description:
      "An elevated saloon for those who require a noticeably superior cabin. Long wheelbase options available on request for added legroom.",
  },
  {
    id: "business-suv",
    name: "Executive SUV",
    vehicleClass: "business",
    capacity: 4,
    features: ["Raised seating position", "Privacy glass", "Chilled water provided"],
    description:
      "The SUV format suits clients who prefer a commanding view and the reassurance of a larger vehicle on motorway and inter-city routes.",
  },
  {
    id: "first-class-saloon",
    name: "First Class Saloon",
    vehicleClass: "first-class",
    capacity: 3,
    features: ["Massage seats", "Panoramic roof", "Champagne on request"],
    description:
      "The pinnacle of private hire. An S-Class-grade cabin delivers near-silent progress and an atmosphere of unhurried luxury for the most discerning travellers.",
  },
  {
    id: "first-class-van",
    name: "First Class MPV",
    vehicleClass: "first-class",
    capacity: 6,
    features: ["Captain's chairs", "Privacy glass", "Champagne on request"],
    description:
      "Full first-class refinement extended across a larger group. Captain's chairs and individual climate zones ensure every passenger travels in equal comfort.",
  },
]
