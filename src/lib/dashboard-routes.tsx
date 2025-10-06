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
      {
        label: "Orders",
        href: "/dashboard/restaurants/orders",
      },
      {
        label: "Products",
        href: "/dashboard/restaurants/products",
      },
      {
        label: "Restaurants",
        href: "/dashboard/restaurants/list",
      },
      {
        label: "Branches",
        href: "/dashboard/restaurants/branches",
      },
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
    label: "Support",
    icon: HelpCircle,
    href: "/dashboard/support",
  },
]

export function getPageTitle(pathname: string) {
  // Check for exact match first
  const exactMatch = dashboardRoutes.find((route) => route.href === pathname)
  if (exactMatch) return exactMatch.label

  // Check for child routes
  for (const route of dashboardRoutes) {
    if (route.children) {
      const childMatch = route.children.find((child) => child.href === pathname)
      if (childMatch) return childMatch.label
    }

    // Check if pathname starts with route href
    if (pathname.startsWith(`${route.href}/`)) {
      return route.label
    }
  }

  return "Dashboard"
}
