'use client'

import { useState, useMemo } from 'react'
import {
  Building2, Search, MapPin, BedDouble, Bath, Maximize, Heart, Share2,
  ArrowRight, Star, TrendingUp, Hammer, CheckCircle2, Home, CalendarClock,
  Phone, Mail, ShieldCheck, Award, Users, ChevronRight, X, Calculator,
  Sparkles, Gem, KeyRound, Quote,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Property, LISTING_TYPE_LABEL, PROPERTY_TYPE_LABEL,
  formatCurrency, formatNumber,
} from '@/lib/types'
import { MortgageCalculator } from './mortgage-calculator'

async function fetchProperties(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`/api/properties?${qs}`)
  if (!res.ok) throw new Error('failed')
  const data = await res.json()
  return data.properties as Property[]
}

function priceLabel(p: Property) {
  if (p.listingType === 'RENTAL' && p.monthlyRent) {
    return { value: formatCurrency(p.monthlyRent), suffix: '/mo' }
  }
  return { value: formatCurrency(p.price), suffix: '' }
}

const statusStyle: Record<string, string> = {
  AVAILABLE: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
  SOLD: 'bg-rose-400/15 text-rose-300 border-rose-400/30',
  RENTED: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  OFF_MARKET: 'bg-zinc-400/15 text-zinc-300 border-zinc-400/30',
}

