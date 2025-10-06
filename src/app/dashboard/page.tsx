import { TrendingUp, ShoppingCart, CheckCircle2, Clock, Filter, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const metrics = [
  {
    title: "GMV Today",
    value: "₦2.4M",
    change: "12.5% vs yesterday",
    isPositive: true,
    icon: TrendingUp,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Orders",
    value: "1,247",
    change: "8.2% vs yesterday",
    isPositive: true,
    icon: ShoppingCart,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Completion Rate",
    value: "94.2%",
    change: "2.1% vs yesterday",
    isPositive: false,
    icon: CheckCircle2,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Avg Delivery Time",
    value: "28 min",
    change: "3 min faster",
    isPositive: true,
    icon: Clock,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
]

const queueItems = [
  {
    title: "New Orders",
    description: "Awaiting vendor acceptance",
    count: 23,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    badgeColor: "bg-orange-500",
    dotColor: "bg-orange-400",
  },
  {
    title: "On Trip",
    description: "Out for delivery",
    count: 156,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    badgeColor: "bg-blue-500",
    dotColor: "bg-blue-400",
  },
  {
    title: "Verification Pending",
    description: "KYC documents review",
    count: 8,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    badgeColor: "bg-red-500",
    dotColor: "bg-red-400",
  },
]

const alerts = [
  {
    title: "Payout Requests",
    description: "Ready for approval",
    count: 12,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    badgeColor: "bg-teal-500",
    dotColor: "bg-teal-400",
  },
  {
    title: "Support Tickets",
    description: "Awaiting response",
    count: 34,
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    badgeColor: "bg-purple-600",
    dotColor: "bg-purple-500",
  },
  {
    title: "Consultations",
    description: "Booked for today",
    count: 67,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    badgeColor: "bg-orange-500",
    dotColor: "bg-orange-400",
  },
]

const orders = [
  {
    id: "#ORD-2024-001",
    customer: {
      name: "John Doe",
      phone: "+234 801 234 5678",
      avatar: "/man.jpg",
    },
    vendor: "Tasty Bites",
    city: "Lagos",
    total: "₦4,500",
    status: "Completed",
  },
]

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">{metric.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                  <p className={`text-sm ${metric.isPositive ? "text-green-600" : "text-red-600"}`}>
                    {metric.isPositive ? "↑" : "↓"} {metric.change}
                  </p>
                </div>
                <div className={`${metric.iconBg} p-3 rounded-lg`}>
                  <metric.icon className={`w-6 h-6 ${metric.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Order Queue and System Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Order Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Live Order Queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {queueItems.map((item) => (
              <div
                key={item.title}
                className={`${item.bgColor} border ${item.borderColor} rounded-lg p-4 flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.dotColor}`} />
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                <span className={`${item.badgeColor} text-white text-sm font-semibold px-3 py-1 rounded-full`}>
                  {item.count}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">System Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.title}
                className={`${alert.bgColor} border ${alert.borderColor} rounded-lg p-4 flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${alert.dotColor}`} />
                  <div>
                    <p className="font-medium text-gray-900">{alert.title}</p>
                    <p className="text-sm text-gray-600">{alert.description}</p>
                  </div>
                </div>
                <span className={`${alert.badgeColor} text-white text-sm font-semibold px-3 py-1 rounded-full`}>
                  {alert.count}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Orders</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button size="sm" className="bg-[#5B2C6F] hover:bg-[#4A2359]">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">City</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={order.customer.avatar || "/placeholder.svg"} />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.customer.name}</p>
                          <p className="text-xs text-gray-500">{order.customer.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900">{order.vendor}</td>
                    <td className="py-4 px-4 text-sm text-gray-900">{order.city}</td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">{order.total}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Button variant="ghost" size="sm" className="text-gray-600">
                        View
                      </Button>
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
