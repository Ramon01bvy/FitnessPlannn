import React from "react";
import { motion } from "framer-motion";
import { Dumbbell, BarChart3, Utensils, CheckCircle2, Shield, Timer, Camera } from "lucide-react";

export default function MarcodonatoLanding() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);

  const handleCheckout = async (plan: string) => {
    try {
      setLoadingPlan(plan);
      const res = await fetch("/api/create-mollie-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert("Kon geen betaal-URL ophalen. Probeer het opnieuw.");
      }
    } catch (err) {
      console.error("Mollie payment error", err);
      alert("Er ging iets mis met de betaling. Probeer het later opnieuw.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const smooth: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
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
      {/* NAV */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/70 bg-black/70 border-b border-gold-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Marcodonato" className="h-10 w-auto" loading="eager"/>
            <span className="font-semibold tracking-tight text-gold-500 hidden sm:inline">Marcodonato B.V</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" onClick={smooth} className="hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-gold-500 rounded-md px-1">Functies</a>
            <a href="#pricing" onClick={smooth} className="hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-gold-500 rounded-md px-1">Prijzen</a>
            <a href="#faq" onClick={smooth} className="hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-gold-500 rounded-md px-1">FAQ</a>
          </nav>
          <div className="hidden sm:flex items-center gap-3">
            <a href="#download" onClick={smooth} className="px-4 py-2 rounded-2xl border border-gold-500">Inloggen</a>
            <a href="#download" onClick={smooth} className="px-4 py-2 rounded-2xl bg-gold-500 text-black shadow">Probeer gratis</a>
          </div>
          <button aria-label="Open menu" className="md:hidden p-2 rounded-lg border border-gold-500" onClick={() => setMenuOpen(v=>!v)}>
            ☰
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-gold-500 bg-black/90">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3">
              <a onClick={smooth} href="#features" className="py-2">Functies</a>
              <a onClick={smooth} href="#pricing" className="py-2">Prijzen</a>
              <a onClick={smooth} href="#faq" className="py-2">FAQ</a>
              <div className="flex gap-3 pt-2">
                <a href="#download" onClick={smooth} className="flex-1 px-4 py-2 rounded-2xl border border-gold-500 text-center">Inloggen</a>
                <a href="#download" onClick={smooth} className="flex-1 px-4 py-2 rounded-2xl bg-gold-500 text-black text-center">Probeer gratis</a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* MAIN */}
      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div>
              <motion.h1 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:.6}} className="text-[2rem] sm:text-5xl font-bold leading-tight tracking-tight text-gold-500">
                Elite Exclusive Personal Training App
              </motion.h1>
              <p className="mt-4 text-base sm:text-lg text-gold-300">
                Persoonlijke trainingsschema’s, progressie‑tracking, slimme gewichtsadviezen en een complete voedingsbibliotheek — in Marcodonato stijl.
              </p>
              <ul className="mt-6 space-y-3 text-gold-400 text-sm sm:text-base">
                <li className="flex items-start gap-3"><CheckCircle2 className="mt-1 shrink-0"/><span>30+ programmasjablonen (PPL, upper/lower, kracht, cut/bulk)</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="mt-1 shrink-0"/><span>Track sets, reps, tempo, RPE en rusttijden</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="mt-1 shrink-0"/><span>Voedingsrecepten met macro’s en boodschappenlijstjes</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="mt-1 shrink-0"/><span>Vooruitgangs‑analytics met PR’s en foto‑timeline</span></li>
              </ul>
              <div id="download" className="mt-8 flex flex-wrap gap-3">
                <a className="px-5 py-3 rounded-2xl bg-gold-500 text-black shadow w-full sm:w-auto text-center">Start jouw proefperiode</a>
                <a className="px-5 py-3 rounded-2xl border border-gold-500 w-full sm:w-auto text-center">Bekijk demo</a>
              </div>
              <p className="mt-3 text-sm text-gold-300">Geen creditcard nodig · Annuleer wanneer je wilt</p>
            </div>
            <div className="relative">
              <motion.div initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} transition={{duration:.6, delay:.1}} className="aspect-[9/19] w-full max-w-[20rem] sm:max-w-sm mx-auto rounded-[2rem] border border-gold-500 shadow-2xl overflow-hidden">
                <div className="h-10 bg-gold-500"></div>
                <div className="p-4 space-y-4 bg-black">
                  <div className="rounded-2xl p-4 bg-black border border-gold-500">
                    <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gold-500"><Dumbbell/> Push Dag</div>
                    <div className="grid grid-cols-3 gap-x-2 text-xs text-gold-400">
                      <div>Bench</div><div>4×8</div><div>80 kg</div>
                      <div>Incline DB</div><div>3×10</div><div>30 kg</div>
                      <div>Fly</div><div>3×12</div><div>18 kg</div>
                    </div>
                  </div>
                  <div className="rounded-2xl p-4 bg-black border border-gold-500">
                    <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gold-500"><BarChart3/> Analytics</div>
                    <div className="text-sm text-gold-300">+12% volume t.o.v. vorige week</div>
                    <div className="h-24 mt-2 rounded-xl bg-gradient-to-tr from-yellow-900 to-yellow-600"/>
                  </div>
                  <div className="rounded-2xl p-4 bg-black border border-gold-500">
                    <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gold-500"><Utensils/> Maaltijd van de dag</div>
                    <div className="text-sm text-gold-300">Kip burrito bowl · 620 kcal · 45P/70C/18F</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-16 border-t border-gold-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-gold-500">Wat je krijgt</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Feature icon={<Dumbbell/>} title="Trainingsbibliotheek" desc="Meer dan 30 programma’s voor elk niveau, met video‑uitleg per oefening."/>
              <Feature icon={<Timer/>} title="Slimme progressie" desc="Automatische gewichtsaanbevelingen op basis van je vorige sets (progressive overload)."/>
              <Feature icon={<BarChart3/>} title="Diepe analytics" desc="Trends per spiergroep, weekvolume, PR’s, consistentie en hersteltijden."/>
              <Feature icon={<Utensils/>} title="Voeding & recepten" desc="200+ maaltijden, aanpasbare macro’s en kant‑en‑klare boodschappenlijstjes."/>
              <Feature icon={<Camera/>} title="Fysiek‑updates" desc="Maak voortgangsfoto’s en vergelijk ze in een nette timeline."/>
              <Feature icon={<Shield/>} title="Privacy first" desc="Versleuteling in transit, exporteer en verwijder je data wanneer je wilt."/>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="py-16 border-t border-gold-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-gold-500">Eenvoudige prijzen</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Plan name="Start" price="€0" period="/ 7 dagen" bullets={["Toegang tot 3 voorbeeldprogramma’s","Basistracking","Beperkte recepten"]} cta="Probeer gratis" onCheckout={handleCheckout} loading={loadingPlan === 'Start'}/>
              <Plan featured name="Pro" price="€14,99" period="/ maand" bullets={["Alle programma’s","Slimme gewichtsadviezen","Volledige recepten + boodschappen","Analytics & PR’s","Foto‑timeline"]} cta="Word Pro via Mollie" onCheckout={handleCheckout} loading={loadingPlan === 'Pro'}/>
              <Plan name="Jaar" price="€119" period="/ jaar" bullets={["Alles van Pro","2 maanden gratis","Exclusieve challenges"]} cta="Kies Jaarplan via Mollie" onCheckout={handleCheckout} loading={loadingPlan === 'Jaar'}/>
            </div>
            <p className="mt-6 text-gold-300 text-sm">Betalingen veilig verwerkt met Mollie Payments.</p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-10 border-t border-gold-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6 items-center justify-between text-sm text-gold-300">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Marcodonato" className="h-8 w-auto" loading="lazy"/>
            <span>© {new Date().getFullYear()} Marcodonato B.V</span>
          </div>
          <div className="flex gap-5">
            <a href="#" className="hover:opacity-80">Privacy</a>
            <a href="#" className="hover:opacity-80">Voorwaarden</a>
            <a href="#" className="hover:opacity-80">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-6 rounded-2xl border border-gold-500 bg-black shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-3 text-gold-500">
        <div className="h-10 w-10 rounded-2xl border border-gold-500 grid place-items-center">{icon}</div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="mt-3 text-gold-300 text-sm flex-1">{desc}</p>
    </div>
  );
}

