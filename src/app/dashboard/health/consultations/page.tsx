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
    value: "0",
    sub: "0 today",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
  {
    id: "ongoing",
    title: "Ongoing",
    value: 0,
    sub: "Live sessions",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    icon: <Video className="w-5 h-5" />,
  },
  {
    id: "awaiting",
    title: "Awaiting",
    value: 0,
    sub: "Avg 12 min wait",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    icon: <Hourglass className="w-5 h-5" />,
  },
  {
    id: "completion",
    title: "Completion Rate",
    value: "0%",
    sub: "This week",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
  {
    id: "disputed",
    title: "Disputed",
    value: "0",
    sub: "Needs review",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    icon: <AlertTriangle className="w-5 h-5" />,
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

  const filtered = useMemo(() => {
  
  }, [status, mode, specialty, city, q])


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
            
            <div className="text-sm text-gray-500">0 consultations</div>
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

          </Table>

          {/* pagination */}
    
        </CardContent>
      </Card>
    </div>
  )
}
