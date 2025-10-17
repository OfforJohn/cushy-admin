import {
  TrendingUp,
  ShoppingCart,
  Utensils,
  Pill,
  ShoppingBasket,
  Heart,
  Truck,
  Users,
  Megaphone,
  HelpCircle,
  Settings,
} from "lucide-react"

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
      { label: "Orders", href: "/dashboard/restaurants/orders" },
      { label: "Products", href: "/dashboard/restaurants/products" },
      { label: "Restaurants", href: "/dashboard/restaurants/list" },
      { label: "Branches", href: "/dashboard/restaurants/branches" },
    ],
  },
  {
    label: "Pharmacy",
    icon: Pill,
    href: "/dashboard/pharmacy",
  },
  {
    label: "Groceries",
    icon: ShoppingBasket,
    href: "/dashboard/groceries",
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
    href: "/dashboard/marketing",
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
