"use client"

import { useEffect, useState } from "react"
import {
    CheckCircle2,
    Truck,
    Clock,
    Phone,
    MapPin,
    RotateCcw,
    UserCog,
    FileText,
    Bike,
    Star,
} from "lucide-react"
import { API_BASE_URL } from "@/lib/apiConfig"

import { useToast } from "@/components/ui/toast-provider"

interface Order {
    id: string
    totalAmount: string
    totalItems: number
    fullHouseAddress: string
    createdAt: string
    orderItems: OrderItem[]
    storeId: string
}

interface OrderItem {
    id: string
    name: string
    price: string
    quantity: number
}

interface Order {
  id: string;
  totalAmount: string;
  totalItems: number;
  fullHouseAddress: string;
  createdAt: string;
  orderItems: OrderItem[];
  storeId: string;
  status?: string; // ✅ add this line
  cancellationReason?: string; // optional
}


export default function OrderDetailsPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [status, setStatus] = useState("In Transit")
    const [reason, setReason] = useState("");

  const { Toast, showToast } = useToast()


  interface UpdateOrderStatusBody {
  status: string;
  cancellationReason?: string;
}


  const updateOrderStatus = async () => {
  if (!selectedOrder) {
    alert("Please select an order first.");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No token found!");
      return;
    }

    // Build the request body according to API rules
  
    const body: UpdateOrderStatusBody = { status };

    if (status === "CANCELLED") {
      if (!reason.trim()) {
        
        showToast("Please provide a reason for cancellation.");
        return;
      }
      body.cancellationReason = reason.trim();
    }

    const res = await fetch(
      `${API_BASE_URL}/api/v1/orders/update-order-status?orderId=${selectedOrder.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "cushy-access-key": `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    if (res.ok) {
         showToast(`✅ Order status updated to "${status}" successfully!`, "success");

      // Optional: Update UI without refetching all orders
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.id === selectedOrder.id ? { ...o, status } : o
        )
      );
    } else {
         showToast(`❌ Failed to update status: ${data.message || "Error"}`, "error");
    }
  } catch (err) {
    console.error("Error updating order status:", err);
       showToast(`❌ An error occurred while updating order status.`, "error");
  }
};



    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem("token")
                if (!token) return

                const res = await fetch(`${API_BASE_URL}/api/v1/orders/get-all-orders`, {
                    headers: {
                        "Content-Type": "application/json",
                        "cushy-access-key": `Bearer ${token}`,
                    },
                })

                const data = await res.json()
                if (Array.isArray(data)) {
                    setOrders(data)
                    setSelectedOrder(data[0]) // Default: first order selected
                } else {
                    console.error("Invalid response:", data)
                }
            } catch (err) {
                console.error("Error fetching orders:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [])

    if (loading) {
        return (
            <div className="p-6">
                <h2 className="text-lg font-semibold">Loading orders...</h2>
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="p-6">
                <h2 className="text-lg font-semibold">No orders found.</h2>
            </div>
        )
    }

    const actions = [
        {
            label: "Reassign Rider",
            icon: <UserCog className="w-5 h-5 text-blue-500" />,
        },
        {
            label: "Contact Customer",
            icon: <Phone className="w-5 h-5 text-green-500" />,
        },
        {
            label: "Process Refund",
            icon: <RotateCcw className="w-5 h-5 text-yellow-500" />,
        },
        {
            label: "Export Receipt",
            icon: <FileText className="w-5 h-5 text-purple-500" />,
        },
    ]

    const formatDate = (date: string) =>
        new Date(date).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })

    return (
        <div className="min-h-screen bg-gray-50 p-6 space-y-6">
            {/* ✅ ALL ORDERS LIST AT TOP */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    All Orders ({orders.length})
                </h2>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-700 border-t">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">Order ID</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Items</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Address</th>
                                <th className="px-4 py-3">Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr
                                    key={order.id}
                                    onClick={() => setSelectedOrder(order)}
                                    className={`border-b cursor-pointer hover:bg-purple-50 transition ${selectedOrder?.id === order.id ? "bg-purple-100" : ""
                                        }`}
                                >
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        #{order.id.slice(0, 8).toUpperCase()}
                                    </td>
                                    <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
                                    <td className="px-4 py-3">{order.totalItems}</td>
                                    <td className="px-4 py-3 font-semibold">
                                        ₦{Number(order.totalAmount).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 truncate max-w-[200px]">{order.fullHouseAddress}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 rounded-full text-xs text-green-700">
                                            {order.orderItems?.map((item) => (
                                                <li key={item.id}>{item.name}</li>
                                            ))}

                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ✅ SELECTED ORDER DETAILS */}
            {selectedOrder && (
                <>
                    {/* Order Summary */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Order #{selectedOrder.id.toUpperCase()}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Placed on {formatDate(selectedOrder.createdAt)}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
                                    {status}
                                </span>
                                <button className="bg-[#5B2C6F] hover:bg-[#4a2359] text-white text-sm font-medium px-4 py-2 rounded-md">
                                    Update Status
                                </button>
                            </div>
                        </div>

                        {/* Order Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Items</p>
                                <p className="font-medium text-gray-800">
                                    {selectedOrder.totalItems}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                                <p className="font-semibold text-gray-900">
                                    ₦{Number(selectedOrder.totalAmount).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Delivery Address</p>
                                <p className="font-medium text-gray-800">
                                    {selectedOrder.fullHouseAddress}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                                <p className="font-medium text-gray-800">Paid</p>
                            </div>
                        </div>
                    </div>

                    {/* Update Order Status */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <Truck className="w-4 h-4 text-[#5B2C6F]" />
                            Update Order
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Order Progress */}
                            <div className="space-y-5">
                                {[
                                    { label: "Order Placed", time: "Oct 21, 2:45 PM", done: true },
                                    { label: "Vendor Accepted", time: "Oct 21, 2:48 PM", done: true },
                                    { label: "Preparing Order", time: "Oct 21, 2:50 PM", done: true },
                                    {
                                        label: "In Transit",
                                        time: "Oct 21, 3:15 PM – Current",
                                        done: true,
                                        highlight: true,
                                    },
                                    { label: "Delivered", time: "Pending", done: false },
                                ].map((step, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        {step.done ? (
                                            <CheckCircle2
                                                className={`w-5 h-5 flex-shrink-0 ${step.highlight ? "text-[#5B2C6F]" : "text-green-500"
                                                    }`}
                                            />
                                        ) : (
                                            <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        )}
                                        <div>
                                            <p
                                                className={`text-sm font-medium ${step.done ? "text-gray-800" : "text-gray-400"
                                                    }`}
                                            >
                                                {step.label}
                                            </p>
                                            <p className="text-xs text-gray-500">{step.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                         {/* Change Status Form */}
<div className="space-y-4">
  {/* Status Dropdown */}
  <div>
    <label className="text-sm font-medium text-gray-700">New Status</label>
    <select
      value={status}
      onChange={(e) => setStatus(e.target.value)}
      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#5B2C6F] focus:border-[#5B2C6F]"
    >
      <option value="PENDING">Pending</option>
      <option value="PICKED_UP">Picked Up</option>
      <option value="DELIVERED">Delivered</option>
      <option value="CANCELLED">Cancelled</option>
    </select>
  </div>

  {/* Reason/Notes - only show if CANCELLED */}
  {status === "CANCELLED" && (
    <div>
      <label className="text-sm font-medium text-gray-700">Reason/Notes</label>
      <textarea
        placeholder="Add reason for cancellation..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#5B2C6F] focus:border-[#5B2C6F]"
      ></textarea>
    </div>
  )}

  {/* Buttons */}
  <div className="flex gap-3 pt-2">
    <button
      onClick={updateOrderStatus}
      disabled={status === "CANCELLED" && reason.trim() === ""}
      className={`bg-[#5B2C6F] hover:bg-[#4a2359] text-white w-full py-2 rounded-md text-sm font-medium ${
        status === "CANCELLED" && reason.trim() === "" ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      Update Status
    </button>
    <button className="border border-gray-300 w-full py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50">
      Cancel
    </button>
  </div>
</div>

                {/* 👇 ADD THIS */}
                {Toast}

                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            ⚡ Quick Actions
                        </h3>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {actions.map((action, i) => (
                                <button
                                    key={i}
                                    className="flex flex-col items-center justify-center border border-gray-200 rounded-lg py-6 px-4 text-sm font-medium text-gray-700 hover:shadow-md transition gap-3 bg-white"
                                >
                                    {action.icon}
                                    <span>{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Bike className="w-4 h-4 text-[#5B2C6F]" /> Delivery Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Rider Info */}
                            <div>
                                <div className="font-semibold mb-2 text-gray-700">🚴‍♂️ Rider</div>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="font-semibold text-gray-900">Ahmed Hassan</p>
                                        <p className="text-xs text-gray-500">Rider ID: RDR 001</p>
                                    </div>
                                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                        ● Online
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-y-2 text-sm text-gray-700">
                                    <p className="text-gray-500">Phone:</p>
                                    <p className="col-span-2 font-medium flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-500" /> +234 803 123 4567
                                    </p>
                                    <p className="text-gray-500">Rating:</p>
                                    <p className="col-span-2 font-medium flex items-center gap-1">
                                        4.8
                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    </p>
                                    <p className="text-gray-500">ETA:</p>
                                    <p className="col-span-2 font-medium text-[#5B2C6F]">12 mins</p>
                                </div>
                            </div>

                            {/* Delivery Address */}
                            <div>
                                <div className="bg-gray-50 border border-gray-200 rounded-md p-4 space-y-2">
                                    <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
                                    <p className="text-sm text-gray-700 leading-snug">
                                        {selectedOrder.fullHouseAddress}
                                    </p>
                                    <p className="text-sm flex items-center gap-2 text-gray-700">
                                        <Phone className="w-4 h-4 text-gray-500" /> +234 801 234 5678
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 mt-3">
                                    <button className="flex-1 bg-[#5B2C6F] hover:bg-[#4A245A] text-white text-sm font-medium py-2 rounded-md flex items-center justify-center gap-2 transition">
                                        <MapPin className="w-4 h-4" /> View on Map
                                    </button>
                                    <button className="flex-1 border border-gray-300 text-sm font-medium text-gray-700 py-2 rounded-md hover:bg-purple-50 transition">
                                        Change Rider
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
