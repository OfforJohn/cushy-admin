"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function ManualWalletCreditPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    user: "",
    amount: "",
    reference: "REF-2024-001",
    reason: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate submission
    await new Promise((res) => setTimeout(res, 1500));

    alert("Manual Credit Processed Successfully ✅");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Manual Wallet Credit
          </h1>
          <span className="ml-2 bg-amber-100 text-amber-700 px-3 py-1 text-xs sm:text-sm rounded-full font-medium">
            Requires Approval
          </span>
        </div>
        <span className="text-sm text-gray-500">All Cities ▾</span>
      </div>

      {/* Credit User Wallet Form */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Credit User Wallet
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Manually add credit to a user wallet. This action requires dual
          approval for amounts above ₦50,000.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Search User */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search User
            </label>
            <input
              type="text"
              name="user"
              placeholder="Search by name, phone, or email..."
              value={formData.user}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Amount & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credit Amount
              </label>
              <input
                type="number"
                name="amount"
                min="100"
                placeholder="₦0.00"
                value={formData.amount}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum: ₦100</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Reference
              </label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional internal reference for tracking
              </p>
            </div>
          </div>

          {/* Reason for Credit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Credit
            </label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="">Select reason...</option>
              <option value="refund">Order Refund</option>
              <option value="compensation">Service Compensation</option>
              <option value="promo">Promotional Credit</option>
              <option value="manual">Manual Adjustment</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Provide detailed explanation for this credit transaction..."
              rows={4}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition w-full sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => alert("Draft saved")}
              className="border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition w-full sm:w-auto"
            >
              Save as Draft
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-purple-700 text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-800 transition w-full sm:w-auto disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "+"}
              {loading ? "Processing..." : "Process Credit"}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Manual Credits */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Recent Manual Credits
        </h3>
        <p className="text-sm text-gray-500 mb-3">
          Last 10 manual credit transactions
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-700 border-b">
              <tr>
                <th className="py-3 px-4 text-left">DATE</th>
                <th className="py-3 px-4 text-left">USER</th>
                <th className="py-3 px-4 text-left">AMOUNT</th>
                <th className="py-3 px-4 text-left">REASON</th>
                <th className="py-3 px-4 text-left">STATUS</th>
                <th className="py-3 px-4 text-left">INITIATED BY</th>
              </tr>
            </thead>

            <tbody>
              {[
                {
                  date: "Oct 21, 2:30 PM",
                  user: "Michael Chen",
                  phone: "+234 803 456 7890",
                  amount: "₦25,000",
                  reason: "Order Refund",
                  status: "Completed",
                  initiator: "Admin Ops",
                },
                {
                  date: "Oct 21, 11:15 AM",
                  user: "Lisa Wang",
                  phone: "+234 804 567 8901",
                  amount: "₦75,000",
                  reason: "Service Compensation",
                  status: "Pending Approval",
                  initiator: "Ops Manager",
                },
                {
                  date: "Oct 20, 4:45 PM",
                  user: "David Smith",
                  phone: "+234 805 678 9012",
                  amount: "₦50,000",
                  reason: "Promotional Credit",
                  status: "Completed",
                  initiator: "Marketing",
                },
              ].map((row, i) => (
                <tr
                  key={i}
                  className="border-b hover:bg-gray-50 transition text-gray-700"
                >
                  <td className="py-3 px-4 whitespace-nowrap">{row.date}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <p className="font-medium">{row.user}</p>
                    <p className="text-xs text-gray-500">{row.phone}</p>
                  </td>
                  <td className="py-3 px-4">{row.amount}</td>
                  <td className="py-3 px-4">{row.reason}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        row.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{row.initiator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
