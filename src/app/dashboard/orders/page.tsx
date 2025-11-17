"use client"

import { useEffect, useState } from "react"
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  TrendingUp,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Edit,
  MoreVertical,
  FileDown,
  RefreshCcw,
  UserCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { API_BASE_URL } from "@/lib/apiConfig";


import { useRouter } from "next/navigation"

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [pendingOrders, setPendingOrders] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)


  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [totalOrdersToday, setTotalOrdersToday] = useState<number | null>(null)

  const [totalOrdersYesterday, setTotalOrdersYesterday] = useState<number | null>(null)
  const [percentageChange, setPercentageChange] = useState<number | null>(null)


  interface OrderItem {
    id: string
    name: string
    price: string
    quantity: number
    storeId: string
    isAvailable: boolean
  }

  interface Order {
    id: string
    type: string
    totalItems: number
    totalAmount: string
    fullHouseAddress: string
    additionalPhoneNumber: string
    noteForVendor: string
    noteForStore: string
    createdAt: string
    totalAmountBeforeCharges: number
    Charges: number
    orderItems: OrderItem[] | null

    orderTracking: OrderTracking[];   // ← added
  }

  interface OrderTracking {
    id: string;
    orderStatus: string;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };


  const closeModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };


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
          setOrders(data)

          // ✅ Get today and yesterday
          const today = new Date().toISOString().split("T")[0]
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayDate = yesterday.toISOString().split("T")[0]

          // ✅ Filter orders
          const todayOrders = data.filter(order =>
            order.createdAt.startsWith(today)
          )
          const yesterdayOrders = data.filter(order =>
            order.createdAt.startsWith(yesterdayDate)
          )

          // ✅ Extract item names for logging or display
          data.forEach((order: Order) => {
            const itemNames = order.orderItems?.map((item: OrderItem) => item.name) || []
            console.log(`🛒 Order ${order.id} has items:`, itemNames.join(", "))
          })


          // ✅ Count totals
          const todayCount = todayOrders.length
          const yesterdayCount = yesterdayOrders.length

          setTotalOrdersToday(todayCount)
          setTotalOrdersYesterday(yesterdayCount)

          // ✅ Calculate % change safely
          if (yesterdayCount > 0) {
            const percent = ((todayCount - yesterdayCount) / yesterdayCount) * 100
            setPercentageChange(percent)
          } else {
            setPercentageChange(null)
          }
        } else {
          console.error("Unexpected orders response:", data)
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

  // ✅ Filter orders by search query
  const filteredOrders = orders.filter((order) =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  )




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
            onClick={() => router.push("/dashboard/orders/assign-riders")}
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
            <UserCheck className="w-4 h-4 mr-2 text-[#5B2C6F]" />
            Assign Rider
          </Button>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Recent Orders</h2>
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

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name of items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Num of items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>


                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-6 text-gray-500">
                    Loading recent orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-6 text-gray-500">
                    No recent orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.fullHouseAddress} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.orderItems?.map(item => item.name).join(", ")}
                    </td>
                    <td className="px-6 py-4">
                      <div>

                        <p className="text-sm text-gray-500">
                          {order.additionalPhoneNumber || "--"}
                        </p>
                      </div>
                    </td>


                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.totalItems}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-50 text-green-700">
                        ₦{Number(order.totalAmount).toLocaleString()}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {order.orderTracking && order.orderTracking.length > 0 ? (
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${(() => {
                              const status = order.orderTracking[order.orderTracking.length - 1].orderStatus;
                              if (status === "DELIVERED" || status === "PICKED_UP") return "bg-green-50 text-green-700";
                              if (status === "PENDING") return "bg-yellow-50 text-yellow-700";
                              if (status === "CANCELLED") return "bg-red-50 text-red-700";
                              return "bg-gray-50 text-gray-500";
                            })()
                            }`}
                        >
                          {order.orderTracking[order.orderTracking.length - 1].orderStatus.replace("_", " ")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-50 text-gray-500">
                          No status
                        </span>
                      )}
                    </td>




                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(order)}
                        >
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
                ))
              )}
              {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 md:p-8 animate-fadeIn">

                    {/* Header */}
                    <div className="flex justify-between items-center border-b pb-3 mb-4">
                      <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                      <button
                        className="text-gray-400 hover:text-gray-700 transition"
                        onClick={closeModal}
                      >
                        ✕
                      </button>
                    </div>

                    {/* General Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                      <div>
                        <p><span className="font-semibold">Order ID:</span> {selectedOrder.id}</p>
                        <p><span className="font-semibold">Total Items:</span> {selectedOrder.totalItems}</p>
                        <p><span className="font-semibold">Total Amount:</span> <span className="text-green-600 font-bold">₦{Number(selectedOrder.totalAmount).toLocaleString()}</span></p>
                      </div>
                      <div>
                        <p><span className="font-semibold">Address:</span> {selectedOrder.fullHouseAddress}</p>
                        <p><span className="font-semibold">Phone:</span> {selectedOrder.additionalPhoneNumber}</p>
                        <p><span className="font-semibold">Created At:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-md border">
                      <h3 className="font-semibold text-gray-800 mb-2">Notes</h3>
                      <p><span className="font-semibold">Note for Vendor:</span> {selectedOrder.noteForVendor || "—"}</p>
                      <p><span className="font-semibold">Note for Store:</span> {selectedOrder.noteForStore || "—"}</p>
                    </div>

                    {/* Items */}
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-800 mb-2">Items</h3>
                      <ul className="divide-y divide-gray-200 border rounded-md overflow-hidden">
                        {selectedOrder.orderItems?.map((item) => (
                          <li
                            key={item.id}
                            className="flex justify-between p-3 hover:bg-gray-50 transition"
                          >
                            <span>{item.name} x {item.quantity}</span>
                            <span className="font-semibold text-gray-800">₦{Number(item.price).toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Charges */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-md border">


                      <p><span className="font-semibold">Amount Amount:</span>     ₦{Number(selectedOrder.totalAmount).toLocaleString()}</p>
                      <p><span className="font-semibold">Amount Before Charges:</span> ₦{Number(selectedOrder.totalAmountBeforeCharges).toLocaleString()}</p>
                      <p><span className="font-semibold"> Charges:</span> ₦{Number(selectedOrder.Charges).toLocaleString()}</p>
                    </div>

                    {/* Tracking */}
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-800 mb-2">Tracking</h3>
                      <ul className="space-y-2">
                        {selectedOrder.orderTracking?.map((track) => (
                          <li
                            key={track.id}
                            className="flex justify-between items-center p-2 border rounded-md"
                          >
                            <span className={`px-2 py-1 rounded text-sm font-medium 
                ${track.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                                track.orderStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                  track.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'}`}>
                              {track.orderStatus}
                            </span>
                            <span className="text-gray-500 text-sm">{new Date(track.createdAt).toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Close Button */}
                    <div className="mt-6 text-right">
                      <button
                        onClick={closeModal}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                      >
                        Close
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}