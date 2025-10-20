"use client"

import { useMemo, useState } from "react"
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
  AlertTriangle,
  ArrowUpDown,
} from "lucide-react"

// --- Mock data (match screenshot's counts/text) ---
const initialVerifications = [
  {
    id: 1,
    professional: "Dr. Ahmed Hassan",
    avatarInitials: "AH",
    licenseType: "Medical Practitioner",
    licenseNumber: "MDCN-45678",
    submittedDate: "Jan 15, 2024",
    status: "Pending Review",
    priority: "Urgent",
    documents: 3,
    overdueText: "5 days overdue",
  },
  {
    id: 2,
    professional: "Nurse Kate Obi",
    avatarInitials: "KO",
    licenseType: "Registered Nurse",
    licenseNumber: "NMCN-11234",
    submittedDate: "Oct 11, 2025",
    status: "Verified",
    priority: "Normal",
    documents: 2,
  },
  {
    id: 3,
    professional: "Pharm. Peter Udo",
    avatarInitials: "PU",
    licenseType: "Pharmacist",
    licenseNumber: "PCN-98576",
    submittedDate: "Oct 10, 2025",
    status: "Rejected",
    priority: "Low",
    documents: 1,
  },
  {
    id: 4,
    professional: "Dr. Mary Okafor",
    avatarInitials: "MO",
    licenseType: "Medical Practitioner",
    licenseNumber: "MDCN-23490",
    submittedDate: "Oct 9, 2025",
    status: "Pending Review",
    priority: "Normal",
    documents: 4,
  },
]

