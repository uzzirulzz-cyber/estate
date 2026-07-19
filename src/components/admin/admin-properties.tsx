'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Search, Pencil, Trash2, MapPin, Building2, MoreHorizontal, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import {
  Property, ListingType, PropertyKind, PropertyStatus,
  LISTING_TYPE_LABEL, PROPERTY_TYPE_LABEL, formatCurrency,
} from '@/lib/types'

const statusStyle: Record<string, string> = {
  AVAILABLE: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  SOLD: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
  RENTED: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  OFF_MARKET: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-zinc-500/30',
}

const emptyForm = {
  title: '', description: '', listingType: 'SALE' as ListingType,
  propertyType: 'APARTMENT' as PropertyKind, status: 'AVAILABLE' as PropertyStatus,
  price: '', monthlyRent: '', projectProgress: '', expectedCompletion: '',
  address: '', city: '', state: '', zipCode: '',
  bedrooms: '3', bathrooms: '2', area: '1500', yearBuilt: '',
  imageUrl: '/properties/apt1.png', features: '', featured: false,
}

export function AdminProperties() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Property | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null)

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['admin-properties'],
    queryFn: async () => {
      const res = await fetch('/api/properties')
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      return data.properties
    },
  })

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (typeFilter !== 'ALL' && p.listingType !== typeFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return p.title.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
      }
      return true
    })
  }, [properties, search, typeFilter])

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const payload = { ...data, price: data.price || '0', monthlyRent: data.monthlyRent || null, projectProgress: data.projectProgress || null, yearBuilt: data.yearBuilt || null }
      if (editing) {
        const res = await fetch(`/api/properties/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (!res.ok) throw new Error('failed')
        return res.json()
      } else {
        const res = await fetch('/api/properties', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (!res.ok) throw new Error('failed')
        return res.json()
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-properties'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      qc.invalidateQueries({ queryKey: ['storefront-properties'] })
      toast({ title: editing ? 'Property updated' : 'Property created', description: 'Changes saved successfully.' })
      setFormOpen(false)
      setEditing(null)
      setForm(emptyForm)
    },
    onError: () => toast({ title: 'Error', description: 'Failed to save property.', variant: 'destructive' }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('failed')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-properties'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      qc.invalidateQueries({ queryKey: ['storefront-properties'] })
      toast({ title: 'Property deleted' })
      setDeleteTarget(null)
    },
    onError: () => toast({ title: 'Error', description: 'Failed to delete property.', variant: 'destructive' }),
  })

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  function openEdit(p: Property) {
    setEditing(p)
    setForm({
      title: p.title, description: p.description, listingType: p.listingType,
      propertyType: p.propertyType, status: p.status,
      price: String(p.price), monthlyRent: p.monthlyRent ? String(p.monthlyRent) : '',
      projectProgress: p.projectProgress != null ? String(p.projectProgress) : '',
      expectedCompletion: p.expectedCompletion || '',
      address: p.address, city: p.city, state: p.state, zipCode: p.zipCode,
      bedrooms: String(p.bedrooms), bathrooms: String(p.bathrooms),
      area: String(p.area), yearBuilt: p.yearBuilt ? String(p.yearBuilt) : '',
      imageUrl: p.imageUrl, features: p.features || '', featured: p.featured,
    })
    setFormOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <div className="relative sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search properties…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="sm:w-[160px]"><SelectValue placeholder="Filter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All listings</SelectItem>
              <SelectItem value="SALE">For Sale</SelectItem>
              <SelectItem value="RENTAL">Rentals</SelectItem>
              <SelectItem value="PROJECT">Projects</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-1 h-4 w-4" /> Add property
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[260px]">Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}><Skeleton className="h-12 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    No properties found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl} alt="" className="h-12 w-16 rounded-md object-cover" />
                        <div className="min-w-0">
                          <div className="truncate font-medium">{p.title}</div>
                          <div className="text-xs text-muted-foreground">{p.bedrooms} bd · {p.bathrooms} ba · {p.area.toLocaleString()} ft²</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{LISTING_TYPE_LABEL[p.listingType]}</Badge>
                      <div className="mt-0.5 text-xs text-muted-foreground">{PROPERTY_TYPE_LABEL[p.propertyType]}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyle[p.status]}>{p.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {p.listingType === 'RENTAL' && p.monthlyRent
                        ? `${formatCurrency(p.monthlyRent)}/mo`
                        : formatCurrency(p.price)}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" /> {p.city}, {p.state}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(p)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600" onClick={() => setDeleteTarget(p)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* FORM DIALOG */}
      <Dialog open={formOpen} onOpenChange={(o) => { if (!o) { setFormOpen(false); setEditing(null) } }}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit property' : 'Add new property'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update the details for this listing.' : 'Create a new property listing.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Skyline Glass Villa" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label>Listing type</Label>
                <Select value={form.listingType} onValueChange={(v) => setForm({ ...form, listingType: v as ListingType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(LISTING_TYPE_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Property type</Label>
                <Select value={form.propertyType} onValueChange={(v) => setForm({ ...form, propertyType: v as PropertyKind })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROPERTY_TYPE_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as PropertyStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="SOLD">Sold</SelectItem>
                    <SelectItem value="RENTED">Rented</SelectItem>
                    <SelectItem value="OFF_MARKET">Off Market</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="price">{form.listingType === 'RENTAL' ? 'Sale price' : 'Price ($)'}</Label>
                <Input id="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              {form.listingType === 'RENTAL' && (
                <div className="grid gap-2">
                  <Label htmlFor="rent">Monthly rent ($)</Label>
                  <Input id="rent" type="number" value={form.monthlyRent} onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })} />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="area">Area (ft²)</Label>
                <Input id="area" type="number" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="beds">Bedrooms</Label>
                <Input id="beds" type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="baths">Bathrooms</Label>
                <Input id="baths" type="number" step="0.5" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="year">Year built</Label>
                <Input id="year" type="number" value={form.yearBuilt} onChange={(e) => setForm({ ...form, yearBuilt: e.target.value })} />
              </div>
            </div>

            {form.listingType === 'PROJECT' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="progress">Progress (%)</Label>
                  <Input id="progress" type="number" value={form.projectProgress} onChange={(e) => setForm({ ...form, projectProgress: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="completion">Expected completion</Label>
                  <Input id="completion" value={form.expectedCompletion} onChange={(e) => setForm({ ...form, expectedCompletion: e.target.value })} placeholder="e.g. Q3 2026" />
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_80px]">
              <div className="grid gap-2">
                <Label htmlFor="addr">Address</Label>
                <Input id="addr" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="img">Image URL</Label>
              <Input id="img" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="features">Features (comma-separated)</Label>
              <Input id="features" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Pool, Garage, Smart Home" />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="featured" checked={form.featured} onCheckedChange={(c) => setForm({ ...form, featured: c })} />
              <Label htmlFor="featured">Feature on storefront homepage</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setFormOpen(false); setEditing(null) }}>Cancel</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={!form.title || saveMutation.isPending}
              onClick={() => saveMutation.mutate(form)}
            >
              {saveMutation.isPending ? 'Saving…' : editing ? 'Save changes' : 'Create property'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete property?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteTarget?.title}&quot; and all related transactions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
