"use client"

import { Search, Bell } from "lucide-react"
import { usePathname } from "next/navigation"
import { getPageTitle } from "@/lib/dashboard-routes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function Header() {
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side: title + city selector */}
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>

          <Select defaultValue="all">
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              <SelectItem value="lagos">Lagos</SelectItem>
              <SelectItem value="abuja">Abuja</SelectItem>
              <SelectItem value="ph">Port Harcourt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Right side: search, notifications, profile */}
        <div className="flex items-center gap-4">
          {/* Search bar */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User profile */}
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9">
              <AvatarImage src="/professional-woman-diverse.png" />
              <AvatarFallback>SA</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900">Sarah Admin</p>
              <p className="text-xs text-gray-500">SuperAdmin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
