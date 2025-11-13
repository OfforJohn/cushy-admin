"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TrendingUp, ShoppingCart, CheckCircle2, Clock, Filter, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast-provider"
import { API_BASE_URL } from "@/lib/apiConfig"


interface OrderItem {
  name: string
  quantity: number
  isAvailable: boolean
  price: string
}

interface OrderItemResponse {
  name: string;
  quantity: number;
  price: number;
}

interface OrderResponse {
  id: string;
  fullHouseAddress?: string;
  customer?: {
    name?: string;
    phone?: string;
    avatar?: string;
  };
  orderItems?: OrderItemResponse[];
  totalAmount?: number | string;
  status?: string;
}


interface Order {
  id: string
  fullHouseAddress: string
  customerName: string
  customerPhone: string
  orderItems: OrderItem[]
  totalAmount: number
  paymentStatus: "Paid" | "Unpaid"
  status: "Completed" | "Pending" | string
}

const queueItems = [
  { title: "New Orders", description: "Awaiting vendor acceptance", count: 23, bgColor: "bg-yellow-50", borderColor: "border-yellow-200", badgeColor: "bg-orange-500", dotColor: "bg-orange-400" },
  { title: "On Trip", description: "Out for delivery", count: 156, bgColor: "bg-blue-50", borderColor: "border-blue-200", badgeColor: "bg-blue-500", dotColor: "bg-blue-400" },
  { title: "Verification Pending", description: "KYC documents review", count: 8, bgColor: "bg-red-50", borderColor: "border-red-200", badgeColor: "bg-red-500", dotColor: "bg-red-400" },
]

const alerts = [
  { title: "Payout Requests", description: "Ready for approval", count: 12, bgColor: "bg-green-50", borderColor: "border-green-200", badgeColor: "bg-teal-500", dotColor: "bg-teal-400" },
  { title: "Support Tickets", description: "Awaiting response", count: 34, bgColor: "bg-purple-50", borderColor: "border-purple-200", badgeColor: "bg-purple-600", dotColor: "bg-purple-500" },
  { title: "Consultations", description: "Booked for today", count: 67, bgColor: "bg-yellow-50", borderColor: "border-yellow-200", badgeColor: "bg-orange-500", dotColor: "bg-orange-400" },
]

