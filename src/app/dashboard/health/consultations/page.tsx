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
  AlertTriangle,
  ArrowUpDown,
  MoreHorizontal,
  Video,
  MessageSquare,
  Phone
} from "lucide-react"

// ----------------- static mock data to match screenshot -----------------
const metrics = [
  {
    id: "total",
    title: "Total Consultations",
    value: "1,247",
    sub: "+23 today",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
  {
    id: "ongoing",
    title: "Ongoing",
    value: 18,
    sub: "Live sessions",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    icon: <Video className="w-5 h-5" />,
  },
  {
    id: "awaiting",
    title: "Awaiting",
    value: 45,
    sub: "Avg 12 min wait",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    icon: <Hourglass className="w-5 h-5" />,
  },
  {
    id: "completion",
    title: "Completion Rate",
    value: "94.2%",
    sub: "This week",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
  {
    id: "disputed",
    title: "Disputed",
    value: 7,
    sub: "Needs review",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    icon: <AlertTriangle className="w-5 h-5" />,
  },
]

const consultationsMock = [
  {
    id: "CONS-2024-1247",
    date: "Jan 15, 2024",
    user: { name: "John Doe", phone: "+234 801 234 5678", initials: "JD" },
    professional: { name: "Dr. Sarah Johnson", speciality: "General Medicine", initials: "SJ" },
    mode: "Video",
    time: "2:30 PM • 30 min",
    fee: "₦5,000",
    status: "Ongoing",
    prescription: false,
  },
  // add a few more rows to show table density/pagination look
  {
    id: "CONS-2024-1246",
    date: "Jan 14, 2024",
    user: { name: "Jane Smith", phone: "+234 802 555 1234", initials: "JS" },
    professional: { name: "Dr. Kemi Ade", speciality: "Paediatrics", initials: "KA" },
    mode: "Chat",
    time: "11:00 AM • 20 min",
    fee: "₦2,500",
    status: "Completed",
    prescription: true,
  },
  {
    id: "CONS-2024-1245",
    date: "Jan 13, 2024",
    user: { name: "Michael Obi", phone: "+234 803 999 2020", initials: "MO" },
    professional: { name: "Dr. Chike Nwosu", speciality: "Dermatology", initials: "CN" },
    mode: "Audio",
    time: "9:00 AM • 15 min",
    fee: "₦3,000",
    status: "Awaiting",
    prescription: false,
  },
]

// ----------------- small avatar helper -----------------
const Avatar = ({ initials }: { initials: string }) => (
  <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-tr from-indigo-500 to-pink-500 text-white text-xs font-semibold">
    {initials}
  </div>
)

// ----------------- main component -----------------
export default function ConsultationsDashboardPage() {
  // filters state (static UI only)
  const [city, setCity] = useState("All")
  const [status, setStatus] = useState("All")
  const [mode, setMode] = useState("All")
  const [specialty, setSpecialty] = useState("All")
  const [q, setQ] = useState("")
  const [page, setPage] = useState(1)

  const perPage = 10
  const total = consultationsMock.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))

  const filtered = useMemo(() => {
    return consultationsMock.filter((c) => {
      if (status !== "All" && c.status !== status) return false
      if (mode !== "All" && c.mode !== mode) return false
      if (specialty !== "All" && c.professional.speciality !== specialty) return false
      if (city !== "All") {
        // static mock has no city field — keep it as placeholder
      }
      if (q.trim() !== "") {
        const s = q.toLowerCase()
        return (
          c.id.toLowerCase().includes(s) ||
          c.user.name.toLowerCase().includes(s) ||
          c.professional.name.toLowerCase().includes(s)
        )
      }
      return true
    })
  }, [status, mode, specialty, city, q])

  const pageData = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="space-y-6 p-6">
      {/* header row with title + search + avatar */}
   

      {/* metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((m) => (
          <Card key={m.id} className="shadow-sm">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="text-xs font-medium text-gray-500">{m.title}</div>
                <div className="text-xl font-bold mt-1">{m.value}</div>
                <div className="text-xs text-gray-400 mt-1">{m.sub}</div>
              </div>
              <div className={cn("w-10 h-10 flex items-center justify-center rounded-full", m.iconBg, m.iconColor)}>
                {m.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* filters row */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Ongoing">Ongoing</SelectItem>
              <SelectItem value="Awaiting">Awaiting</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Disputed">Disputed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Modes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Modes</SelectItem>
              <SelectItem value="Video">Video</SelectItem>
              <SelectItem value="Audio">Audio</SelectItem>
              <SelectItem value="Chat">Chat</SelectItem>
            </SelectContent>
          </Select>

          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Specialties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Specialties</SelectItem>
              <SelectItem value="General Medicine">General Medicine</SelectItem>
              <SelectItem value="Paediatrics">Paediatrics</SelectItem>
              <SelectItem value="Dermatology">Dermatology</SelectItem>
            </SelectContent>
          </Select>

          <div className="w-[160px]">
            <Input placeholder="mm/dd/yyyy" />
          </div>

          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" /> More Filters
          </Button>

          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>

          <Button className="ml-auto bg-violet-700 hover:bg-violet-800 text-white flex items-center gap-2">
            <Eye className="w-4 h-4" /> Live Monitor
          </Button>
        </CardContent>
      </Card>

      {/* consultations table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Consultations</CardTitle>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Button variant="ghost" className="flex items-center gap-2">
            
            <div className="text-sm text-gray-500">1,247 consultations</div>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Consultation ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Professional</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prescription</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {pageData.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="text-xs text-gray-500">{r.id}</div>
                    <div className="text-sm text-gray-700">{r.date}</div>
                  </TableCell>
<TableCell>
  <div className="flex items-center gap-3">
    <img
      src={
        r.user.avatarUrl ||
        `https://randomuser.me/api/portraits/${
          r.user.gender === "female" ? "women" : "men"
        }/${r.user.id || Math.floor(Math.random() * 80)}.jpg`
      }
      alt={r.user.name}
      className="w-8 h-8 rounded-full object-cover"
    />
    <div>
      <div className="font-medium">{r.user.name}</div>
      <div className="text-xs text-gray-500">{r.user.phone}</div>
    </div>
  </div>
</TableCell>

<TableCell>
  <div className="flex items-center gap-3">
    <img
      src={
        r.professional.avatarUrl ||
        `https://randomuser.me/api/portraits/${
          r.professional.gender === "female" ? "women" : "men"
        }/${r.professional.id || Math.floor(Math.random() * 80)}.jpg`
      }
      alt={r.professional.name}
      className="w-8 h-8 rounded-full object-cover"
    />
    <div>
      <div className="font-medium">{r.professional.name}</div>
      <div className="text-xs text-gray-500">{r.professional.speciality}</div>
    </div>
  </div>
</TableCell>


                  <TableCell>
                    <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                      {r.mode === "Video" && <Video className="w-4 h-4 text-sky-600" />}
                      {r.mode === "Chat" && <MessageSquare className="w-4 h-4 text-sky-600" />}
                      {r.mode === "Audio" && <Phone className="w-4 h-4 text-sky-600" />}
                      <span>{r.mode}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm">{r.time}</div>
                  </TableCell>

                  <TableCell className="font-medium">{r.fee}</TableCell>

                  <TableCell>
                    <Badge
                      className={cn(
                        "capitalize",
                        r.status === "Ongoing" && "bg-emerald-100 text-emerald-700",
                        r.status === "Awaiting" && "bg-amber-100 text-amber-700",
                        r.status === "Completed" && "bg-sky-100 text-sky-700",
                        r.status === "Disputed" && "bg-rose-100 text-rose-700"
                      )}
                    >
                      {r.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {r.prescription ? (
                      <Badge className="bg-emerald-50 text-emerald-700">Yes</Badge>
                    ) : (
                      <Badge className="bg-gray-50 text-gray-600">No</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {pageData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-6">
                    No consultations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">Showing {pageData.length} of {filtered.length} results</div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                &lt;
              </Button>

              <div className="px-3 py-1 text-sm bg-gray-50 border rounded-md">
                {page} / {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                &gt;
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