function Plan({ name, price, period, bullets, cta, featured, onCheckout, loading }: { name: string; price: string; period: string; bullets: string[]; cta: string; featured?: boolean; onCheckout: (plan: string) => void; loading?: boolean }) {
  return (
    <div className={`p-6 rounded-2xl border border-gold-500 ${featured ? "bg-gold-500 text-black" : "bg-black text-gold-500"} shadow-sm relative flex flex-col`}>
      {featured && <span className="absolute -top-3 left-6 px-2 py-1 text-xs rounded-full bg-black text-gold-500 border border-gold-500">Meest gekozen</span>}
      <h3 className={`font-semibold`}>{name}</h3>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-3xl font-bold">{price}</div>
        <div className={`text-sm`}>{period}</div>
      </div>
      <ul className={`mt-4 space-y-2 text-sm sm:text-base flex-1`}>
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2"><CheckCircle2 className="mt-1"/>{b}</li>
        ))}
      </ul>
      <button
        onClick={() => onCheckout(name)}
        disabled={loading}
        className={`mt-6 w-full px-4 py-3 rounded-2xl ${featured ? "bg-black text-gold-500 border border-black" : "bg-gold-500 text-black"} disabled:opacity-60 disabled:cursor-not-allowed`}
        aria-busy={loading}
      >
        {loading ? "Doorsturen…" : cta}
      </button>
    </div>
  );
}
