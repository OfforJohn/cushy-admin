import {
  TrendingUp,
  ShoppingCart,
  Utensils,
  Pill,
  ShoppingBasket,
  BadgeQuestionMark,
  Heart,
  Truck,
  Users,
  Megaphone,
  HelpCircle,
  Settings,
} from "lucide-react"
import { Children } from "react";


const pendingVendors = 3; // fetched from API
export const dashboardRoutes = [


  {
    label: "Overview",
    icon: TrendingUp,
    href: "/dashboard",
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    href: "/dashboard/orders",
  },
  {
    label: "Restaurants",
    icon: Utensils,
    href: "/dashboard/restaurants",
    children: [
      { label: "Orders", href: "#", key: "orders" },
      { label: "Products", href: "#", key: "products" },
      { label: "Restaurants", href: "/dashboard/restaurants/restaurant", key: "restaurants" },
      { label: "Branches", href: "#", key: "branches" },

    ],
  },
  {
    label: "Pharmacy",
    icon: Pill,
    href: "/dashboard/pharmacy",

    children: [
      { label: "Pharmacies", href: "/dashboard/pharmacy/pharmacies", key: "pharmacies" },
  
    ],
  },



  {
    label: "Groceries",
    icon: ShoppingBasket,
    href: "/dashboard/groceries",

    children: [
      { label: "Groceries", href: "/dashboard/groceries/groceries", key: "groceries" },
    ],
  },
  {
    label: "Vendor Approval",

    icon: () => (
      <div className="relative">
        <BadgeQuestionMark className={pendingVendors > 0 ? "animate-pulse text-red-500" : ""} />
        {pendingVendors > 0 && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full animate-ping" />
        )}
      </div>
    ),
    href: "/dashboard/vendor-approval",
  },
  {
    label: "Health",
    icon: Heart,
    href: "/dashboard/health",
    children: [
      { label: "Professionals", href: "/dashboard/health/professionals" },
      { label: "Consultations", href: "/dashboard/health/consultations" },
      { label: "Licenses & Verifications", href: "/dashboard/health/licenses-verifications" },
    ],
  },
  {
    label: "Logistics",
    icon: Truck,
    href: "/dashboard/logistics",
  },
  {
    label: "Users & Wallet",
    icon: Users,
    href: "/dashboard/users-wallet",
  },
  {
    label: "Marketing",
    icon: Megaphone,
    href: "#",
  },
  {
    label: "Analytics",
    icon: HelpCircle,
    href: "/dashboard/analytics",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
]

// ✅ FIXED FUNCTION
export function getPageTitle(pathname: string): string {
  const cleanPath = pathname.split("?")[0].replace(/\/$/, "")

  // 1️⃣ Check child routes FIRST
  for (const route of dashboardRoutes) {
    if (route.children) {
      const child = route.children.find((c) => cleanPath === c.href)
      if (child) return child.label
    }
  }

  // 2️⃣ Then check parent routes
  const parentMatch = dashboardRoutes.find((r) => cleanPath === r.href)
  if (parentMatch) return parentMatch.label

  // 3️⃣ Try fuzzy match for partial (fallback)
  for (const route of dashboardRoutes) {
    if (route.children) {
      const child = route.children.find((c) => cleanPath.startsWith(c.href))
      if (child) return child.label
    }
    if (cleanPath.startsWith(route.href)) return route.label
  }

  return "Dashboard"
}
