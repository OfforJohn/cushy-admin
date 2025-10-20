"use client"

import { Search, Bell, Menu } from "lucide-react"
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

type HeaderProps = {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 md:px-6 md:py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Top row: title + mobile menu */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger menu button - visible only on mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onMenuClick}
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </Button>

            <h2 className="text-lg md:text-2xl font-semibold text-gray-900">{title}</h2>

            {/* City selector (hidden on mobile) */}
            <Select defaultValue="all">
              <SelectTrigger className="hidden sm:flex w-32 md:w-36">
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
        </div>

        {/* Bottom row: search + icons + profile */}
        <div className="flex flex-wrap items-center justify-between gap-3 md:justify-end">
          {/* Search */}
          <div className="relative flex-1 min-w-[160px] sm:min-w-[240px] md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-10 bg-gray-50 border-gray-200 w-full"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User profile */}
          <div className="flex items-center gap-2 md:gap-3">
            <Avatar className="w-8 h-8 md:w-9 md:h-9">
              <AvatarImage src="/professional-woman-diverse.png" />
              <AvatarFallback>SA</AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">Sarah Admin</p>
              <p className="text-xs text-gray-500">SuperAdmin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
