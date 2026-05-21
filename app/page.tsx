import Hero from "@/components/Hero"
import Services from "@/components/Services"
import Fleet from "@/components/Fleet"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <>
      <main className="flex-1">
        <Hero />
        <Services />
        <Fleet />
      </main>
      <Footer />
    </>
  )
}
