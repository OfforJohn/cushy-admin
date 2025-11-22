"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Bike } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast-provider";
import { API_BASE_URL } from "@/lib/apiConfig";

// ---------- Rider Modal Component ----------
function RiderModalContent({
  riders,
  assignRider,
}: {
  riders: Rider[];
  assignRider: (rider: Rider) => Promise<void>;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(riders.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedRiders = riders.slice(startIdx, startIdx + itemsPerPage);

  return (
    <div>
      <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto">
        {paginatedRiders.map((rider) => (
          <div
            key={rider.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-purple-50"
          >
            <div>
              <p className="font-semibold">{rider.name}</p>
              <p className="text-sm text-gray-600">{rider.phone}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  rider.online
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {rider.online ? "Online" : "Offline"}
              </span>
              <button
                onClick={() => assignRider(rider)}
                disabled={!rider.available}
                className="px-4 py-2 bg-purple-700 text-white rounded-lg disabled:bg-gray-400 hover:bg-purple-800"
              >
                Assign
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// ---------- Types ----------
interface ApiOrder {
  id: string;
  createdAt: string;
  orderItems: { name: string; price: string; quantity: number }[];
  orderTracking: { orderStatus: string; createdAt: string }[];
  totalAmount: string;
  Charges: string;
  fullHouseAddress: string;
  additionalPhoneNumber: string;
}

interface Order {
  id: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  itemName: string;
  itemQty: number;
  phone: string;
}

type Rider = {
  id: number;
  name: string;
  phone: string;
  status: string;
  online?: boolean;
  available?: boolean;
};

// --------------------------------------------
export default function AssignRiderPage() {
  const router = useRouter();
  const { Toast, showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);

  const itemsPerPage = 10;

  // ---------- Fetch Orders ----------
  useEffect(() => {
    async function fetchOrders() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/orders/get-all-orders`, {
          headers: {
            "Content-Type": "application/json",
            "cushy-access-key": `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (Array.isArray(data)) {
          const sorted = data.sort(
            (a: ApiOrder, b: ApiOrder) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          const mapped: Order[] = sorted.map((order: ApiOrder) => {
            const firstItem = order.orderItems?.[0];
            const tracking = order.orderTracking || [];
            const latestStatus = tracking[tracking.length - 1]?.orderStatus || "UNKNOWN";

            return {
              id: order.id,
              totalAmount: order.totalAmount,
              createdAt: order.createdAt,
              status: latestStatus,
              itemName: firstItem?.name || "Item",
              itemQty: firstItem?.quantity || 0,
              phone: order.additionalPhoneNumber || "N/A",
            };
          });

          setOrders(mapped);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  // ---------- Fetch Riders ----------
  useEffect(() => {
    async function fetchRiders() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/admin/get-all-riders`, {
          headers: {
            "Content-Type": "application/json",
            "cushy-access-key": `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data?.data?.drivers) {
          const mapped = data.data.drivers.map((r: Rider) => ({
            ...r,
            online: r.status === "active",
            available: r.status === "active",
          }));

          setRiders(mapped);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchRiders();
  }, []);

  // ---------- Assign Rider ----------
  const assignRider = async (rider: Rider) => {
    if (!selectedOrder) return;

    const token = localStorage.getItem("token");
    if (!token) return showToast("No token found", "error");

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/admin/assign-rider-to-order?orderId=${selectedOrder.id}&riderId=${rider.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "cushy-access-key": `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to assign rider", "error");
        return;
      }

      showToast(`Assigned ${rider.name} to order ${selectedOrder.id}`, "success");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      showToast("Error assigning rider", "error");
    }
  };

  // ---------- Pagination ----------
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  if (loading) return <div className="p-6">Loading orders...</div>;

  return (
    <div className="min-h-screen p-6 space-y-6 bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-700 hover:text-purple-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-semibold">Assign Rider</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white border rounded-lg p-6 shadow-sm overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">
          Assign Riders ({orders.length})
        </h2>

        <table className="min-w-full text-sm border-t">
          <thead className="bg-gray-100 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order) => (
              <tr
                key={order.id}
                className={`border-b hover:bg-purple-50 cursor-pointer transition ${
                  selectedOrder?.id === order.id ? "bg-purple-100" : ""
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <td className="px-4 py-3 font-medium">{order.id.slice(0, 8)}</td>
                <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-3">{order.itemName} (x{order.itemQty})</td>
                <td className="px-4 py-3 font-semibold">
                  ₦{Number(order.totalAmount).toLocaleString()}
                </td>
                <td className="px-4 py-3">{order.status}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(order);
                      setShowModal(true);
                    }}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <Bike className="w-5 h-5 text-purple-700" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 px-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-md border text-sm ${
            currentPage === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"
          }`}
        >
          Previous
        </button>

        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 text-sm rounded-md border ${
                currentPage === page
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
          className={`px-4 py-2 rounded-md border text-sm ${
            currentPage === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"
          }`}
        >
          Next
        </button>
      </div>

      {/* Rider Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
          <div className="bg-white w-full sm:max-w-3xl rounded-t-2xl sm:rounded-lg p-6 max-h-[85vh] overflow-y-auto animate-slideUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Select Rider for #{selectedOrder.id.slice(0, 8)}
              </h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>

            <RiderModalContent riders={riders} assignRider={assignRider} />

            {Toast}
          </div>
        </div>
      )}

      {Toast}
    </div>
  );
}
