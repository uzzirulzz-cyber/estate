'use client'

import { useState } from 'react'
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import { Providers } from '@/components/providers'
import { Storefront } from '@/components/storefront/storefront'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export default function Home() {
  const [view, setView] = useState<'storefront' | 'admin'>('storefront')

  return (
    <Providers>
      {view === 'storefront' ? (
        <div className="flex min-h-screen flex-col">
          <Storefront onEnterAdmin={() => setView('admin')} />
          <Footer onEnterAdmin={() => setView('admin')} />
        </div>
      ) : (
        <AdminDashboard onExit={() => setView('storefront')} />
      )}
    </Providers>
  )
}

function Footer({ onEnterAdmin }: { onEnterAdmin: () => void }) {
  return (
    <footer className="mt-auto border-t border-border/60 bg-zinc-950 text-zinc-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-semibold text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="text-lg">Esterra<span className="text-emerald-400">.</span></span>
            </div>
            <p className="mt-3 text-sm text-zinc-400">
              Premium real estate platform for buying, renting and investing in properties across the country.
            </p>
            <div className="mt-4 flex gap-2">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-zinc-300 transition hover:bg-emerald-600 hover:text-white"
                  aria-label="social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#listings" className="text-zinc-400 transition hover:text-emerald-400">Properties for sale</a></li>
              <li><a href="#listings" className="text-zinc-400 transition hover:text-emerald-400">Rentals</a></li>
              <li><a href="#listings" className="text-zinc-400 transition hover:text-emerald-400">Ongoing projects</a></li>
              <li><a href="#top" className="text-zinc-400 transition hover:text-emerald-400">Featured listings</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white">Company</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#" className="text-zinc-400 transition hover:text-emerald-400">About us</a></li>
              <li><a href="#" className="text-zinc-400 transition hover:text-emerald-400">Our agents</a></li>
              <li><a href="#" className="text-zinc-400 transition hover:text-emerald-400">Careers</a></li>
              <li>
                <button onClick={onEnterAdmin} className="text-zinc-400 transition hover:text-emerald-400">
                  Admin console
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center gap-2 text-zinc-400"><Phone className="h-4 w-4 text-emerald-400" /> +1 (800) 555-0199</li>
              <li className="flex items-center gap-2 text-zinc-400"><Mail className="h-4 w-4 text-emerald-400" /> hello@esterra.io</li>
              <li className="flex items-start gap-2 text-zinc-400"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> 250 Market Street, Suite 400, San Francisco, CA</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-zinc-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Esterra Real Estate. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="transition hover:text-zinc-300">Privacy Policy</a>
            <a href="#" className="transition hover:text-zinc-300">Terms of Service</a>
            <a href="#" className="transition hover:text-zinc-300">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
