import { generatePageMetadata } from "@/lib/seo"
import { HomePageClient } from "./homeClient"

export const metadata = generatePageMetadata("home")

export default function HomePage() {
  return <HomePageClient />
}
