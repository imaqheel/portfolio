import HeaderNavigation from './components/layout/HeaderNavigation'
import AboutSection from './components/sections/AboutSection'
import ContactSection from './components/sections/ContactSection'
import ExperienceSection from './components/sections/ExperienceSection'
import FAQSection from './components/sections/FAQSection'
import HeroSection from './components/sections/HeroSection'
import PricingSection from './components/sections/PricingSection'

function App() {
  return (
    <>
      <HeaderNavigation />
        <main className="w-full scroll-smooth">
        <HeroSection />
        <AboutSection />
        <ExperienceSection />
        <PricingSection />
        <FAQSection />
        <ContactSection />
      </main>
    </>
  )
}

export default App
