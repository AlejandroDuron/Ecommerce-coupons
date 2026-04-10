// pages/Home.jsx
import { useEffect } from 'react'
import useAppStore from '../store/useAppStore'
import HeroSection from '../components/home/HeroSection'
import CategoryGrid from '../components/home/CategoryGrid'
import FeaturedOffers from '../components/home/FeaturedOffers'

export default function Home() {
  const { fetchOffers, offers } = useAppStore()

  useEffect(() => {
    if (!offers.length) fetchOffers()
  }, [])

  return (
    <main>
      <HeroSection />
      <CategoryGrid />
      <FeaturedOffers />
    </main>
  )
}
