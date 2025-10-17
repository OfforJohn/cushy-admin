"use client"

import React, { useMemo, useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  Bell,
  Download,
  Hourglass,
  XCircle,
  Calendar,
  Filter,
  FileText,
  Eye,
  Check,
  X,
  User2,
  Star,
  ArrowUpDown,
  Plus,
} from "lucide-react"

/**
 * Health Professionals - redesigned to match provided screenshot
 * - Metric cards at top
 * - Filters row with dropdowns, Export and Add Professional button
 * - Professionals table with avatar, specialty pill, license, location, fee, status, rating, availability
 * - Responsive and pixel-conscious spacing
 */

const professionalsMock = [
  {
    id: "PRO-2024-001",
    name: "Dr. Sarah Johnson",
    avatarInitials: "SJ",
    specialty: "General Medicine",
    license: "MDCN-12345",
    location: "Lagos, Nigeria",
    fee: "₦5,000",
    status: "Verified",
    rating: 4.9,
    reviews: 127,
    availability: "Available",
  },
  {
    id: "PRO-2024-002",
    name: "Dr. Michael Chen",
    avatarInitials: "MC",
    specialty: "Cardiology",
    license: "MDCN-54321",
    location: "Abuja, Nigeria",
    fee: "₦8,000",
    status: "Pending",
    rating: 4.6,
    reviews: 86,
    availability: "Unavailable",
  },
  {
    id: "PRO-2024-003",
    name: "Nurse Kate Obi",
    avatarInitials: "KO",
    specialty: "Nursing",
    license: "NMCN-11234",
    location: "Lagos, Nigeria",
    fee: "₦2,500",
    status: "Verified",
    rating: 4.7,
    reviews: 54,
    availability: "Available",
  },
]

const metrics = [
  {
    title: "Total Professionals",
    value: 247,
    subtext: "↑ 12 new this week",
    icon: <User2 className="w-5 h-5" />,
    bg: "bg-sky-50",
    iconColor: "text-sky-600",
    valueColor: "text-gray-900",
  },
  {
    title: "Verification Pending",
    value: 23,
    subtext: "Avg 2.3 days",
    icon: <Hourglass className="w-5 h-5" />,
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    valueColor: "text-amber-700",
  },
  {
    title: "Active Today",
    value: 156,
    subtext: "↑ 89% availability",
    icon: <CheckCircle2 className="w-5 h-5" />,
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    valueColor: "text-emerald-700",
  },
  {
    title: "Avg Rating",
    value: 4.8,
    subtext: "Based on 1,247 reviews",
    icon: <Star className="w-5 h-5" />,
    bg: "bg-purple-50",
    iconColor: "text-purple-600",
    valueColor: "text-gray-900",
  },
]

const Avatar = ({ initials }: { initials: string }) => (
  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-tr from-indigo-500 to-pink-500 text-white text-sm font-semibold">
    {initials}
  </div>
)

export default function HealthProfessionalsPage() {
  const [city, setCity] = useState("All Cities")
  const [specialty, setSpecialty] = useState("All Specialties")
  const [status, setStatus] = useState("All Status")
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return professionalsMock.filter((p) => {
      if (city !== "All Cities" && !p.location.includes(city)) return false
      if (specialty !== "All Specialties" && p.specialty !== specialty) return false
      if (status !== "All Status") {
        if (status === "Verified" && p.status !== "Verified") return false
        if (status === "Pending" && p.status !== "Pending") return false
      }
      if (q) {
        return (
          p.name.toLowerCase().includes(q) ||
          p.license.toLowerCase().includes(q) ||
          p.specialty.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [city, specialty, status, search])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Health Professionals</h1>
          <Select value={city} onValueChange={(v) => setCity(v)}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Cities">All Cities</SelectItem>
              <SelectItem value="Lagos">Lagos</SelectItem>
              <SelectItem value="Abuja">Abuja</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Input
              className="w-[380px] h-9 pr-10"
              placeholder="Search professionals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-sm">SA</div>
            <div className="text-sm text-gray-600">Sarah Admin</div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.title} className="shadow-sm border">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="text-sm text-gray-600">{m.title}</div>
                <div className={cn("text-2xl font-bold mt-1", m.valueColor)}>{m.value}</div>
                <div className="text-xs text-gray-500 mt-1">{m.subtext}</div>
              </div>

              <div className={cn("w-9 h-9 flex items-center justify-center rounded-full", m.bg, m.iconColor)}>
                {m.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters + actions */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={specialty} onValueChange={(v) => setSpecialty(v)}>
            <SelectTrigger className="w-[200px] h-9">
              <SelectValue placeholder="All Specialties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Specialties">All Specialties</SelectItem>
              <SelectItem value="General Medicine">General Medicine</SelectItem>
              <SelectItem value="Cardiology">Cardiology</SelectItem>
              <SelectItem value="Nursing">Nursing</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={(v) => setStatus(v)}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Status">All Status</SelectItem>
              <SelectItem value="Verified">Verified</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="flex items-center gap-2 h-9">
            <Filter className="w-4 h-4" /> More Filters
          </Button>

          <Button variant="outline" className="flex items-center gap-2 h-9">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Button className="bg-purple-700 hover:bg-purple-800 text-white flex items-center gap-2 h-9">
            <Plus className="w-4 h-4" /> Add Professional
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Health Professionals</CardTitle>
            <div className="text-sm text-gray-500">{professionalsMock.length} professionals</div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4" /> Sort
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Professional</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} className="align-top">
                  <TableCell className="flex items-center gap-3">
                    <Avatar initials={p.avatarInitials} />
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-gray-500">ID: {p.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-sky-50 text-sky-700">{p.specialty}</span>
                  </TableCell>
                  <TableCell className="text-sm">{p.license}</TableCell>
                  <TableCell className="text-sm">{p.location}</TableCell>
                  <TableCell className="text-sm font-medium">{p.fee}</TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "capitalize",
                      p.status === "Verified" && "bg-emerald-50 text-emerald-700",
                      p.status === "Pending" && "bg-amber-50 text-amber-700"
                    )}>{p.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <div className="text-sm font-medium">{p.rating}</div>
                      <div className="text-xs text-gray-500">({p.reviews})</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={cn("inline-flex items-center px-2 py-0.5 text-xs rounded", p.availability === "Available" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600")}>{p.availability}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" className="p-1"><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" className="p-1" title="Approve"><Check className="w-4 h-4 text-emerald-600" /></Button>
                      <Button variant="ghost" className="p-1" title="Remove"><X className="w-4 h-4 text-rose-600" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                    No professionals found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
