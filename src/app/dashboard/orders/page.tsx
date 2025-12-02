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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

import { useRouter } from "next/navigation"
import { API_BASE_URL } from "@/lib/apiConfig"



/* --------------------------------------------------------------------------
   ✅ INTERFACES (Moved outside component)
---------------------------------------------------------------------------*/

export interface OrderItem {
  id: string
  name: string
  price: string
  quantity: number
  storeId: string
  isAvailable: boolean
}


interface Store {
  id: string;
  name: string;
  mobile: string;
  // add other fields as n
  // eeded
}

interface User{
  firstName:string;
  lastName:string;
}

interface dropOffLocation {
  address: string;
}

interface pickUpLocation {
  address: string;
}


export interface OrderTracking {
  id: string
  orderStatus: string
  description?: string | null
  createdAt: string
  updatedAt: string
}

export interface Order {

  id: string
  type: string
  storeId: string
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
  orderTracking: OrderTracking[]

  store: Store | null   // FIXED HERE
  dropOffLocation: dropOffLocation | null
  pickUpLocation: pickUpLocation | null
  user: User | null

  storeName: string | null
 storeMobile?: string | null
  dropOffLo?: string | null

  pickUpLo?: string | null

  firstName?: string | null
  lastName?: string | null



}



/* --------------------------------------------------------------------------
   ✅ MAIN COMPONENT
---------------------------------------------------------------------------*/

export default function OrdersPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [pendingOrders, setPendingOrders] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const [totalOrdersToday, setTotalOrdersToday] = useState<number | null>(null)
  const [totalOrdersYesterday, setTotalOrdersYesterday] = useState<number | null>(null)
  const [percentageChange, setPercentageChange] = useState<number | null>(null)


  /* ----------------------------------------------------------------------
     🔐 CHECK AUTH TOKEN
  -----------------------------------------------------------------------*/
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) router.push("/auth/signin")
  }, [router])





  useEffect(() => {
    const fetchDailyOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // 1️⃣ Fetch all orders
        const res = await fetch(`${API_BASE_URL}/api/v1/orders/get-all-orders`, {
          headers: {
            "Content-Type": "application/json",
            "cushy-access-key": `Bearer ${token}`,
          },
        });

        const orders: Order[] = await res.json();

        if (!res.ok || !Array.isArray(orders)) {
          console.error("Invalid order data:", orders);
          return;
        }

        // 2️⃣ Sort by createdAt
        const sortedOrders = orders.sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        // 3️⃣ Extract unique store IDs
        const uniqueStoreIds = [...new Set(sortedOrders.map(o => o.storeId))];

        // 4️⃣ Fetch store names for each storeId ONLY ONCE

        const storeMap: Record<
          string,
          { storeName: string | null; dropOffAddress: string | null; pickUpAddress: string | null; user: User | null; firstName:string | null; lastName:string | null; storeMobile?: string | null }
        > = {};






        await Promise.all(
          uniqueStoreIds.map(async (id) => {
            if (!id) return;
            const result = await fetchStoreName(id, token); // returns 3 values
            storeMap[id] = result;
          })
        );


        // 5️⃣ Attach storeName to each order
        const processedOrders = sortedOrders.map(order => ({
          ...order,
          storeName: storeMap[order.storeId]?.storeName ?? null,
          dropOffLo: storeMap[order.storeId]?.dropOffAddress ?? null,
          pickUpLo: storeMap[order.storeId]?.pickUpAddress ?? null,
          user: storeMap[order.storeId]?.user ?? null,
          firstName: storeMap[order.storeId]?.firstName ?? null,  
          
  storeMobile: storeMap[order.storeId]?.storeMobile ?? null, // <--- add this
          lastName: storeMap[order.storeId]?.lastName ?? null,
        }));


        setOrders(processedOrders);


        // 6️⃣ Daily analytics
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yDay = yesterday.toISOString().split("T")[0];

        const todayOrders = processedOrders.filter(o => o.createdAt.startsWith(today));
        const yesterdayOrders = processedOrders.filter(o => o.createdAt.startsWith(yDay));

        setTotalOrdersToday(todayOrders.length);
        setTotalOrdersYesterday(yesterdayOrders.length);

        if (yesterdayOrders.length > 0) {
          const percent = ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100;
          setPercentageChange(percent);
        }

      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    fetchDailyOrders();
  }, []);






