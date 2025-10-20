"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingCart, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { dashboardRoutes } from "@/lib/dashboard-routes"

export function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(["Restaurants"])

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]))
  }

  const isRouteActive = (href: string, children?: { href: string }[]) => {
    if (pathname === href) return true
    if (children) {
      return children.some((child) => pathname === child.href)
    }
    return false
  }

  return (
  <aside className="w-full h-full bg-[#5B2C6F] text-white flex flex-col">


      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#7B4A8F] rounded-lg flex items-center justify-center">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-base">Cushy Access</h1>
          <p className="text-xs text-purple-200">Admin Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {dashboardRoutes.map((item) => {
          const isActive = isRouteActive(item.href, item.children)
          const hasChildren = item.children && item.children.length > 0

          return (
            <div key={item.label}>
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(item.label)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    isActive ? "bg-[#7B4A8F] text-white" : "text-purple-100 hover:bg-[#6B3C7F]",
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    className={cn("w-4 h-4 transition-transform", expandedItems.includes(item.label) && "rotate-180")}
                  />
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    isActive ? "bg-[#7B4A8F] text-white" : "text-purple-100 hover:bg-[#6B3C7F]",
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                </Link>
              )}

              {hasChildren && expandedItems.includes(item.label) && (
                <div className="ml-10 mt-1 space-y-1">
                  {item.children!.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={cn(
                        "block w-full text-left px-3 py-1.5 text-sm transition-colors",
                        pathname === subItem.href ? "text-white font-medium" : "text-purple-200 hover:text-white",
                      )}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}