export default function DashboardOverviewPage() {
  const router = useRouter()
  const { Toast, showToast } = useToast()
  const [authChecked, setAuthChecked] = useState(false)
  const [ordersCount, setOrdersCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Route guard
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      sessionStorage.setItem("authMessage", "Please sign back in to continue.")
      router.replace("/auth/signin")
      return
    }
    setAuthChecked(true)
  }, [router])

  // Fetch dashboard metrics
  useEffect(() => {
    if (!authChecked) return
    const fetchOrderStats = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)
        const from = yesterday.toISOString().split("T")[0]
        const to = today.toISOString().split("T")[0]

        const res = await fetch(`${API_BASE_URL}/api/v1/admin/orders-stats?from=${from}&to=${to}`, {
          headers: { "Content-Type": "application/json", "cushy-access-key": `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.status === 401 || data?.message === "TOKEN_EXPIRED") {
          localStorage.removeItem("token")
          sessionStorage.setItem("authMessage", "Please sign back in to continue.")
          router.replace("/auth/signin")
          return
        }
        if (res.ok && data?.data) setOrdersCount(data.data.totalOrders)
      } catch (err) {
        console.error(err)
        showToast("Unable to fetch order statistics", "error")
      } finally {
        setLoading(false)
      }
    }
    fetchOrderStats()
  }, [authChecked, router, showToast])

  // Fetch recent orders
  useEffect(() => {
    if (!authChecked) return
    const fetchRecentOrders = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return
        const res = await fetch(`${API_BASE_URL}/api/v1/orders/get-all-orders`, {
          headers: { "Content-Type": "application/json", "cushy-access-key": `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok && Array.isArray(data)) {
          const formatted: Order[] = (data as OrderResponse[]).map((o) => ({
            id: o.id,
            fullHouseAddress: o.fullHouseAddress || "N/A",
            customerName: o.customer?.name || "Unknown",
            customerPhone: o.customer?.phone || "--",
            orderItems: (o.orderItems || []).map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price.toString(),
              isAvailable: true, // ✅ correct place
            })),
            totalAmount: Number(o.totalAmount || 0),
            paymentStatus: Number(o.totalAmount) > 0 ? "Paid" : "Unpaid",
            status: o.status || "Pending",
          }))

          setRecentOrders(formatted)
        } else {
          console.error("Unexpected response:", data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchRecentOrders()
  }, [authChecked])

  if (!authChecked) return null

  const filteredOrders = recentOrders.filter(
    (o) =>
      o.fullHouseAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const metrics = [
    { title: "GMV Today", value: "₦2.4M", change: "12.5% vs yesterday", isPositive: true, icon: TrendingUp, iconBg: "bg-green-100", iconColor: "text-green-600" },
    { title: "Admin Orders", value: loading ? "Loading..." : ordersCount?.toLocaleString() || "0", isPositive: true, icon: ShoppingCart, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
    { title: "Completion Rate", value: "94.2%", change: "2.1% vs yesterday", isPositive: false, icon: CheckCircle2, iconBg: "bg-purple-100", iconColor: "text-purple-600" },
    { title: "Avg Delivery Time", value: "28 min", change: "3 min faster", isPositive: true, icon: Clock, iconBg: "bg-orange-100", iconColor: "text-orange-600" },
  ]

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(metric => (
          <Card key={metric.title} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => metric.title === "Admin Orders" && router.push("/dashboard/orders")}>
            <CardContent className="p-6 flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{metric.title}</p>
                <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                {metric.change && <p className={`text-sm ${metric.isPositive ? "text-green-600" : "text-red-600"}`}>{metric.change}</p>}
              </div>
              <div className={`${metric.iconBg} p-3 rounded-lg`}>
                <metric.icon className={`w-6 h-6 ${metric.iconColor}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Queue & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Live Order Queue</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {queueItems.map(item => (
              <div key={item.title} className={`${item.bgColor} border ${item.borderColor} rounded-lg p-4 flex justify-between items-center`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.dotColor}`} />
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                <span className={`${item.badgeColor} text-white text-sm font-semibold px-3 py-1 rounded-full`}>{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>System Alerts</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.title} className={`${alert.bgColor} border ${alert.borderColor} rounded-lg p-4 flex justify-between items-center`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${alert.dotColor}`} />
                  <div>
                    <p className="font-medium text-gray-900">{alert.title}</p>
                    <p className="text-sm text-gray-600">{alert.description}</p>
                  </div>
                </div>
                <span className={`${alert.badgeColor} text-white text-sm font-semibold px-3 py-1 rounded-full`}>{alert.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        
  <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
  <CardTitle>Recent Orders</CardTitle>

  <div className="flex w-full sm:w-auto gap-2">
    <input
      type="text"
      placeholder="Search orders..."
      className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      value={searchQuery}
      onChange={e => setSearchQuery(e.target.value)}
    />

    {/* Responsive Export Button */}
    <Button
      size="sm"
      className="bg-[#5B2C6F] hover:bg-[#4A2359] flex items-center justify-center"
    >
      {/* Icon only on mobile */}
      <Download className="w-4 h-4 sm:mr-2" />
      {/* Show text only on medium+ screens */}
      <span className="hidden sm:inline">Export</span>
    </Button>
  </div>
</CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Full House Address</th>

                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Name of Items</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Num of Items</th>

                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>

                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} className="py-6 text-center text-gray-500">Loading orders...</td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr><td colSpan={10} className="py-6 text-center text-gray-500">No orders found.</td></tr>
                ) : filteredOrders.map(order => (
                  <tr key={order.id} className="bg-white hover:bg-gray-50 transition-colors border-b border-gray-200">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{order.id}</td>

                    <td className="py-3 px-4 text-sm text-gray-700">{order.fullHouseAddress}</td>



                    <td className="py-3 px-4 text-sm text-gray-700">
                      {order.orderItems.map((i, idx) => (
                        <span key={idx} className="inline-block mr-1 px-2 py-0.5 bg-purple-50 text-purple-800 text-xs rounded">
                          {i.name}
                        </span>
                      ))}
                    </td>

                    <td className="py-3 px-4 text-sm text-gray-700">{order.orderItems.reduce((sum, i) => sum + i.quantity, 0)}</td>



                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">₦{order.totalAmount.toLocaleString()}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium 
      ${order.orderItems?.every(item => item.isAvailable)
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"}`}
                      >
                        {order.orderItems?.every(item => item.isAvailable)
                          ? "Available"
                          : "Unavailable"}
                      </span>
                    </td>




                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-purple-600 hover:bg-purple-50">View</Button>
  
                      </div>
                    </td>
                  </tr>

                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
