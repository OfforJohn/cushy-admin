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
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OrderDetailsPage() {
  const { orderId } = useParams()
  const [status, setStatus] = useState("In Transit")

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Breadcrumb */}
   
 

      


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
          {[
            { label: "Reassign Rider", icon: <UserCog className="w-4 h-4" /> },
            {
              label: "Contact Customer",
              icon: <MessageCircle className="w-4 h-4" />,
            },
            { label: "Process Refund", icon: <RotateCcw className="w-4 h-4" /> },
            { label: "Export Receipt", icon: <Download className="w-4 h-4" /> },
          ].map((action, i) => (
            <button
              key={i}
              className="flex items-center justify-center sm:justify-start border border-gray-200 rounded-md py-3 px-4 text-sm font-medium text-gray-700 hover:bg-purple-50 gap-2"
            >
              <span className="text-[#5B2C6F]">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>

  
    </div>
  )
}