// metric cards (numbers match screenshot / example)
const metricCards = [
  {
    title: "Pending Verification",
    value: 23,
    subtext: "Avg 2.3 days",
    colorClass: "text-amber-700",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100",
    icon: <Hourglass className="w-5 h-5" />,
  },
  {
    title: "Verified Today",
    value: 8,
    subtext: "12 approved this week",
    colorClass: "text-emerald-700",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-100",
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
  {
    title: "Rejected This Week",
    value: 3,
    subtext: "Most: Invalid docs",
    colorClass: "text-rose-700",
    iconColor: "text-rose-600",
    iconBg: "bg-rose-100",
    icon: <XCircle className="w-5 h-5" />,
  },
  {
    title: "Expiring Soon",
    value: 12,
    subtext: "Next 30 days",
    colorClass: "text-orange-700",
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100",
    icon: <Calendar className="w-5 h-5" />,
  },
]

export default function LicensesVerificationsPage() {
  const [statusFilter, setStatusFilter] = useState("All")
  const [typeFilter, setTypeFilter] = useState("All")
  const [cityFilter, setCityFilter] = useState("All")
  const [urgentFirst, setUrgentFirst] = useState(true)

  // Filter + (optional) sort by priority (urgent first)
  const filteredData = useMemo(() => {
    let data = initialVerifications.filter((item) => {
      const statusMatch = statusFilter === "All" || item.status === statusFilter
      const typeMatch = typeFilter === "All" || item.licenseType === typeFilter
      const cityMatch = cityFilter === "All" || cityFilter === "All" // placeholder for city support
      return statusMatch && typeMatch && cityMatch
    })

    if (urgentFirst) {
      const priorityWeight = (p: string) => {
        if (/urgent/i.test(p)) return 0
        if (/high|normal/i.test(p)) return 1
        return 2
      }
      data = data.slice().sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority))
    }

    return data
  }, [statusFilter, typeFilter, cityFilter, urgentFirst])

  // small helper to render avatar
  const Avatar = ({ initials }: { initials: string }) => (
    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-tr from-indigo-500 to-pink-500 text-white text-xs font-semibold">
      {initials}
    </div>
  )

  return (
    <div className="space-y-8 p-4 max-w-full">
      {/* Top area: metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <Card key={card.title} className="shadow-sm">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="text-sm font-medium text-gray-600">{card.title}</div>
                <div className={cn("text-2xl font-bold mt-1", card.colorClass)}>
                  {card.value}
                </div>
                <div className="text-xs text-gray-500 mt-1">{card.subtext}</div>
              </div>

              <div
                className={cn(
                  "w-9 h-9 flex items-center justify-center rounded-full",
                  card.iconBg,
                  card.iconColor
                )}
              >
                {card.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap gap-2 items-center">
          <Button className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white">
            <CheckCircle2 className="w-4 h-4" /> Bulk Approve (3)
          </Button>

          <Button variant="outline" className="flex items-center gap-2">
            <Bell className="w-4 h-4" /> Send Reminders
          </Button>

          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Report
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">Quick Actions</div>
          {/* spacer placeholder */}
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Pending Review">Pending</SelectItem>
            <SelectItem value="Verified">Verified</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All License Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All License Types</SelectItem>
            <SelectItem value="Medical Practitioner">Medical Practitioner</SelectItem>
            <SelectItem value="Registered Nurse">Registered Nurse</SelectItem>
            <SelectItem value="Pharmacist">Pharmacist</SelectItem>
          </SelectContent>
        </Select>

        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Cities</SelectItem>
            <SelectItem value="Lagos">Lagos</SelectItem>
            <SelectItem value="Abuja">Abuja</SelectItem>
            <SelectItem value="Port Harcourt">Port Harcourt</SelectItem>
            <SelectItem value="Kano">Kano</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="flex items-center gap-2 whitespace-nowrap">
          <Filter className="w-4 h-4" /> More Filters
        </Button>

        <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
          <button
            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100"
            onClick={() => setUrgentFirst((v) => !v)}
            aria-pressed={urgentFirst}
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>Showing urgent items first</span>
            {urgentFirst && <AlertTriangle className="w-4 h-4 text-rose-600" />}
          </button>
        </div>
      </div>

      {/* Verification Queue */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0">
          <div>
            <CardTitle className="text-lg">Verification Queue</CardTitle>
            <div className="text-sm text-gray-500">23 pending verifications</div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500 whitespace-nowrap">Sort</div>
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4" /> Date
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <Table className="min-w-[720px] sm:min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Professional</TableHead>
                <TableHead>License Type</TableHead>
                <TableHead>License Number</TableHead>
                <TableHead>Submitted Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="flex items-center gap-3 min-w-[180px]">
                    <Avatar initials={row.avatarInitials} />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{row.professional}</div>
                      <div className="text-xs text-gray-500 truncate">ID: PRO-2024-034</div>
                    </div>
                  </TableCell>

                  <TableCell className="min-w-[140px]">{row.licenseType}</TableCell>
                  <TableCell className="min-w-[120px]">{row.licenseNumber}</TableCell>

                  <TableCell className="min-w-[140px]">
                    <div className="flex flex-col">
                      <span>{row.submittedDate}</span>
                      {row.overdueText && <span className="text-xs text-rose-600">{row.overdueText}</span>}
                    </div>
                  </TableCell>

                  <TableCell className="min-w-[110px]">
                    <Badge
                      className={cn(
                        "capitalize",
                        row.status.includes("Pending") && "bg-amber-100 text-amber-700",
                        row.status === "Verified" && "bg-emerald-100 text-emerald-700",
                        row.status === "Rejected" && "bg-rose-100 text-rose-700"
                      )}
                    >
                      {row.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="min-w-[100px]">
                    <Badge
                      className={cn(
                        "capitalize",
                        /urgent/i.test(row.priority) && "bg-rose-100 text-rose-700",
                        /normal|medium/i.test(row.priority) && "bg-amber-100 text-amber-700",
                        /low/i.test(row.priority) && "bg-gray-100 text-gray-600"
                      )}
                    >
                      {row.priority}
                    </Badge>
                  </TableCell>

                  <TableCell className="flex items-center gap-2 min-w-[80px]">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">{row.documents}</span>
                  </TableCell>

                  <TableCell className="text-right min-w-[100px]">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" className="p-1" aria-label="View details">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" className="p-1" title="Approve">
                        <Check className="w-4 h-4 text-emerald-600" />
                      </Button>
                      <Button variant="ghost" className="p-1" title="Reject">
                        <X className="w-4 h-4 text-rose-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {/* If no rows */}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-6">
                    No records match the selected filters.
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
