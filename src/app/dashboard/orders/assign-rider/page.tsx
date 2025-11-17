"use client"

import {
    MapPin,
    Star,
    ArrowLeft,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { API_BASE_URL } from "@/lib/apiConfig"
import { useToast } from "@/components/ui/toast-provider"

interface Order {
    id: string;
    totalAmount: string;
    charges: string;
    status: string;
    itemName: string;
    itemPrice: string;
    itemQty: number;
    fullAddress: string;
    phone: string;
}

interface ApiOrder {
    id: string;
    orderItems: {
        name: string;
        price: string;
        quantity: number;
    }[];
    orderTracking: {
        orderStatus: string;
        createdAt: string;
    }[];
    totalAmount: string;
    Charges: string;
    fullHouseAddress: string;
    additionalPhoneNumber: string;
}


export default function AssignRiderPage() {

    const [riders, setRiders] = useState<Rider[]>([]);
    const { Toast, showToast } = useToast()

    const [openOrderId, setOpenOrderId] = useState<string | null>(null);

    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([])





    const [authChecked] = useState(false) // ✅ wait until token check completes


    type Rider = {
        id: number
        name: string
        first_name: string
        last_name: string
        phone: string
        email: string
        status: string // active, inactive, etc.
        vehicle_type: string | null
        vehicle_id: string
        photo_url: string | null
        latitude: number | null
        longitude: number | null
        last_active: string | null
        company_id: number
        created_at: string
        updated_at: string
        assigned_zones: []

        // ✅ UI-only fields (not from backend)
        online?: boolean
        available?: boolean
        rating?: number
        reviews?: number
        success?: number
        distance?: string
        eta?: string
    }


    useEffect(() => {
        async function fetchOrders() {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const res = await fetch(`${API_BASE_URL}/api/v1/orders/get-all-orders`, {
                    headers: {
                        "Content-Type": "application/json",
                        "cushy-access-key": `Bearer ${token}`,
                    },
                });

                const data = await res.json();

                if (Array.isArray(data) && data.length > 0) {
                    const orderData: Order[] = data.map((order: ApiOrder) => {
                        const firstItem = order.orderItems?.[0];

                        // ✅ GET LAST TRACKING STATUS
                        const tracking = order.orderTracking || [];
                        const latestTracking = tracking[tracking.length - 1];

                        return {
                            id: order.id,
                            totalAmount: order.totalAmount,
                            charges: order.Charges,
                            status: latestTracking?.orderStatus || "UNKNOWN",
                            itemName: firstItem?.name || "No item",
                            itemPrice: firstItem?.price || "0",
                            itemQty: firstItem?.quantity || 0,
                            fullAddress: order.fullHouseAddress || "N/A",
                            phone: order.additionalPhoneNumber || "N/A",
                        };
                    });

                    setOrders(orderData);
                }
                else {
                    console.error("Unexpected API response:", data);
                }
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            }
        }

        fetchOrders();
    }, []);






    // ✅ Fetch riders from API
    useEffect(() => {
        async function fetchRiders() {
            try {
                const token = localStorage.getItem("token")
                if (!token) return

                const res = await fetch(`${API_BASE_URL}/api/v1/admin/get-all-riders`, {
                    headers: {
                        "Content-Type": "application/json",
                        "cushy-access-key": `Bearer ${token}`,
                    },
                })

                const data = await res.json()
                if (!data.error && data.data && data.data.drivers) {
                    const updatedRiders = data.data.drivers.map((rider: Rider) => ({
                        ...rider,
                        online: rider.status === "active",   // ✅ mark online if status is active
                        available: rider.status === "active" // ✅ mark available too
                    }))
                    setRiders(updatedRiders)
                } else {
                    console.error("Unexpected API response:", data)
                }
            } catch (error) {
                console.error("Failed to fetch riders:", error)
            }
        }

        fetchRiders()
    }, [authChecked])






    return (
        <div className="min-h-screen bg-gray-50 p-6 space-y-6">
            {/* Header */}
            {/* Header */}
            <div className="flex items-center justify-between py-3 px-1">
                {/* Left Section */}
                <div className="flex items-center gap-2">
                    {/* Back button */}
                    <button className="flex items-center gap-2 text-[#031B4E] hover:text-[#5B2C6F] transition">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-[#031B4E] hover:text-[#5B2C6F] transition cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-base font-semibold">Assign Rider</span>
                        </button>

                    </button>

                    {/* Status Badge */}
                    <span
                        className="
    bg-[#FF9053] text-white font-semibold rounded-full
    inline-flex items-center justify-center
    min-w-max
    text-[11px] px-3 py-[3px]
    sm:text-sm sm:px-4 sm:py-1.5
  "
                    >
                        Pending Assignment
                    </span>


                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">



                </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel - Order Details */}
                <div className="space-y-4">
                    {orders.length > 0 ? (
                        orders.map((order) => {
                            const isOpen = openOrderId === order.id;

                            return (
                                <div key={order.id} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                    {/* Header */}
                                    <button
                                        className="w-full bg-white flex justify-between items-center px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                                        onClick={() => setOpenOrderId(isOpen ? null : order.id)}
                                    >

                                        <span>{order.itemName} (x{order.itemQty})</span>
                                        <span className="font-semibold text-gray-900">₦{order.totalAmount}</span>
                                    </button>

                                    {/* Collapsible content */}
                                    {isOpen && (
                                        <div className="bg-gray-50 p-5 space-y-3 text-sm text-gray-700">
                                            <div className="flex justify-between">
                                                <span>Customer:</span>

                                                <span>{order.itemName} (x{order.itemQty})</span>
                                            </div>


                                            <div className="flex justify-between">
                                                <span>Total Amount:</span>
                                                <span className="font-semibold text-gray-900">₦{order.totalAmount}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Phone Number:</span>
                                                <span className=" text-yellow-700 font-bold  text-xs px-2 py-[2px] rounded-full">{order.phone}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span>Order Status:</span>

                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${(() => {
                                                        const status = order.status; // payment status

                                                        if (status === "DELIVERED" || status === "PICKED_UP") return "bg-green-50 text-green-700";
                                                        if (status === "PENDING") return "bg-yellow-50 text-yellow-700";
                                                        if (status === "CANCELLED") return "bg-red-50 text-red-700";

                                                        return "bg-gray-50 text-gray-500";
                                                    })()}`}

                                                >
                                                    {order.status?.replace("_", " ")}
                                                </span>
                                            </div>

                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p>No orders available</p>
                    )}


                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Delivery Address</h3>

                        <div className="space-y-4 text-sm">

                            {/* Pickup */}
                            <div>
                                <div className="flex items-center gap-2 font-medium text-gray-700">
                                    <MapPin className="w-4 h-4 text-purple-600" />
                                    <span>Pickup Location</span>
                                </div>

                                <div className="text-gray-600 ml-6 mt-1 leading-5">
                                    Tasty Bites Restaurant <br />
                                    12 Allen Avenue, Ikeja, Lagos
                                </div>
                            </div>

                            {/* Delivery */}
                            <div>
                                <div className="flex items-center gap-2 font-medium text-gray-700">
                                    <MapPin className="w-4 h-4 text-green-600" />
                                    <span>Delivery Location</span>
                                </div>

                                <div className="text-gray-600 ml-6 mt-1 leading-5">
                                    John Doe <br />
                                    45 Victoria Island, Lagos <br />
                                    +234 801 234 5678
                                </div>
                            </div>

                            {/* Distance & Time */}
                            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 ml-6 text-gray-700 text-sm space-y-1">
                                <p>
                                    <span className="font-medium">Estimated Distance:</span> 8.5 km
                                </p>
                                <p>
                                    <span className="font-medium">Estimated Time:</span> 25–30 mins
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
                {/* Right Panel - Riders */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm p-5">
                    <div className="space-y-3">
                        {riders.map((rider, i) => (
                            <div
                                key={i}
                                className="flex flex-col sm:flex-row items-center justify-between border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                            >
                                {/* LEFT: Avatar + Name + Ratings */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-sm font-medium text-gray-600">
                                            {rider.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{rider.name}</p>
                                        <p className="text-xs text-gray-500">ID: {rider.id}</p>
                                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                                            <Star className="w-3 h-3 text-yellow-500" />
                                            {rider.rating} ({rider.reviews} reviews) • {rider.success}% success rate
                                        </div>
                                    </div>
                                </div>

                                {/* MIDDLE: Badges + Location + ETA */}
                                <div className="flex flex-col items-center justify-center mt-3 sm:mt-0 text-xs text-gray-600">
                                    <div className="flex items-center gap-2">
                                        {rider.online ? (
                                            <span className="bg-green-100 text-green-800 text-[11px] px-2 py-[2px] rounded-full">
                                                Online
                                            </span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-700 text-[11px] px-2 py-[2px] rounded-full">
                                                Inactive
                                            </span>
                                        )}

                                        {rider.available ? (
                                            <span className="bg-blue-100 text-blue-800 text-[11px] px-2 py-[2px] rounded-full">
                                                Available
                                            </span>
                                        ) : (
                                            <span className="bg-yellow-100 text-yellow-800 text-[11px] px-2 py-[2px] rounded-full">
                                                Busy
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1">📍 {rider.distance || "N/A"}</p>
                                    <p>⏱ ETA: {rider.eta || "N/A"}</p>
                                </div>

                                {/* RIGHT: Assign Button */}
                                <div className="mt-3 sm:mt-0">
                                    {rider.available ? (
                                        <Button
                                            className="bg-[#5B2C6F] hover:bg-[#4a2359] text-white text-xs px-4 py-1.5"
                                            disabled={!openOrderId} // disable if no order selected
                                            onClick={async () => {
                                                if (!openOrderId) return;

                                                // ✅ get token from localStorage
                                                const token = localStorage.getItem("token");
                                                if (!token) return alert("No token found. Please login.");

                                                try {
                                                    const response = await fetch(
                                                        `${API_BASE_URL}/api/v1/admin/assign-ride-to-order?orderId=${openOrderId}&riderId=${rider.id}`,
                                                        {
                                                            method: "POST",
                                                            headers: {
                                                                "Content-Type": "application/json",
                                                                "cushy-access-key": `Bearer ${token}`,
                                                            },
                                                        }
                                                    );

                                                    if (!response.ok) {
                                                        const errorData = await response.json();
                                                        showToast(errorData.message || "Failed to assign rider", "error");
                                                        throw new Error(errorData.message || "Failed to assign rider");
                                                    }

                                                    showToast(`Order ${openOrderId} assigned to rider ${rider.name} successfully!`, "success");

                                                    setRiders((prev) =>
                                                        prev.map((r) => (r.id === rider.id ? { ...r, available: false } : r))
                                                    );

                                                } catch (error) {
                                                    if (error instanceof Error) {
                                                        showToast("Error assigning rider: " + error.message, "error");
                                                    } else {
                                                        showToast("An unknown error occurred while assigning the rider.", "error");
                                                    }
                                                }


                                            }}
                                        >
                                            Assign
                                        </Button>

                                    ) : (
                                        <Button
                                            variant="outline"
                                            className="border-gray-300 text-gray-700 text-xs px-4 py-1.5"
                                        >
                                            Queue
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {Toast}

            </div>





        </div>
    )
}
