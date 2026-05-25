import { notFound } from "next/navigation"
import { vehicles } from "@/lib/fleet/data"
import { vehicleDetails } from "@/lib/fleet/details"
import VehicleDetail from "@/components/VehicleDetail"

export function generateStaticParams() {
  return vehicles.map((v) => ({ id: v.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const vehicle = vehicles.find((v) => v.id === id)
  if (!vehicle) return {}
  return {
    title: `${vehicle.name} — London Premium Transfers`,
    description: vehicle.description,
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const vehicle = vehicles.find((v) => v.id === id)
  const detail = vehicleDetails[id]

  if (!vehicle || !detail) {
    notFound()
  }

  return (
    <main>
      <VehicleDetail vehicle={vehicle} detail={detail} />
    </main>
  )
}
