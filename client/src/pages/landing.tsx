import { motion } from "framer-motion";
import { 
  Dumbbell, 
  BarChart3, 
  Utensils, 
  CheckCircle2, 
  Shield, 
  Timer, 
  Camera,
  Play,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCheckout = async (plan: string) => {
    try {
      setLoadingPlan(plan);
      
      // For Start plan, redirect to login
      if (plan === "Start") {
        window.location.href = "/api/login";
        return;
      }
      
      const res = await fetch("/api/create-mollie-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Fout",
          description: "Kon geen betaal-URL ophalen. Probeer het opnieuw.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Mollie payment error", err);
      toast({
        title: "Fout",
        description: "Er ging iets mis met de betaling. Probeer het later opnieuw.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const smooth = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = (e.currentTarget.getAttribute("href") || "").trim();
    if (href.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      setMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gold-500 flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/70 bg-black/70 border-b border-gold-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center">
              <Dumbbell className="text-black text-lg" />
            </div>
            <span className="font-semibold tracking-tight text-gold-500 hidden sm:inline">
              Marcodonato B.V
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a 
              href="#features" 
              onClick={smooth} 
              className="hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-gold-500 rounded-md px-1"
              data-testid="nav-features"
            >
              Functies
            </a>
            <a 
              href="#pricing" 
              onClick={smooth} 
              className="hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-gold-500 rounded-md px-1"
              data-testid="nav-pricing"
            >
              Prijzen
            </a>
            <a 
              href="#faq" 
              onClick={smooth} 
              className="hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-gold-500 rounded-md px-1"
              data-testid="nav-faq"
            >
              FAQ
            </a>
          </nav>
          
          <div className="hidden sm:flex items-center gap-3">
            <Button
              variant="outline"
              className="border-gold-500 text-gold-500 hover:bg-gold-500/10"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login"
            >
              Inloggen
            </Button>
            <Button
              className="bg-gold-500 text-black hover:bg-gold-400"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-try-free"
            >
              Probeer gratis
            </Button>
          </div>
          
          <button 
            aria-label="Open menu" 
            className="md:hidden p-2 rounded-lg border border-gold-500" 
            onClick={() => setMenuOpen(v => !v)}
            data-testid="button-mobile-menu"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        
        {menuOpen && (
          <div className="md:hidden border-t border-gold-500 bg-black/90">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3">
              <a onClick={smooth} href="#features" className="py-2" data-testid="mobile-nav-features">
                Functies
              </a>
              <a onClick={smooth} href="#pricing" className="py-2" data-testid="mobile-nav-pricing">
                Prijzen
              </a>
              <a onClick={smooth} href="#faq" className="py-2" data-testid="mobile-nav-faq">
                FAQ
              </a>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-gold-500 text-gold-500"
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="mobile-button-login"
                >
                  Inloggen
                </Button>
                <Button
                  className="flex-1 bg-gold-500 text-black"
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="mobile-button-try-free"
                >
                  Probeer gratis
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div>
              <motion.h1 
                initial={{opacity:0,y:10}} 
                animate={{opacity:1,y:0}} 
                transition={{duration:.6}} 
                className="text-[2rem] sm:text-5xl font-bold leading-tight tracking-tight text-gold-500"
                data-testid="hero-title"
              >
                Elite Exclusive Personal Training App
              </motion.h1>
              
              <p className="mt-4 text-base sm:text-lg text-gold-300" data-testid="hero-description">
                Persoonlijke trainingsschema's, progressie‑tracking, slimme gewichtsadviezen en een complete voedingsbibliotheek — in Marcodonato stijl.
              </p>
              
              <ul className="mt-6 space-y-3 text-gold-400 text-sm sm:text-base">
                <li className="flex items-start gap-3" data-testid="feature-programs">
                  <CheckCircle2 className="mt-1 shrink-0"/>
                  <span>30+ programmasjablonen (PPL, upper/lower, kracht, cut/bulk)</span>
                </li>
                <li className="flex items-start gap-3" data-testid="feature-tracking">
                  <CheckCircle2 className="mt-1 shrink-0"/>
                  <span>Track sets, reps, tempo, RPE en rusttijden</span>
                </li>
                <li className="flex items-start gap-3" data-testid="feature-nutrition">
                  <CheckCircle2 className="mt-1 shrink-0"/>
                  <span>Voedingsrecepten met macro's en boodschappenlijstjes</span>
                </li>
                <li className="flex items-start gap-3" data-testid="feature-analytics">
                  <CheckCircle2 className="mt-1 shrink-0"/>
                  <span>Vooruitgangs‑analytics met PR's en foto‑timeline</span>
                </li>
              </ul>
              
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-gold-500 text-black hover:bg-gold-400 w-full sm:w-auto"
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-start-trial"
                >
                  Start jouw proefperiode
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gold-500 text-gold-500 hover:bg-gold-500/10 w-full sm:w-auto"
                  data-testid="button-demo"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Bekijk demo
                </Button>
              </div>
              
              <p className="mt-3 text-sm text-gold-300" data-testid="trial-info">
                Geen creditcard nodig · Annuleer wanneer je wilt
              </p>
            </div>
            
            {/* App Mockup */}
            <div className="relative">
              <motion.div 
                initial={{opacity:0,scale:.95}} 
                animate={{opacity:1,scale:1}} 
                transition={{duration:.6, delay:.1}} 
                className="aspect-[9/19] w-full max-w-[20rem] sm:max-w-sm mx-auto rounded-[2rem] border border-gold-500 shadow-2xl overflow-hidden"
                data-testid="app-mockup"
              >
                <div className="h-10 bg-gold-500"></div>
                <div className="p-4 space-y-4 bg-black">
                  <div className="rounded-2xl p-4 bg-black border border-gold-500">
                    <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gold-500">
                      <Dumbbell className="h-4 w-4"/>
                      Push Dag
                    </div>
                    <div className="grid grid-cols-3 gap-x-2 text-xs text-gold-400">
                      <div>Bench</div><div>4×8</div><div>80 kg</div>
                      <div>Incline DB</div><div>3×10</div><div>30 kg</div>
                      <div>Fly</div><div>3×12</div><div>18 kg</div>
                    </div>
                  </div>
                  
                  <div className="rounded-2xl p-4 bg-black border border-gold-500">
                    <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gold-500">
                      <BarChart3 className="h-4 w-4"/>
                      Analytics
                    </div>
                    <div className="text-sm text-gold-300">+12% volume t.o.v. vorige week</div>
                    <div className="h-24 mt-2 rounded-xl bg-gradient-to-tr from-yellow-900 to-yellow-600"/>
                  </div>
                  
                  <div className="rounded-2xl p-4 bg-black border border-gold-500">
                    <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gold-500">
                      <Utensils className="h-4 w-4"/>
                      Maaltijd van de dag
                    </div>
                    <div className="text-sm text-gold-300">Kip burrito bowl · 620 kcal · 45P/70C/18F</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 border-t border-gold-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-gold-500" data-testid="features-title">
              Wat je krijgt
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard 
                icon={<Dumbbell/>} 
                title="Trainingsbibliotheek" 
                description="Meer dan 30 programma's voor elk niveau, met video‑uitleg per oefening."
                testId="feature-library"
              />
              <FeatureCard 
                icon={<Timer/>} 
                title="Slimme progressie" 
                description="Automatische gewichtsaanbevelingen op basis van je vorige sets (progressive overload)."
                testId="feature-progression"
              />
              <FeatureCard 
                icon={<BarChart3/>} 
                title="Diepe analytics" 
                description="Trends per spiergroep, weekvolume, PR's, consistentie en hersteltijden."
                testId="feature-analytics"
              />
              <FeatureCard 
                icon={<Utensils/>} 
                title="Voeding & recepten" 
                description="200+ maaltijden, aanpasbare macro's en kant‑en‑klare boodschappenlijstjes."
                testId="feature-nutrition"
              />
              <FeatureCard 
                icon={<Camera/>} 
                title="Fysiek‑updates" 
                description="Maak voortgangsfoto's en vergelijk ze in een nette timeline."
                testId="feature-photos"
              />
              <FeatureCard 
                icon={<Shield/>} 
                title="Privacy first" 
                description="Versleuteling in transit, exporteer en verwijder je data wanneer je wilt."
                testId="feature-privacy"
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 border-t border-gold-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-gold-500" data-testid="pricing-title">
              Eenvoudige prijzen
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <PricingPlan 
                name="Start" 
                price="€0" 
                period="/ 7 dagen" 
                features={[
                  "Toegang tot 3 voorbeeldprogramma's",
                  "Basistracking",
                  "Beperkte recepten"
                ]} 
                cta="Probeer gratis" 
                onCheckout={handleCheckout} 
                loading={loadingPlan === 'Start'}
                testId="plan-start"
              />
              <PricingPlan 
                featured 
                name="Pro" 
                price="€14,99" 
                period="/ maand" 
                features={[
                  "Alle programma's",
                  "Slimme gewichtsadviezen",
                  "Volledige recepten + boodschappen",
                  "Analytics & PR's",
                  "Foto‑timeline"
                ]} 
                cta="Word Pro via Mollie" 
                onCheckout={handleCheckout} 
                loading={loadingPlan === 'Pro'}
                testId="plan-pro"
              />
              <PricingPlan 
                name="Jaar" 
                price="€119" 
                period="/ jaar" 
                features={[
                  "Alles van Pro",
                  "2 maanden gratis",
                  "Exclusieve challenges"
                ]} 
                cta="Kies Jaarplan via Mollie" 
                onCheckout={handleCheckout} 
                loading={loadingPlan === 'Jaar'}
                testId="plan-year"
              />
            </div>
            <p className="mt-6 text-gold-300 text-sm text-center" data-testid="payment-info">
              Betalingen veilig verwerkt met Mollie Payments.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 border-t border-gold-500">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-gold-500 text-center mb-10" data-testid="faq-title">
              Veelgestelde vragen
            </h2>
            <div className="space-y-4">
              <FAQItem 
                question="Kan ik mijn abonnement op elk moment opzeggen?"
                answer="Ja, je kunt je abonnement op elk moment opzeggen. Er zijn geen opzegtermijnen of extra kosten. Je behoudt toegang tot alle functies tot het einde van je factuurperiode."
                testId="faq-cancel"
              />
              <FAQItem 
                question="Werkt de app offline?"
                answer="De app werkt grotendeels offline. Je trainingsschema's en voortgang worden lokaal opgeslagen. Voor nieuwe programma's en recepten heb je wel een internetverbinding nodig."
                testId="faq-offline"
              />
              <FAQItem 
                question="Is mijn data veilig?"
                answer="Absoluut. We gebruiken end-to-end encryptie en voldoen aan alle Nederlandse GDPR-richtlijnen. Je kunt je data op elk moment exporteren of verwijderen."
                testId="faq-privacy"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-gold-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6 items-center justify-between text-sm text-gold-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center">
              <Dumbbell className="text-black text-sm" />
            </div>
            <span data-testid="footer-copyright">
              © {new Date().getFullYear()} Marcodonato B.V
            </span>
          </div>
          <div className="flex gap-5">
            <a href="#" className="hover:opacity-80" data-testid="footer-privacy">
              Privacy
            </a>
            <a href="#" className="hover:opacity-80" data-testid="footer-terms">
              Voorwaarden
            </a>
            <a href="#" className="hover:opacity-80" data-testid="footer-contact">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  testId: string;
}

function FeatureCard({ icon, title, description, testId }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-2xl border border-gold-500 bg-black shadow-sm h-full flex flex-col" data-testid={testId}>
      <div className="flex items-center gap-3 text-gold-500">
        <div className="h-10 w-10 rounded-2xl border border-gold-500 grid place-items-center">
          {icon}
        </div>
        <h3 className="font-semibold" data-testid={`${testId}-title`}>{title}</h3>
      </div>
      <p className="mt-3 text-gold-300 text-sm flex-1" data-testid={`${testId}-description`}>
        {description}
      </p>
    </div>
  );
}

interface PricingPlanProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  featured?: boolean;
  onCheckout: (plan: string) => void;
  loading?: boolean;
  testId: string;
}

function PricingPlan({ 
  name, 
  price, 
  period, 
  features, 
  cta, 
  featured, 
  onCheckout, 
  loading,
  testId 
}: PricingPlanProps) {
  return (
    <div 
      className={`p-6 rounded-2xl border border-gold-500 ${
        featured ? "bg-gold-500 text-black" : "bg-black text-gold-500"
      } shadow-sm relative flex flex-col`}
      data-testid={testId}
    >
      {featured && (
        <span className="absolute -top-3 left-6 px-2 py-1 text-xs rounded-full bg-black text-gold-500 border border-gold-500">
          Meest gekozen
        </span>
      )}
      <h3 className="font-semibold" data-testid={`${testId}-name`}>{name}</h3>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-3xl font-bold" data-testid={`${testId}-price`}>{price}</div>
        <div className="text-sm" data-testid={`${testId}-period`}>{period}</div>
      </div>
      <ul className="mt-4 space-y-2 text-sm sm:text-base flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2" data-testid={`${testId}-feature-${i}`}>
            <CheckCircle2 className="mt-1 shrink-0"/>
            {feature}
          </li>
        ))}
      </ul>
      <Button
        onClick={() => onCheckout(name)}
        disabled={loading}
        className={`mt-6 w-full ${
          featured 
            ? "bg-black text-gold-500 border border-black hover:bg-gray-900" 
            : "bg-gold-500 text-black hover:bg-gold-400"
        }`}
        data-testid={`${testId}-button`}
      >
        {loading ? "Doorsturen…" : cta}
      </Button>
    </div>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
  testId: string;
}

function FAQItem({ question, answer, testId }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gold-500/50 rounded-2xl p-6 bg-black" data-testid={testId}>
      <button
        className="w-full text-left flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
        data-testid={`${testId}-question`}
      >
        <h3 className="text-lg font-semibold text-gold-400">{question}</h3>
        <CheckCircle2 
          className={`text-gold-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      {isOpen && (
        <p className="mt-4 text-gold-200" data-testid={`${testId}-answer`}>
          {answer}
        </p>
      )}
    </div>
  );
}
