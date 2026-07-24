'use client'

import { useState } from 'react'
import { Gem, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Admin password — set per project requirements.
const ADMIN_PASSWORD = 'User112233'
const AUTH_KEY = 'propertyatlas-admin-auth'

export function isAdminAuthenticated() {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(AUTH_KEY) === 'granted'
}

export function loginAdmin(password: string) {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(AUTH_KEY, 'granted')
    return true
  }
  return false
}

export function logoutAdmin() {
  sessionStorage.removeItem(AUTH_KEY)
}

export function AdminLogin({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password) {
      setError('Please enter the admin password.')
      return
    }
    if (loginAdmin(password)) {
      setError('')
      onSuccess()
    } else {
      setError('Incorrect password. Access denied.')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,oklch(0.82_0.12_80/0.06),transparent_60%)]" />

      <div className="relative w-full max-w-md">
        <button onClick={onBack} className="mb-8 text-sm text-muted-foreground transition hover:text-gold">
          ← Back to storefront
        </button>

        <div className="luxury-card luxury-shadow rounded-2xl p-8 sm:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <img src="/propertyatlas-logo.png" alt="PropertyAtlas" className="mb-4 h-20 w-20 rounded-xl object-contain" />
            <div className="font-serif text-2xl font-bold tracking-wide-luxury text-white">PropertyAtlas</div>
            <div className="text-[10px] uppercase tracking-luxury text-gold">Lifestyle · Admin</div>
          </div>

          <div className="mb-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-gold" />
            <span>Restricted access — authorized personnel only</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="pwd" className="text-muted-foreground">Admin password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />
                <Input
                  id="pwd"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  placeholder="Enter password"
                  autoFocus
                  className="border-gold/15 bg-black/30 pl-9 pr-10 text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-gold"
                  aria-label="toggle password"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-300">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full gold-gradient text-black hover:opacity-90">
              Enter Admin Console <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Protected by PropertyAtlas Security · All actions are audited
          </div>
        </div>
      </div>
    </div>
  )
}
