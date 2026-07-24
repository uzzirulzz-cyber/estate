'use client'

import { useState, useEffect } from 'react'
import { Gem, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import { Providers } from '@/components/providers'
import { Storefront } from '@/components/storefront/storefront'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { AdminLogin, isAdminAuthenticated } from '@/components/admin/admin-login'

type View = 'storefront' | 'login' | 'admin'

export default function Home() {
  const [view, setView] = useState<View>('storefront')

  // When entering admin, check auth -> show login or dashboard directly
  function enterAdmin() {
    if (isAdminAuthenticated()) {
      setView('admin')
    } else {
      setView('login')
    }
  }

  return (
    <Providers>
      {view === 'storefront' && (
        <div className="flex min-h-screen flex-col">
          <Storefront onEnterAdmin={enterAdmin} />
          <Footer onEnterAdmin={enterAdmin} />
        </div>
      )}
      {view === 'login' && (
        <AdminLogin onSuccess={() => setView('admin')} onBack={() => setView('storefront')} />
      )}
      {view === 'admin' && (
        <AdminDashboard onExit={() => setView('storefront')} />
      )}
    </Providers>
  )
}

function Footer({ onEnterAdmin }: { onEnterAdmin: () => void }) {
  return (
    <footer className="mt-auto border-t border-gold/10 bg-black">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gold-gradient text-black">
                <Gem className="h-5 w-5" />
              </div>
              <div className="leading-none">
                <div className="font-serif text-lg font-bold tracking-wide-luxury text-white">ZARAJ</div>
                <div className="text-[9px] uppercase tracking-luxury text-gold">Properties</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              A premier luxury real estate platform for buying, renting and investing in exceptional properties.
            </p>
            <div className="mt-5 flex gap-2">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/15 bg-gold/5 text-zinc-400 transition hover:border-gold/40 hover:text-gold"
                  aria-label="social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wide-luxury text-gold">Explore</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#listings" className="text-zinc-400 transition hover:text-gold">Properties for sale</a></li>
              <li><a href="#listings" className="text-zinc-400 transition hover:text-gold">Rentals</a></li>
              <li><a href="#listings" className="text-zinc-400 transition hover:text-gold">Ongoing projects</a></li>
              <li><a href="#top" className="text-zinc-400 transition hover:text-gold">Featured listings</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wide-luxury text-gold">Company</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#" className="text-zinc-400 transition hover:text-gold">About us</a></li>
              <li><a href="#" className="text-zinc-400 transition hover:text-gold">Our agents</a></li>
              <li><a href="#" className="text-zinc-400 transition hover:text-gold">Careers</a></li>
              <li>
                <button onClick={onEnterAdmin} className="text-zinc-400 transition hover:text-gold">
                  Admin console
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wide-luxury text-gold">Contact</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5 text-zinc-400"><Phone className="h-4 w-4 text-gold" /> +1 (800) 555-0199</li>
              <li className="flex items-center gap-2.5 text-zinc-400"><Mail className="h-4 w-4 text-gold" /> hello@zaraj.io</li>
              <li className="flex items-start gap-2.5 text-zinc-400"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> 250 Market Street, Suite 400, San Francisco, CA</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-gold/10 pt-6 text-xs text-zinc-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Zaraj Properties. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="transition hover:text-gold">Privacy Policy</a>
            <a href="#" className="transition hover:text-gold">Terms of Service</a>
            <a href="#" className="transition hover:text-gold">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
