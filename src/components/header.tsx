"use client"

import { Bell, Menu, User } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { getPageTitle } from "@/lib/dashboard-routes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react"

type HeaderProps = {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const title = getPageTitle(pathname)
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  
  const router = useRouter();


  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUserEmail(parsed.firstName);
    }
  }, []);

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


          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User profile */}
          <div className="flex items-center gap-2 md:gap-3">
            <div onClick={() => setIsModalOpen(true)} className="cursor-pointer">
              <Avatar className="w-8 h-8 md:w-9 md:h-9">
                <AvatarImage src="/professional-woman-diverse.png" />
              <AvatarFallback className="bg-gray-200 flex items-center justify-center">
    <User className="w-4 h-4 text-gray-600" />
  </AvatarFallback>
              </Avatar>
            </div>

            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
                <div className="bg-white w-80 rounded-lg shadow-lg p-6">
                  <h2 className="text-lg font-semibold mb-3">Account</h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Do you want to log out?
                  </p>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={() => {
                        localStorage.removeItem("token");
                        router.push("/auth/signin");
                      }}
                      className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}


            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">  {userEmail ?? "Loading..."}</p>

            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
