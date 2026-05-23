export type VehicleClass = "executive" | "business" | "first-class"

export interface Vehicle {
  id: string
  name: string
  vehicleClass: VehicleClass
  capacity: number
  features: string[]
  description: string
}
