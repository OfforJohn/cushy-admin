"use client"

import { useEffect, useState } from "react"
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  TrendingUp,
  Filter,
  Download,
  Search,
  RefreshCw,
  Eye,
  Edit,
  MoreVertical,
  FileDown,
  RefreshCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { API_BASE_URL } from "@/lib/apiConfig";


import { useRouter } from "next/navigation"

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [pendingOrders, setPendingOrders] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [totalOrdersToday, setTotalOrdersToday] = useState<number | null>(null)
const [totalOrdersYesterday, setTotalOrdersYesterday] = useState<number | null>(null)
const [percentageChange, setPercentageChange] = useState<number | null>(null)



  // ✅ Redirect if no token
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/signin")
    }
  }, [router])


useEffect(() => {
  const fetchDailyOrders = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/api/v1/orders/get-all-orders`, {
        headers: {
          "Content-Type": "application/json",
          "cushy-access-key": `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok && Array.isArray(data)) {
        const today = new Date().toISOString().split("T")[0]

        // Get yesterday’s date (YYYY-MM-DD)
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayDate = yesterday.toISOString().split("T")[0]

        // Filter orders created today
        const todayOrders = data.filter((order) =>
          order.createdAt.startsWith(today)
        )

        // Filter orders created yesterday
        const yesterdayOrders = data.filter((order) =>
          order.createdAt.startsWith(yesterdayDate)
        )

        const todayCount = todayOrders.length
        const yesterdayCount = yesterdayOrders.length

        setTotalOrdersToday(todayCount)
        setTotalOrdersYesterday(yesterdayCount)

        // Calculate % change (avoid divide by zero)
        if (yesterdayCount > 0) {
          const percent = ((todayCount - yesterdayCount) / yesterdayCount) * 100
          setPercentageChange(percent)
        } else {
          setPercentageChange(null)
        }
      } else {
        console.error("Unexpected API response:", data)
      }
    } catch (err) {
      console.error("Error fetching total orders:", err)
    }
  }

  fetchDailyOrders()
}, [])








  // ✅ Fetch PENDING orders count
  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const response = await fetch(
          `${API_BASE_URL}/api/v1/orders?filter[status]=PENDING`,
          {
            headers: {
              "Content-Type": "application/json",
              "cushy-access-key": `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        // ✅ Extract count from pagination
        if (response.ok && data?.pagination) {
          setPendingOrders(data.pagination.totalItems)
        } else {
          console.error("Unexpected response format:", data)
          setError("Unexpected response from server")
        }
      } catch (err) {
        console.error("Error fetching pending orders:", err)
        setError("Failed to fetch pending orders")
      } finally {
        setLoading(false)
      }
    }

    fetchPendingOrders()
  }, [])




  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 pb-10">

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* ... Cards (same as before) */}
        {/* Total Orders */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
  <div className="flex items-start justify-between">
    <div>
      <p className="text-sm text-gray-600 mb-1">Total Orders (Today)</p>
      <h3 className="text-3xl font-bold mb-2">
        {totalOrdersToday !== null ? totalOrdersToday : "..."}
      </h3>
      <p className="text-sm text-teal-600">
        {percentageChange !== null && totalOrdersYesterday !== null ? (
          <>
            {percentageChange >= 0 ? "+" : ""}
            {percentageChange.toFixed(1)}% from yesterday
          </>
        ) : (
          totalOrdersYesterday === 0
            ? "No orders yesterday for comparison"
            : "Fetching data..."
        )}
      </p>
    </div>

    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
      <ShoppingCart className="w-6 h-6 text-blue-500" />
    </div>
  </div>
</div>


        {/* Pending Orders */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
              <h3 className="text-3xl font-bold mb-2">
                {loading ? "..." : pendingOrders ?? "--"}
              </h3>
              <p className="text-sm text-orange-600">
                {error
                  ? error
                  : pendingOrders === 0
                    ? "No pending orders"
                    : "Requires attention"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <h3 className="text-3xl font-bold mb-2">2,543</h3>
              <p className="text-sm text-teal-600">89.3% completion rate</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-teal-500" />
            </div>
          </div>
        </div>

        {/* Revenue Today */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Revenue Today</p>
              <h3 className="text-3xl font-bold mb-2">₦487K</h3>
              <p className="text-sm text-teal-600">+8% from yesterday</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Business Type */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Business Type:</label>
            <Select defaultValue="all-types">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-types">All Types</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="pharmacy">Pharmacy</SelectItem>
                <SelectItem value="grocery">Grocery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Status:</label>
            <Select defaultValue="all-status">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="on-transit">On Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* City */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">City:</label>
            <Select defaultValue="all-cities">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-cities">All Cities</SelectItem>
                <SelectItem value="lagos">Lagos</SelectItem>
                <SelectItem value="abuja">Abuja</SelectItem>
                <SelectItem value="minna">Minna</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range From */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range From:</label>
            <Input type="date" placeholder="mm/dd/yyyy" className="w-full" />
          </div>

          {/* Date Range To */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range To:</label>
            <Input type="date" placeholder="mm/dd/yyyy" className="w-full" />
          </div>
        </div>


        <div className="flex flex-wrap gap-3">
          {/* Apply Filters */}
          <Button className="bg-[#5B2C6F] hover:bg-[#4a2359] text-white">
            <Filter className="w-4 h-4 mr-2" />
            Apply Filters
          </Button>

          {/* Export CSV */}
          <Button variant="outline">
            <FileDown className="w-4 h-4 mr-2 text-[#5B2C6F]" />
            Export CSV
          </Button>

          {/* Update Orders */}
          <Button
            variant="outline"
            onClick={() => router.push("ORD-2024-001264")}
            className="cursor-pointer transition-transform duration-150 hover:scale-105 hover:border-[#5B2C6F]"
          >
            <RefreshCcw className="w-4 h-4 mr-2 text-[#5B2C6F]" />
            Update Orders
          </Button>
     <Button
            variant="outline"
            onClick={() => router.push("/dashboard/orders/assign-rider")}
            className="cursor-pointer transition-transform duration-150 hover:scale-105 hover:border-[#5B2C6F]"
          >
            <RefreshCcw className="w-4 h-4 mr-2 text-[#5B2C6F]" />
            Assign Rider
          </Button>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold">All Orders</h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {/* ...table headers remain unchanged */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Rows remain unchanged */}
              {/* Order 1 */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-[#5B2C6F]">#ORD-2024-001</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3"> <img
                                            src={`https://i.pravatar.cc/55`}
                                            alt="rider"
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                    <div>
                      <p className="text-sm font-medium text-gray-900">John Doe</p>
                      <p className="text-sm text-gray-500">+234 801 234 5678</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">Tasty Bites Restaurant</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                    Restaurant
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">Lagos</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">3</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">₦12,500</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700">
                    Paid
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    On Transit
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>

              {/* Order 2 */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-[#5B2C6F]">#ORD-2024-002</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                   <img
                                            src={`https://i.pravatar.cc/61`}
                                            alt="rider"
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
                      <p className="text-sm text-gray-500">+234 802 345 6789</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">HealthPlus Pharmacy</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
                    Pharmacy
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">Abuja</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">2</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">₦8,750</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700">
                    Paid
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700">
                    Delivered
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}