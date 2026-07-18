'use client'

import { useState, useMemo } from 'react'
import {
  Building2, Search, MapPin, BedDouble, Bath, Maximize, Heart, Share2,
  ArrowRight, Star, TrendingUp, Hammer, CheckCircle2, Home, CalendarClock,
  Phone, Mail, ShieldCheck, Award, Users, ChevronRight, X,
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
  formatCurrency, formatNumber, formatDate,
} from '@/lib/types'

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
  AVAILABLE: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  SOLD: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
  RENTED: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  OFF_MARKET: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-zinc-500/30',
}

export function Storefront({ onEnterAdmin }: { onEnterAdmin: () => void }) {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [propertyType, setPropertyType] = useState<string>('ALL')
  const [beds, setBeds] = useState<string>('ANY')
  const [sort, setSort] = useState<string>('newest')
  const [selected, setSelected] = useState<Property | null>(null)

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

  // Hero featured picks (top 3 featured)
  const featured = properties.filter((p) => p.featured).slice(0, 3)

  return (
    <div className="bg-background">
      {/* NAV */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2 font-semibold">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-lg tracking-tight">Esterra<span className="text-emerald-600">.</span></span>
          </a>
          <nav className="hidden items-center gap-1 md:flex">
            {[
              { k: 'ALL', label: 'All' },
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
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Phone className="mr-2 h-4 w-4" /> +1 (800) 555-0199
            </Button>
            <Button variant="outline" size="sm" onClick={onEnterAdmin}>
              <ShieldCheck className="mr-1.5 h-4 w-4" /> Admin
            </Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" asChild>
              <a href="#listings">
                Browse Listings <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0">
          <img
            src="/properties/hero.png"
            alt="Modern city skyline"
            className="h-full w-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/85 via-emerald-900/70 to-zinc-950/80" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <Badge className="mb-4 border-emerald-400/40 bg-emerald-400/10 text-emerald-100 backdrop-blur">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Trusted by 12,000+ homeowners
          </Badge>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find a place you&apos;ll love to call <span className="text-emerald-300">home.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-emerald-50/80 sm:text-lg">
            Discover premium properties for sale, rentals, and exclusive off-plan projects — all backed by transparent pricing and expert agents.
          </p>

          {/* SEARCH CARD */}
          <Card className="mt-8 w-full max-w-4xl border-border/60 bg-white/95 p-3 shadow-2xl backdrop-blur dark:bg-zinc-900/95 sm:p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="City, address, or keyword"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger><SelectValue placeholder="Listing" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All listings</SelectItem>
                  <SelectItem value="SALE">For Sale</SelectItem>
                  <SelectItem value="RENTAL">For Rent</SelectItem>
                  <SelectItem value="PROJECT">Projects</SelectItem>
                </SelectContent>
              </Select>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Any type</SelectItem>
                  {Object.entries(PROPERTY_TYPE_LABEL).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={beds} onValueChange={setBeds}>
                <SelectTrigger><SelectValue placeholder="Beds" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ANY">Any beds</SelectItem>
                  <SelectItem value="1">1+ beds</SelectItem>
                  <SelectItem value="2">2+ beds</SelectItem>
                  <SelectItem value="3">3+ beds</SelectItem>
                  <SelectItem value="4">4+ beds</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' })}>
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </div>
          </Card>

          {/* HERO STATS */}
          <div className="mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: Home, label: 'Active listings', value: '2,400+' },
              { icon: TrendingUp, label: 'Closed deals', value: '8,900+' },
              { icon: MapPin, label: 'Cities served', value: '42' },
              { icon: Award, label: 'Years trusted', value: '18' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <s.icon className="mb-2 h-5 w-5 text-emerald-300" />
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-emerald-50/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHeader
            eyebrow="Handpicked"
            title="Featured properties"
            desc="Our editors' top picks across the country this week."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {featured.map((p) => (
              <PropertyCard key={p.id} property={p} onClick={() => setSelected(p)} featured />
            ))}
          </div>
        </section>
      )}

      {/* LISTINGS */}
      <section id="listings" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            eyebrow="Browse"
            title={typeFilter === 'ALL' ? 'All listings' : LISTING_TYPE_LABEL[typeFilter as keyof typeof LISTING_TYPE_LABEL] || 'Listings'}
            desc={`${properties.length} properties match your filters.`}
            noMargin
          />
          <div className="flex items-center gap-2">
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border p-16 text-center">
            <Home className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No properties found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search filters.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} onClick={() => setSelected(p)} />
            ))}
          </div>
        )}
      </section>

      {/* RENTALS SECTION */}
      {rentals.length > 0 && (
        <section className="border-y border-border/60 bg-emerald-50/40 dark:bg-emerald-950/10">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <SectionHeader
              eyebrow="For Rent"
              title="Premium rentals"
              desc="Move-in ready homes with flexible lease terms."
              icon={<KeyIcon />}
            />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rentals.map((p) => (
                <PropertyCard key={p.id} property={p} onClick={() => setSelected(p)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ONGOING PROJECTS */}
      {projects.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHeader
            eyebrow="Off-Plan"
            title="Ongoing projects"
            desc="Invest early in pre-construction developments with exclusive pricing."
            icon={<Hammer className="h-4 w-4 text-emerald-600" />}
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {projects.map((p) => (
              <ProjectCard key={p.id} property={p} onClick={() => setSelected(p)} />
            ))}
          </div>
        </section>
      )}

      {/* WHY US */}
      <section className="border-t border-border/60 bg-zinc-50/60 dark:bg-zinc-950/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHeader eyebrow="Why Esterra" title="A smarter way to buy, rent & invest" desc="Transparent process, expert agents, and end-to-end support." />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, title: 'Verified listings', desc: 'Every property is vetted for accuracy and legal clarity.' },
              { icon: Users, title: 'Expert agents', desc: 'Local specialists with 10+ years average experience.' },
              { icon: TrendingUp, title: 'Market insights', desc: 'Real-time data on pricing, trends and ROI projections.' },
              { icon: Award, title: 'Award service', desc: 'Rated #1 customer satisfaction 3 years running.' },
            ].map((f) => (
              <Card key={f.title} className="p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700 dark:text-emerald-400">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-700 to-teal-800 p-8 text-white sm:p-12">
          <div className="relative z-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Ready to find your next property?</h2>
              <p className="mt-2 max-w-xl text-emerald-50/85">
                Talk to an Esterra advisor today and get a personalized shortlist within 24 hours.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" size="lg"><Phone className="mr-2 h-4 w-4" /> Call an agent</Button>
              <Button variant="outline" size="lg" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <Mail className="mr-2 h-4 w-4" /> Email us
              </Button>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        </Card>
      </section>

      {/* DETAIL DIALOG */}
      <PropertyDetailDialog property={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function KeyIcon() {
  return <CalendarClock className="h-4 w-4 text-emerald-600" />
}

function SectionHeader({
  eyebrow, title, desc, icon, noMargin,
}: { eyebrow?: string; title: string; desc?: string; icon?: React.ReactNode; noMargin?: boolean }) {
  return (
    <div className={noMargin ? '' : 'mb-2'}>
      {eyebrow && (
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">
          {icon}
          {eyebrow}
        </div>
      )}
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      {desc && <p className="mt-1 text-sm text-muted-foreground sm:text-base">{desc}</p>}
    </div>
  )
}

function PropertyCard({
  property, onClick, featured,
}: { property: Property; onClick: () => void; featured?: boolean }) {
  const price = priceLabel(property)
  return (
    <Card
      className="group cursor-pointer overflow-hidden p-0 transition-all hover:-translate-y-1 hover:shadow-xl"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.imageUrl}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = '/properties/apt1.png' }}
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge variant="secondary" className="bg-white/95 text-zinc-900 shadow-sm">
            {LISTING_TYPE_LABEL[property.listingType]}
          </Badge>
          {featured && (
            <Badge className="bg-amber-500 text-white shadow-sm">
              <Star className="mr-1 h-3 w-3 fill-current" /> Featured
            </Badge>
          )}
        </div>
        <div className={`absolute right-3 top-3 border ${statusStyle[property.status]} backdrop-blur`}>
          <Badge variant="outline" className="border-0 bg-transparent text-current">{property.status}</Badge>
        </div>
        <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2.5 py-1 text-sm font-semibold text-white backdrop-blur">
          {price.value}<span className="text-xs font-normal opacity-80">{price.suffix}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-emerald-600">
            {PROPERTY_TYPE_LABEL[property.propertyType]}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {property.city}, {property.state}
          </span>
        </div>
        <h3 className="mt-1 line-clamp-1 font-semibold leading-snug">{property.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{property.description}</p>
        <Separator className="my-3" />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          {property.bedrooms > 0 ? (
            <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4" /> {property.bedrooms} bd</span>
          ) : (
            <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" /> Commercial</span>
          )}
          <span className="flex items-center gap-1.5"><Bath className="h-4 w-4" /> {property.bathrooms} ba</span>
          <span className="flex items-center gap-1.5"><Maximize className="h-4 w-4" /> {formatNumber(property.area)} ft²</span>
        </div>
      </div>
    </Card>
  )
}

function ProjectCard({ property, onClick }: { property: Property; onClick: () => void }) {
  return (
    <Card
      className="group grid cursor-pointer overflow-hidden p-0 transition-all hover:shadow-xl md:grid-cols-2"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto">
        <img
          src={property.imageUrl}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = '/properties/project1.png' }}
        />
        <div className="absolute left-3 top-3">
          <Badge className="bg-emerald-600 text-white shadow-sm">
            <Hammer className="mr-1 h-3 w-3" /> Ongoing Project
          </Badge>
        </div>
        {property.expectedCompletion && (
          <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
            <CalendarClock className="mr-1 inline h-3 w-3" /> Ready {property.expectedCompletion}
          </div>
        )}
      </div>
      <div className="flex flex-col p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-emerald-600">
            {PROPERTY_TYPE_LABEL[property.propertyType]}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {property.city}, {property.state}
          </span>
        </div>
        <h3 className="mt-2 text-xl font-bold">{property.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{property.description}</p>

        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium">Construction progress</span>
            <span className="font-semibold text-emerald-600">{property.projectProgress ?? 0}%</span>
          </div>
          <Progress value={property.projectProgress ?? 0} className="h-2" />
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Starting from</div>
            <div className="text-lg font-bold">{formatCurrency(property.price)}</div>
          </div>
          <Button variant="outline" size="sm">
            View details <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

function PropertyDetailDialog({ property, onClose }: { property: Property | null; onClose: () => void }) {
  const price = property ? priceLabel(property) : null
  return (
    <Dialog open={!!property} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-3xl">
        {property && price && (
          <>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-lg">
              <img src={property.imageUrl} alt={property.title} className="h-full w-full object-cover" />
              <button
                onClick={onClose}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute left-4 top-4 flex gap-2">
                <Badge variant="secondary" className="bg-white/95 text-zinc-900">
                  {LISTING_TYPE_LABEL[property.listingType]}
                </Badge>
                <Badge variant="secondary" className="bg-white/95 text-zinc-900">
                  {PROPERTY_TYPE_LABEL[property.propertyType]}
                </Badge>
              </div>
              <div className="absolute bottom-4 left-4 rounded-lg bg-emerald-600 px-3 py-1.5 text-lg font-bold text-white shadow-lg">
                {price.value}<span className="text-sm font-normal opacity-90">{price.suffix}</span>
              </div>
            </div>
            <div className="p-6">
              <DialogHeader className="p-0 text-left">
                <DialogTitle className="text-2xl">{property.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-1 text-sm">
                  <MapPin className="h-4 w-4" /> {property.address}, {property.city}, {property.state} {property.zipCode}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {property.bedrooms > 0 && (
                  <Stat icon={BedDouble} label="Bedrooms" value={String(property.bedrooms)} />
                )}
                <Stat icon={Bath} label="Bathrooms" value={String(property.bathrooms)} />
                <Stat icon={Maximize} label="Area" value={`${formatNumber(property.area)} ft²`} />
                {property.yearBuilt && (
                  <Stat icon={CalendarClock} label="Year built" value={String(property.yearBuilt)} />
                )}
              </div>

              {property.listingType === 'PROJECT' && (
                <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-50/60 p-4 dark:bg-emerald-950/20">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      <Hammer className="h-4 w-4" /> Construction status
                    </span>
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{property.projectProgress ?? 0}%</span>
                  </div>
                  <Progress value={property.projectProgress ?? 0} className="h-2" />
                  {property.expectedCompletion && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Expected completion: <span className="font-medium text-foreground">{property.expectedCompletion}</span>
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6">
                <h4 className="text-sm font-semibold">About this property</h4>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{property.description}</p>
              </div>

              {property.features && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold">Features & amenities</h4>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {property.features.split(',').map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> {f.trim()}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  <Phone className="mr-2 h-4 w-4" /> Schedule a tour
                </Button>
                <Button variant="outline" className="flex-1">
                  <Heart className="mr-2 h-4 w-4" /> Save to favorites
                </Button>
                <Button variant="ghost">
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

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
      <Icon className="mb-1.5 h-4 w-4 text-emerald-600" />
      <div className="text-sm font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
