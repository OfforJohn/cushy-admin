"use client";

import { useEffect, useState } from "react";
import {
    UserCog,
} from "lucide-react";

import { API_BASE_URL } from "@/lib/apiConfig";
import { useToast } from "@/components/ui/toast-provider";

// ------------------ Interfaces ------------------
interface OrderItem {
    id: string;
    name: string;
    price: string;
    quantity: number;
}

interface OrderTracking {
    id: string;
    orderStatus: string;
    description: string;
    createdAt: string;
}

interface Order {
    id: string;
    totalAmount: string;
    totalItems: number;
    fullHouseAddress: string;
    createdAt: string;
    orderItems: OrderItem[];
    storeId: string;
    status?: string;
    cancellationReason?: string;
    orderTracking?: OrderTracking[];
}

interface UpdateOrderStatusBody {
    status: string;
    cancellationReason?: string;
}

// ------------------------------------------------

export default function OrderDetailsPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const [loading, setLoading] = useState(true);

    const { Toast, showToast } = useToast();

    const [status, setStatus] = useState("");
    const [reason, setReason] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [showStatusModal, setShowStatusModal] = useState(false);


    // When opening the modal:
    const openStatusModal = (order: Order) => {
        setSelectedOrder(order);
        setStatus(order.status || "PENDING"); // <-- sync state with order
        setReason(order.cancellationReason || "");
        setShowStatusModal(true);
    };



    // ---------------- Update Order Status ----------------
    const updateOrderStatus = async () => {
        if (!selectedOrder) return;

        if (status === "CANCELLED" && reason.trim() === "") {
            showToast("Please provide a reason for cancellation.", "error");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            showToast("No token found!", "error");
            return;
        }

        // Show immediate toast
        showToast(`Updating order status...`);

        const body: UpdateOrderStatusBody = { status };
        if (status === "CANCELLED") body.cancellationReason = reason.trim();

        try {
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
                // Update orders optimistically
                setOrders((prev) =>
                    prev.map((o) => (o.id === selectedOrder.id ? { ...o, status } : o))
                );
                setShowStatusModal(false);

                showToast(`Order updated to "${status}"`, "success"); // Success toast
            } else {
                showToast(data.message || "Failed to update", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Error updating order", "error");
        }
    };


    // ---------------- Fetch Orders ----------------
    useEffect(() => {
        const fetchOrders = async () => {
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

                if (Array.isArray(data)) {
                    // Sort by createdAt DESC → latest orders first
                    const sortedOrders = data.sort(
                        (a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );

                    setOrders(sortedOrders);
                    setSelectedOrder(null); // remove default selection
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);



    if (loading) {
        return (
            <div className="p-6">
                <h2 className="text-lg font-semibold">Loading orders...</h2>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="p-6">
                <h2 className="text-lg font-semibold">No orders found.</h2>
            </div>
        );
    }

    const totalPages = Math.ceil(orders.length / itemsPerPage);
    const paginatedOrders = orders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const formatDate = (date: string) =>
        new Date(date).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
        });

    const StatusBadge = ({ status }: { status?: string }) => {
        const base = "px-3 py-1 rounded-full text-xs font-semibold inline-block";

        switch (status) {
            case "PENDING":
                return <span className={`${base} bg-yellow-100 text-yellow-700`}>Pending</span>;
            case "CANCELLED":
                return <span className={`${base} bg-red-100 text-red-700`}>Cancelled</span>;
            case "DELIVERED":
                return <span className={`${base} bg-green-100 text-green-700`}>Delivered</span>;
            case "PICKED_UP":
                return <span className={`${base} bg-green-100 text-green-700`}>Picked Up</span>;
            default:
                return <span className={`${base} bg-gray-100 text-gray-600`}>Unknown</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 space-y-6">

            {/* ------------------ ORDERS TABLE ------------------ */}
            <div className="bg-white border rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">
                    Update Orders ({orders.length})
                </h2>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-700 border-t">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">Order ID</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Items</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>

                        <tbody> {paginatedOrders.map((order) => {
                            // Find latest tracking by createdAt
                            const latestTracking = order.orderTracking?.reduce((latest, current) => {
                                return new Date(current.createdAt) > new Date(latest.createdAt)
                                    ? current
                                    : latest;
                            }, order.orderTracking[0]);

                            const latestStatus = order.status || latestTracking?.orderStatus;



                            return (

                                <tr
                                    key={order.id}
                                    onClick={() => setSelectedOrder(order)}
                                    className={`border-b cursor-pointer hover:bg-purple-50 transition
                                        ${selectedOrder?.id === order.id ? "bg-purple-100" : ""}`}
                                >
                                    <td className="px-4 py-3 font-medium">
                                        #{order.id.slice(0, 8).toUpperCase()}
                                    </td>

                                    <td className="px-4 py-3">{formatDate(order.createdAt)}</td>

                                    <td className="px-4 py-3">{order.totalItems}</td>

                                    <td className="px-4 py-3 font-semibold">
                                        ₦{Number(order.totalAmount).toLocaleString()}
                                    </td>

                                    <td className="px-4 py-3">
                                        {order.orderItems?.map((item) => (
                                            <li key={item.id}>{item.name}</li>
                                        ))}
                                    </td>

                                    <td className="px-4 py-3">
                                        <StatusBadge
                                            status={
                                                order.status ||
                                                order.orderTracking?.[
                                                    order.orderTracking.length - 1
                                                ]?.orderStatus
                                            }
                                        />
                                    </td>

                                    {/* -------- ACTION BUTTON -------- */}
                                  <td className="px-4 py-3 text-center">
    <button
        onClick={(e) => {
            e.stopPropagation();
            openStatusModal(order);
        }}
        className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"
    >
        <UserCog className="w-5 h-5 text-purple-700" />
    </button>
</td>

                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ---------------- Pagination ---------------- */}
            <div className="flex items-center justify-between mt-4 px-2">
                <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-md border text-sm ${currentPage === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"
                        }`}
                >
                    Previous
                </button>

                <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 text-sm rounded-md border ${currentPage === page
                                ? "bg-purple-600 text-white border-purple-600"
                                : "hover:bg-gray-100"
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-md border text-sm ${currentPage === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"
                        }`}
                >
                    Next
                </button>
            </div>

            {/* ---------------- STATUS UPDATE MODAL ---------------- */}
            {showStatusModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Update Order Status</h2>
                            <button
                                onClick={() => setShowStatusModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-sm text-gray-500">
                            Order:{" "}
                            <span className="font-medium">
                                #{selectedOrder.id.slice(0, 8).toUpperCase()}
                            </span>
                        </p>

                        <div>
                            <label className="text-sm font-medium text-gray-700">New Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="PENDING">Pending</option>
                                <option value="PICKED_UP">Picked Up</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        {status === "CANCELLED" && (
                            <div>
                                <label className="text-sm font-medium text-gray-700">Reason</label>
                                <textarea
                                    placeholder="Reason for cancellation..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                ></textarea>
                            </div>
                        )}

                      <div className="flex gap-3 pt-2">
    <button
        onClick={updateOrderStatus}
        disabled={status === "CANCELLED" && reason.trim() === ""}
        className={`bg-purple-700 text-white w-full py-2 rounded-md text-sm font-medium ${
            status === "CANCELLED" && reason.trim() === ""
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-purple-800 cursor-pointer"
        }`}
    >
        Update Status
    </button>

    <button
        onClick={() => setShowStatusModal(false)}
        className="border border-gray-300 w-full py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
    >
        Close
    </button>
</div>


                        {Toast}
                    </div>
                </div>
            )}
        </div>
    );
}
