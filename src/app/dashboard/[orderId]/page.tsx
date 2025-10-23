"use client"

import { useParams } from "next/navigation"
import { useState } from "react"
import {
  CheckCircle2,
  Truck,
  Clock,
  Phone,
  MapPin,
  Download,
  RotateCcw,
  MessageCircle,
  UserCog,
  FileText,
  Bike,
  Star,
} from "lucide-react"

export default function OrderDetailsPage() {
  const { orderId } = useParams()
  const [status, setStatus] = useState("In Transit")

  
  const actions = [
    {
      label: "Reassign Rider",
      icon: <UserCog className="w-5 h-5 text-blue-500" />,
      bg: "bg-blue-50",
    },
    {
      label: "Contact Customer",
      icon: <Phone className="w-5 h-5 text-green-500" />,
      bg: "bg-green-50",
    },
    {
      label: "Process Refund",
      icon: <RotateCcw className="w-5 h-5 text-yellow-500" />,
      bg: "bg-yellow-50",
    },
    {
      label: "Export Receipt",
      icon: <FileText className="w-5 h-5 text-purple-500" />,
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500">
        Orders /{" "}
        <span className="text-gray-700 font-medium">
          Order #{orderId?.toString().toUpperCase() || "ORD-2024-001234"}
        </span>
      </div>

      {/* Order Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Order #{orderId?.toString().toUpperCase() || "ORD-2024-001234"}
            </h2>
            <p className="text-sm text-gray-500">
              Placed on October 21, 2024 at 2:45 PM
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
              In Transit
            </span>
            <button className="bg-[#5B2C6F] hover:bg-[#4a2359] text-white text-sm font-medium px-4 py-2 rounded-md">
              Update Status
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Customer</p>
            <p className="font-medium text-gray-800">Sarah Johnson</p>
            <p className="text-sm text-gray-500">sarahj@email.com</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Vendor</p>
            <p className="font-medium text-gray-800">KFC Minna</p>
            <p className="text-sm text-gray-500">Restaurant</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Amount</p>
            <p className="font-semibold text-gray-900">₦4,850</p>
            <p className="text-sm text-gray-500">Paid via Wallet</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Delivery Type</p>
            <p className="font-medium text-gray-800">Express</p>
            <p className="text-sm text-gray-500">30–45 mins</p>
          </div>
        </div>
      </div>

      {/* Update Order Status */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#5B2C6F]" />
          Update Order Status
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
                    className={`w-5 h-5 flex-shrink-0 ${
                      step.highlight ? "text-[#5B2C6F]" : "text-green-500"
                    }`}
                  />
                ) : (
                  <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
                <div>
                  <p
                    className={`text-sm font-medium ${
                      step.done ? "text-gray-800" : "text-gray-400"
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
            <div>
              <label className="text-sm font-medium text-gray-700">
                New Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#5B2C6F] focus:border-[#5B2C6F]"
              >
                <option>In Transit</option>
                <option>Delivered</option>
                <option>Cancelled</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Reason/Notes
              </label>
              <textarea
                placeholder="Add reason for status change..."
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#5B2C6F] focus:border-[#5B2C6F]"
              ></textarea>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="text-sm text-gray-700">
                Send notification to customer?
              </label>
              <input
                type="checkbox"
                className="w-4 h-4 accent-[#5B2C6F] cursor-pointer"
                defaultChecked
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button className="bg-[#5B2C6F] hover:bg-[#4a2359] text-white w-full py-2 rounded-md text-sm font-medium">
                Update Status
              </button>
              <button className="border border-gray-300 w-full py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
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
            <div
              className={`p-3 rounded-md ${action.icon} flex items-center justify-center`}
            >
              {action.icon}
            </div>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>

      {/* Delivery Information */}
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      {/* Header */}
      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Bike className="w-4 h-4 text-[#5B2C6F]" /> Delivery Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Rider Info */}
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            🚴‍♂️ Rider
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-gray-900">Ahmed Hassan</p>
              <p className="text-xs text-gray-500">Rider ID: RDR 001</p>
            </div>
            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
              ● Online
            </span>
          </div>

          {/* Aligned Rider Details */}
          <div className="grid grid-cols-3 gap-y-2 text-sm text-gray-700">
            <p className="text-gray-500">Phone:</p>
            <p className="col-span-2 font-medium text-gray-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              +234 803 123 4567
            </p>

            <p className="text-gray-500">Rating:</p>
            <p className="col-span-2 font-medium text-gray-900 flex items-center gap-1">
              4.8
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400 text-sm">★★★★★</span>
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
              Block 15 Flat 3, FUTMINNA Staff Quarters, Gidan Kwano, Minna,
              Niger State
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
    </div>
  )
}