export function Storefront({ onEnterAdmin }: { onEnterAdmin: () => void }) {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [propertyType, setPropertyType] = useState<string>('ALL')
  const [beds, setBeds] = useState<string>('ANY')
  const [sort, setSort] = useState<string>('newest')
  const [selected, setSelected] = useState<Property | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [showMortgage, setShowMortgage] = useState(false)

  const params = useMemo(() => {
    const p: Record<string, string> = {}
    if (typeFilter !== 'ALL') p.listingType = typeFilter
    if (propertyType !== 'ALL') p.propertyType = propertyType
    if (beds !== 'ANY') p.beds = beds
    if (query.trim()) p.q = query.trim()
    if (sort !== 'newest') p.sort = sort
    return p
  }, [typeFilter, propertyType, beds, query, sort])

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['storefront-properties', params],
    queryFn: () => fetchProperties(params),
  })

  const forSale = properties.filter((p) => p.listingType === 'SALE' && p.status === 'AVAILABLE')
  const rentals = properties.filter((p) => p.listingType === 'RENTAL' && p.status === 'AVAILABLE')
  const projects = properties.filter((p) => p.listingType === 'PROJECT')
  const featured = properties.filter((p) => p.featured).slice(0, 3)

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="bg-background">
      {/* NAV */}
      <header className="fixed top-0 z-50 w-full border-b border-gold/10 glass-dark">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-8 px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg gold-gradient text-black">
              <Gem className="h-5 w-5" />
            </div>
            <div className="leading-none">
              <div className="font-serif text-xl font-bold tracking-wide-luxury text-foreground">ZARAJ</div>
              <div className="text-[9px] uppercase tracking-luxury text-gold">Properties</div>
            </div>
          </a>
          <nav className="hidden items-center gap-1 md:flex">
            {[
              { k: 'ALL', label: 'Home' },
              { k: 'SALE', label: 'Buy' },
              { k: 'RENTAL', label: 'Rent' },
              { k: 'PROJECT', label: 'Projects' },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => {
                  setTypeFilter(t.k)
                  document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="rounded-md px-3 py-2 text-sm font-medium tracking-wide-luxury text-muted-foreground transition hover:text-gold"
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Button variant="ghost" size="sm" className="hidden text-muted-foreground hover:text-gold lg:inline-flex" onClick={() => setShowMortgage(true)}>
              <Calculator className="mr-2 h-4 w-4" /> Mortgage
            </Button>
            <Button variant="ghost" size="sm" className="hidden text-muted-foreground hover:text-gold sm:inline-flex">
              <Phone className="mr-2 h-4 w-4" /> +1 (800) 555-0199
            </Button>
            <Button size="sm" variant="outline" onClick={onEnterAdmin} className="border-gold/40 text-gold hover:bg-gold/10 hover:text-gold">
              <KeyRound className="mr-1.5 h-4 w-4" /> Admin
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="relative flex min-h-screen items-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <img
            src="/properties/hero.png"
            alt="Luxury city skyline"
            className="h-full w-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-12 bg-gold" />
              <span className="text-xs font-medium uppercase tracking-luxury text-gold">Luxury Real Estate, Redefined</span>
            </div>
            <h1 className="font-serif text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Where <span className="text-gold-gradient italic">extraordinary</span> homes find their owners.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-300">
              Discover an exclusive collection of luxury properties for sale, premium rentals, and off-plan developments — curated for those who expect more.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="gold-gradient text-black hover:opacity-90" asChild>
                <a href="#listings">
                  Explore Listings <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 bg-white/5 text-white backdrop-blur hover:bg-white/10 hover:text-white" onClick={() => setShowMortgage(true)}>
                <Calculator className="mr-2 h-4 w-4" /> Mortgage Calculator
              </Button>
            </div>

            {/* SEARCH CARD */}
            <Card className="mt-10 w-full max-w-3xl border-gold/15 glass p-4 luxury-shadow">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />
                  <Input
                    placeholder="City, address, or keyword"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="border-gold/15 bg-black/30 pl-9 text-white placeholder:text-zinc-500"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="border-gold/15 bg-black/30 text-white"><SelectValue placeholder="Listing" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All listings</SelectItem>
                    <SelectItem value="SALE">For Sale</SelectItem>
                    <SelectItem value="RENTAL">For Rent</SelectItem>
                    <SelectItem value="PROJECT">Projects</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="border-gold/15 bg-black/30 text-white"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Any type</SelectItem>
                    {Object.entries(PROPERTY_TYPE_LABEL).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={beds} onValueChange={setBeds}>
                  <SelectTrigger className="border-gold/15 bg-black/30 text-white"><SelectValue placeholder="Beds" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANY">Any beds</SelectItem>
                    <SelectItem value="1">1+ beds</SelectItem>
                    <SelectItem value="2">2+ beds</SelectItem>
                    <SelectItem value="3">3+ beds</SelectItem>
                    <SelectItem value="4">4+ beds</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="gold-gradient text-black hover:opacity-90" onClick={() => document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' })}>
                  <Search className="mr-2 h-4 w-4" /> Search
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-y border-gold/10 bg-black/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-gold/10 px-4 sm:px-6 lg:grid-cols-4">
          {[
            { icon: Home, label: 'Active listings', value: '2,400+' },
            { icon: TrendingUp, label: 'Closed deals', value: '8,900+' },
            { icon: MapPin, label: 'Cities served', value: '42' },
            { icon: Award, label: 'Years trusted', value: '18' },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2 py-8 text-center">
              <s.icon className="h-6 w-6 text-gold" />
              <div className="font-serif text-3xl font-bold text-white">{s.value}</div>
              <div className="text-xs uppercase tracking-wide-luxury text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <LuxurySectionHeader
            eyebrow="Handpicked Collection"
            title="Featured residences"
            desc="Our curators' most coveted picks, chosen for design, location and craftsmanship."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {featured.map((p) => (
              <LuxuryPropertyCard key={p.id} property={p} onClick={() => setSelected(p)} featured favorited={favorites.has(p.id)} onFavorite={() => toggleFavorite(p.id)} />
            ))}
          </div>
        </section>
      )}

      {/* LISTINGS */}
      <section id="listings" className="scroll-mt-20 bg-black/30">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <LuxurySectionHeader
              eyebrow="The Collection"
              title={typeFilter === 'ALL' ? 'All residences' : LISTING_TYPE_LABEL[typeFilter as keyof typeof LISTING_TYPE_LABEL] || 'Residences'}
              desc={`${properties.length} ${properties.length === 1 ? 'property' : 'properties'} match your selection.`}
              noMargin
            />
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[200px] border-gold/15 bg-black/30 text-white"><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-96 animate-pulse rounded-xl bg-muted/40" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="mt-16 rounded-xl border border-dashed border-gold/20 p-20 text-center">
              <Home className="mx-auto mb-4 h-12 w-12 text-gold/40" />
              <h3 className="font-serif text-2xl text-white">No properties found</h3>
              <p className="mt-2 text-muted-foreground">Try adjusting your search filters.</p>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((p) => (
                <LuxuryPropertyCard key={p.id} property={p} onClick={() => setSelected(p)} favorited={favorites.has(p.id)} onFavorite={() => toggleFavorite(p.id)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* RENTALS SECTION */}
      {rentals.length > 0 && (
        <section className="border-y border-gold/10">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
            <LuxurySectionHeader
              eyebrow="For Lease"
              title="Premium rentals"
              desc="Move-in ready homes with flexible, white-glove lease terms."
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rentals.map((p) => (
                <LuxuryPropertyCard key={p.id} property={p} onClick={() => setSelected(p)} favorited={favorites.has(p.id)} onFavorite={() => toggleFavorite(p.id)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ONGOING PROJECTS */}
      {projects.length > 0 && (
        <section className="bg-black/30">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
            <LuxurySectionHeader
              eyebrow="Off-Plan Investments"
              title="Ongoing developments"
              desc="Invest early in pre-construction projects with exclusive launch pricing."
              icon={<Hammer className="h-4 w-4 text-gold" />}
            />
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {projects.map((p) => (
                <LuxuryProjectCard key={p.id} property={p} onClick={() => setSelected(p)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* WHY ZARAJ */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <LuxurySectionHeader eyebrow="The Zaraj Standard" title="A bespoke approach to property" desc="Transparent process, elite agents, and end-to-end white-glove service." />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, title: 'Verified listings', desc: 'Every property is vetted for legal clarity and accuracy.' },
            { icon: Users, title: 'Elite agents', desc: 'Local specialists with an average of 12+ years experience.' },
            { icon: TrendingUp, title: 'Market intelligence', desc: 'Real-time data on pricing, trends and ROI projections.' },
            { icon: Award, title: 'Award-winning service', desc: 'Rated #1 in client satisfaction three years running.' },
          ].map((f) => (
            <Card key={f.title} className="luxury-card p-7 transition hover:border-gold/30">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-gold/20 bg-gold/5 text-gold">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="border-y border-gold/10 bg-black/40">
        <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
          <Quote className="mx-auto mb-6 h-10 w-10 text-gold/50" />
          <p className="font-serif text-2xl font-medium leading-relaxed text-white sm:text-3xl">
            Zaraj found us a home that felt impossible to find. Their attention to detail and market knowledge is simply unmatched.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full gold-gradient text-base font-bold text-black">AK</div>
            <div className="text-left">
              <div className="font-semibold text-white">Amelia Kensington</div>
              <div className="text-sm text-muted-foreground">Penthouse owner, Manhattan</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#1a1612] via-[#241d15] to-[#1a1612] p-10 luxury-shadow sm:p-16">
          <div className="relative z-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <Sparkles className="mb-4 h-8 w-8 text-gold" />
              <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">Ready to find your next home?</h2>
              <p className="mt-3 max-w-xl text-zinc-300">
                Speak with a Zaraj property advisor today and receive a personalized shortlist within 24 hours.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="gold-gradient text-black hover:opacity-90"><Phone className="mr-2 h-4 w-4" /> Call an advisor</Button>
              <Button size="lg" variant="outline" className="border-gold/30 bg-transparent text-gold hover:bg-gold/10 hover:text-gold">
                <Mail className="mr-2 h-4 w-4" /> Email us
              </Button>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        </Card>
      </section>

      {/* DETAIL DIALOG */}
      <PropertyDetailDialog property={selected} onClose={() => setSelected(null)} onOpenMortgage={() => { setSelected(null); setShowMortgage(true) }} />

      {/* MORTGAGE CALCULATOR */}
      <MortgageCalculator open={showMortgage} onOpenChange={setShowMortgage} />
    </div>
  )
}

function LuxurySectionHeader({
  eyebrow, title, desc, icon, noMargin,
}: { eyebrow?: string; title: string; desc?: string; icon?: React.ReactNode; noMargin?: boolean }) {
  return (
    <div className={noMargin ? '' : 'mb-2'}>
      {eyebrow && (
        <div className="mb-3 flex items-center gap-3">
          {icon}
          <span className="text-xs font-semibold uppercase tracking-luxury text-gold">{eyebrow}</span>
          <span className="h-px flex-1 max-w-[60px] bg-gold/30" />
        </div>
      )}
      <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h2>
      {desc && <p className="mt-2 max-w-2xl text-muted-foreground">{desc}</p>}
    </div>
  )
}

function LuxuryPropertyCard({
  property, onClick, featured, favorited, onFavorite,
}: { property: Property; onClick: () => void; featured?: boolean; favorited?: boolean; onFavorite?: () => void }) {
  const price = priceLabel(property)
  return (
    <Card
      className="group luxury-card cursor-pointer overflow-hidden p-0 transition-all duration-500 hover:-translate-y-2 hover:border-gold/40 hover:luxury-shadow"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.imageUrl}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => { (e.target as HTMLImageElement).src = '/properties/apt1.png' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex gap-2">
          <Badge className="border border-gold/30 bg-black/60 text-gold backdrop-blur">
            {LISTING_TYPE_LABEL[property.listingType]}
          </Badge>
          {featured && (
            <Badge className="gold-gradient text-black">
              <Star className="mr-1 h-3 w-3 fill-current" /> Featured
            </Badge>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onFavorite?.() }}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
          aria-label="favorite"
        >
          <Heart className={`h-4 w-4 ${favorited ? 'fill-gold text-gold' : ''}`} />
        </button>
        <div className="absolute bottom-4 left-4">
          <div className="font-serif text-2xl font-bold text-white">
            {price.value}<span className="text-sm font-normal text-zinc-300">{price.suffix}</span>
          </div>
        </div>
        <div className={`absolute bottom-4 right-4 border ${statusStyle[property.status]} px-2.5 py-0.5 text-xs font-semibold backdrop-blur`}>
          {property.status}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide-luxury text-gold">
            {PROPERTY_TYPE_LABEL[property.propertyType]}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {property.city}, {property.state}
          </span>
        </div>
        <h3 className="mt-2 line-clamp-1 font-serif text-lg font-semibold text-white">{property.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{property.description}</p>
        <Separator className="my-4 bg-gold/10" />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          {property.bedrooms > 0 ? (
            <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4 text-gold/70" /> {property.bedrooms}</span>
          ) : (
            <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4 text-gold/70" /> Commercial</span>
          )}
          <span className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-gold/70" /> {property.bathrooms}</span>
          <span className="flex items-center gap-1.5"><Maximize className="h-4 w-4 text-gold/70" /> {formatNumber(property.area)} ft²</span>
        </div>
      </div>
    </Card>
  )
}

function LuxuryProjectCard({ property, onClick }: { property: Property; onClick: () => void }) {
  return (
    <Card
      className="group luxury-card grid cursor-pointer overflow-hidden p-0 transition-all duration-500 hover:border-gold/40 hover:luxury-shadow md:grid-cols-2"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto">
        <img
          src={property.imageUrl}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = '/properties/project1.png' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute left-4 top-4">
          <Badge className="gold-gradient text-black">
            <Hammer className="mr-1 h-3 w-3" /> Ongoing Project
          </Badge>
        </div>
        {property.expectedCompletion && (
          <div className="absolute bottom-4 left-4 rounded-md bg-black/60 px-3 py-1 text-xs font-medium text-gold backdrop-blur">
            <CalendarClock className="mr-1 inline h-3 w-3" /> Ready {property.expectedCompletion}
          </div>
        )}
      </div>
      <div className="flex flex-col p-7">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wide-luxury text-gold">
            {PROPERTY_TYPE_LABEL[property.propertyType]}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {property.city}, {property.state}
          </span>
        </div>
        <h3 className="mt-3 font-serif text-2xl font-bold text-white">{property.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{property.description}</p>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Construction progress</span>
            <span className="font-semibold text-gold">{property.projectProgress ?? 0}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="gold-gradient h-full rounded-full transition-all" style={{ width: `${property.projectProgress ?? 0}%` }} />
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-6">
          <div>
            <div className="text-xs uppercase tracking-wide-luxury text-muted-foreground">Starting from</div>
            <div className="font-serif text-xl font-bold text-white">{formatCurrency(property.price)}</div>
          </div>
          <Button variant="outline" size="sm" className="border-gold/30 text-gold hover:bg-gold/10 hover:text-gold">
            View details <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

function PropertyDetailDialog({
  property, onClose, onOpenMortgage,
}: { property: Property | null; onClose: () => void; onOpenMortgage: () => void }) {
  const price = property ? priceLabel(property) : null
  return (
    <Dialog open={!!property} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-gold/20 bg-card p-0 sm:max-w-3xl">
        {property && price && (
          <>
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-lg">
              <img src={property.imageUrl} alt={property.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute left-5 top-5 flex gap-2">
                <Badge className="border border-gold/30 bg-black/60 text-gold backdrop-blur">
                  {LISTING_TYPE_LABEL[property.listingType]}
                </Badge>
                <Badge className="border border-gold/30 bg-black/60 text-gold backdrop-blur">
                  {PROPERTY_TYPE_LABEL[property.propertyType]}
                </Badge>
              </div>
              <div className="absolute bottom-5 left-5">
                <div className="text-xs uppercase tracking-wide-luxury text-gold">Listed at</div>
                <div className="font-serif text-3xl font-bold text-white">
                  {price.value}<span className="text-base font-normal text-zinc-300">{price.suffix}</span>
                </div>
              </div>
            </div>
            <div className="p-7">
              <DialogHeader className="p-0 text-left">
                <DialogTitle className="font-serif text-2xl text-white">{property.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-gold" /> {property.address}, {property.city}, {property.state} {property.zipCode}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {property.bedrooms > 0 && (
                  <DetailStat icon={BedDouble} label="Bedrooms" value={String(property.bedrooms)} />
                )}
                <DetailStat icon={Bath} label="Bathrooms" value={String(property.bathrooms)} />
                <DetailStat icon={Maximize} label="Area" value={`${formatNumber(property.area)} ft²`} />
                {property.yearBuilt && (
                  <DetailStat icon={CalendarClock} label="Year built" value={String(property.yearBuilt)} />
                )}
              </div>

              {property.listingType === 'PROJECT' && (
                <div className="mt-6 rounded-xl border border-gold/20 bg-gold/5 p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-semibold text-gold">
                      <Hammer className="h-4 w-4" /> Construction status
                    </span>
                    <span className="font-serif text-lg font-bold text-gold">{property.projectProgress ?? 0}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="gold-gradient h-full rounded-full" style={{ width: `${property.projectProgress ?? 0}%` }} />
                  </div>
                  {property.expectedCompletion && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Expected completion: <span className="font-medium text-white">{property.expectedCompletion}</span>
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6">
                <h4 className="font-serif text-sm font-semibold uppercase tracking-wide-luxury text-gold">About this residence</h4>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{property.description}</p>
              </div>

              {property.features && (
                <div className="mt-6">
                  <h4 className="font-serif text-sm font-semibold uppercase tracking-wide-luxury text-gold">Features &amp; amenities</h4>
                  <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {property.features.split(',').map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-zinc-200">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-gold" /> {f.trim()}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {property.listingType === 'SALE' && (
                <button onClick={onOpenMortgage} className="mt-6 flex w-full items-center justify-between rounded-xl border border-gold/20 bg-gold/5 p-4 text-left transition hover:border-gold/40">
                  <div className="flex items-center gap-3">
                    <Calculator className="h-6 w-6 text-gold" />
                    <div>
                      <div className="font-semibold text-white">Estimate your mortgage</div>
                      <div className="text-xs text-muted-foreground">Calculate monthly payments for this property</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gold" />
                </button>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button className="flex-1 gold-gradient text-black hover:opacity-90">
                  <Phone className="mr-2 h-4 w-4" /> Schedule a private tour
                </Button>
                <Button variant="outline" className="flex-1 border-gold/30 text-gold hover:bg-gold/10 hover:text-gold">
                  <Mail className="mr-2 h-4 w-4" /> Request info
                </Button>
                <Button variant="ghost" className="text-muted-foreground hover:text-gold">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function DetailStat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gold/10 bg-black/30 p-3">
      <Icon className="mb-1.5 h-4 w-4 text-gold" />
      <div className="text-sm font-semibold text-white">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