const fetchStoreName = async (
  storeId: string,
  token: string
): Promise<{
  storeName: string | null;
  dropOffAddress: string | null;
  pickUpAddress: string | null;
  storeMobile?: string | null;
  user: User | null;
  firstName: string | null;
  lastName: string | null;
}> => {
  if (!storeId || storeId === "null") {
    return {
      storeName: null,
      dropOffAddress: null,
      pickUpAddress: null,
      user: null,
      firstName: null,
      lastName: null,
    };
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/orders/get-orders-by-storeId/${storeId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "cushy-access-key": `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    const order = data?.data?.orders?.[0]?.[0];

    return {
      storeName: order?.store?.name ?? null,
      dropOffAddress: order?.dropOffLocation?.address ?? null,

  storeMobile: order?.store?.mobile ?? null, // <--- add this
      pickUpAddress: order?.pickUpLocation?.address ?? null,
      user: order?.user ? { firstName: order.user.firstName, lastName: order.user.lastName } : null,
      firstName: order?.userDetails?.firstName ?? null,
      lastName: order?.userDetails?.lastName ?? null,
    };
  } catch (err) {
    console.error("Error fetching store:", err);

    return {
      storeName: null,
      dropOffAddress: null,
      pickUpAddress: null,
      user: null,
      firstName: null,
      lastName: null,
    };
  }
};







  /* ----------------------------------------------------------------------
     ⏳ FETCH PENDING ORDERS COUNT
  -----------------------------------------------------------------------*/
  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const res = await fetch(
          `${API_BASE_URL}/api/v1/orders?filter[status]=PENDING`,
          {
            headers: {
              "Content-Type": "application/json",
              "cushy-access-key": `Bearer ${token}`,
            },
          }
        )

        const data = await res.json()

        if (res.ok && data?.pagination) {
          setPendingOrders(data.pagination.totalItems)
        } else {
          setError("Unexpected server response")
        }
      } catch (err) {
        setError("Failed to fetch pending orders")
      } finally {
        setLoading(false)
      }
    }

    fetchPendingOrders()
  }, [])



  /* ----------------------------------------------------------------------
     🔍 SEARCH + PAGINATION
  -----------------------------------------------------------------------*/
  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const reversedOrders = [...filteredOrders].reverse()

  const itemsPerPage = 10
  const totalPages = Math.ceil(reversedOrders.length / itemsPerPage)

  const paginatedOrders = reversedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )



  /* ----------------------------------------------------------------------
     🔎 OPEN & CLOSE MODAL
  -----------------------------------------------------------------------*/
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedOrder(null)
  }



  /* ----------------------------------------------------------------------
     🎨 JSX RETURN
  -----------------------------------------------------------------------*/

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 pb-10">

      {/* ---------------------- METRIC CARDS ---------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Total Orders Today */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Orders (Today)</p>
              <h3 className="text-3xl font-bold mb-2">
                {totalOrdersToday ?? "..."}
              </h3>
              <p className="text-sm text-teal-600">
                {percentageChange !== null && totalOrdersYesterday !== null ? (
                  <>
                    {percentageChange >= 0 ? "+" : ""}
                    {percentageChange.toFixed(1)}% from yesterday
                  </>
                ) : (
                  totalOrdersYesterday === 0
                    ? "No orders yesterday"
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
                {error ?? (pendingOrders === 0 ? "No pending orders" : "Requires attention")}
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
              <h3 className="text-3xl font-bold mb-2">0</h3>
              <p className="text-sm text-teal-600">0% completion rate</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-teal-500" />
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Revenue Today</p>
              <h3 className="text-3xl font-bold mb-2">₦0K</h3>
              <p className="text-sm text-teal-600">+0% from yesterday</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>


      {/* ---------------------- FILTERS ---------------------- */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">

          {/* Business Type */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Business Type</label>
            <Select defaultValue="all-types">
              <SelectTrigger>
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
            <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
            <Select defaultValue="all-status">
              <SelectTrigger>
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
            <label className="text-sm font-medium text-gray-700 mb-2 block">City</label>
            <Select defaultValue="all-cities">
              <SelectTrigger>
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
            <label className="text-sm font-medium text-gray-700 mb-2 block">Date From</label>
            <Input type="date" />
          </div>

          {/* Date Range To */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Date To</label>
            <Input type="date" />
          </div>
        </div>


        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button className="bg-[#5B2C6F] text-white hover:bg-[#4a2359]">
            <Filter className="w-4 h-4 mr-2" /> Apply Filters
          </Button>

          <Button variant="outline">
            <FileDown className="w-4 h-4 mr-2 text-[#5B2C6F]" />
            Export CSV
          </Button>

          <Button variant="outline" onClick={() => router.push("/dashboard/orders/update-orders")}>
            <RefreshCcw className="w-4 h-4 mr-2 text-[#5B2C6F]" />
            Update Orders
          </Button>

          <Button variant="outline" onClick={() => router.push("/dashboard/orders/assign-rider")}>
            <UserCheck className="w-4 h-4 mr-2 text-[#5B2C6F]" />
            Assign Rider
          </Button>
        </div>
      </div>


      {/* ---------------------- ORDERS TABLE ---------------------- */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between gap-4">
          <h2 className="text-xl font-bold">Recent Orders</h2>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="ghost" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-gray-50 border-b">
              <tr>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">StoreName</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store Number</th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"># Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    Loading recent orders...
                  </td>
                </tr>
              ) :

                paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-500">
                      No recent orders found
                    </td>
                  </tr>
                ) : (


                  paginatedOrders.map(order => {
                    // Get the latest tracking based on createdAt
                    const latestTracking =
                      order.orderTracking?.reduce((latest, current) => {
                        return new Date(current.createdAt) > new Date(latest.createdAt)
                          ? current
                          : latest;
                      }, order.orderTracking[0]) || null;

                    const latestStatus = latestTracking?.orderStatus || "UNKNOWN";


                    const statusColor =
                      latestStatus === "DELIVERED" || latestStatus === "PICKED_UP" || latestStatus === "ACKNOWLEDGED"
                        ? "bg-green-50 text-green-700"
                        : latestStatus === "PENDING"
                          ? "bg-yellow-50 text-yellow-700"
                          : latestStatus === "CANCELLED" || latestStatus === "REJECTED"
                            ? "bg-red-50 text-red-700"
                            : "bg-gray-100 text-gray-600";

                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {order.storeName || "--"}
                        </td>



<td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">

                          {order.orderItems?.map(i => i.name).join(", ") || "--"}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">

                          {order.storeMobile || "--"}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-500">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString() : "--"}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-500">
                          {order.additionalPhoneNumber || "--"}
                        </td>

                        <td className="px-6 py-4 text-sm">{order.totalItems}</td>

                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-50 text-green-700">
                            ₦{Number(order.totalAmount).toLocaleString()}
                          </span>
                        </td>

                        

                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
                            {latestStatus.replace("_", " ")}
                          </span>
                        </td>


                        
<td className="py-3">
  <div className="flex items-center gap-3">
 

    <div className="flex flex-col leading-tight">
      <span className="font-medium text-gray-900">
        {order.user?.firstName} {order.user?.lastName}
      </span>
     
    </div>
  </div>
</td>


                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewDetails(order)}>
                              <Eye className="w-4 h-4" />
                            </Button>

                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>

                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
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

                         {/* Adresses */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-md border">
                      <h3 className="font-semibold text-gray-800 mb-2">Address</h3>
                      <p><span className="font-semibold">Drop Of Location:</span> {selectedOrder.dropOffLo || "—"}</p>
                      <p><span className="font-semibold">Pick Of Location:</span> {selectedOrder.pickUpLo || "—"}</p>
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
          {/* ---------------------- PAGINATION ---------------------- */}
          {totalPages > 1 && (
            <div className="flex justify-end items-center space-x-2 mt-4">
              {/* Previous Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    size="sm"
                    variant={page === currentPage ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              {/* Next Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}

        </div>
      </div>


      {/* ------------------------------------------------------------------
         🔍 ORDER DETAILS MODAL (ADD YOUR EXISTING MODAL CODE HERE)
      -------------------------------------------------------------------*/}

      {isModalOpen && selectedOrder && (
        <div>
          {/* your modal code */}
        </div>
      )}
    </div>
  )
}
