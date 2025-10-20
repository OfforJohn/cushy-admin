"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Edit, Plus, MoreVertical } from "lucide-react"

export default function SettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6 max-w-7xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 border-b border-gray-200 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {/* Wrapping tabs with min-width to avoid squishing */}
        <button className="min-w-[100px] flex-shrink-0 px-4 py-2 text-sm font-medium text-white bg-[#5B2C6F] rounded-sm whitespace-nowrap">
          General
        </button>
        <button className="min-w-[100px] flex-shrink-0 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 whitespace-nowrap">
          Locations
        </button>
        <button className="min-w-[100px] flex-shrink-0 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 whitespace-nowrap">
          Fees
        </button>
        <button className="min-w-[100px] flex-shrink-0 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 whitespace-nowrap">
          RBAC
        </button>
        <button className="min-w-[100px] flex-shrink-0 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 whitespace-nowrap">
          Integrations
        </button>
        <button className="min-w-[100px] flex-shrink-0 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 whitespace-nowrap">
          AI Controls
        </button>
      </div>

      {/* Main grid - 1 column on small screens, 2 on lg */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Platform Configuration */}
        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg font-bold">Platform Configuration</h2>
            <Button variant="ghost" size="icon">
              <Edit className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label
                htmlFor="platform-name"
                className="text-sm font-medium text-[#5B2C6F] mb-1 sm:mb-2"
              >
                Platform Name
              </Label>
              <Input id="platform-name" defaultValue="Cushy Access" />
            </div>

            <div>
              <Label
                htmlFor="timezone"
                className="text-sm font-medium text-[#5B2C6F] mb-1 sm:mb-2"
              >
                Default Timezone
              </Label>
              <Select defaultValue="africa-lagos">
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="africa-lagos">Africa/Lagos</SelectItem>
                  <SelectItem value="africa-abuja">Africa/Abuja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor="currency"
                className="text-sm font-medium text-[#5B2C6F] mb-1 sm:mb-2"
              >
                Default Currency
              </Label>
              <Select defaultValue="ngn">
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ngn">NGN (₦)</SelectItem>
                  <SelectItem value="usd">USD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label
                htmlFor="maintenance"
                className="text-sm font-medium text-[#5B2C6F]"
              >
                Maintenance Mode
              </Label>
              <Switch
                id="maintenance"
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
              />
            </div>
          </div>
        </div>

        {/* Service Areas */}
        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg font-bold">Service Areas</h2>
            <Button className="bg-[#5B2C6F] hover:bg-[#4a2359] text-white text-sm whitespace-nowrap flex items-center gap-2 py-2 px-3 sm:px-4 rounded">
              <Plus className="w-4 h-4" />
              Add City
            </Button>
          </div>

          <div className="space-y-3">
            {/* Minna */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Minna</p>
                  <p className="text-xs text-gray-500">Niger State</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700">
                  Active
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Abuja */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Abuja</p>
                  <p className="text-xs text-gray-500">FCT</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700">
                  Active
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Lagos */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                  !
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Lagos</p>
                  <p className="text-xs text-gray-500">Lagos State</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
                  Pending
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Fee Structure */}
        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg font-bold">Fee Structure</h2>
            <Button variant="ghost" size="icon">
              <Edit className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="service-fee"
                  className="text-sm font-medium text-[#5B2C6F] mb-1 sm:mb-2"
                >
                  Service Fee (%)
                </Label>
                <Input id="service-fee" type="number" defaultValue="3" />
              </div>
              <div>
                <Label
                  htmlFor="packaging-fee"
                  className="text-sm font-medium text-[#5B2C6F] mb-1 sm:mb-2"
                >
                  Packaging Fee (₦)
                </Label>
                <Input id="packaging-fee" type="number" defaultValue="50" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="express-multiplier"
                  className="text-sm font-medium text-[#5B2C6F] mb-1 sm:mb-2"
                >
                  Express Multiplier
                </Label>
                <Input id="express-multiplier" type="number" defaultValue="1.5" step="0.1" />
              </div>
              <div>
                <Label
                  htmlFor="health-commission"
                  className="text-sm font-medium text-[#5B2C6F] mb-1 sm:mb-2"
                >
                  Health Commission (%)
                </Label>
                <Input id="health-commission" type="number" defaultValue="20" />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-[#5B2C6F] mb-3 block">
                Category-Specific Fees
              </Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-[#5B2C6F]">Restaurant Packaging</span>
                  <span className="text-sm font-medium">₦75</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-[#5B2C6F]">Grocery Packaging</span>
                  <span className="text-sm font-medium">₦50</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-[#5B2C6F]">Pharmacy Packaging</span>
                  <span className="text-sm font-medium">₦25</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg font-bold">System Status</h2>
          </div>

          <div className="space-y-3">
            {[
              { name: "Database", status: "Operational", color: "teal" },
              { name: "Payment Gateway", status: "Operational", color: "teal" },
              { name: "Email Service", status: "Degraded", color: "orange" },
              { name: "Push Notifications", status: "Operational", color: "teal" },
              { name: "AI Assistant", status: "Operational", color: "teal" },
            ].map(({ name, status, color }) => (
              <div
                key={name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full bg-${color}-500`}
                  ></div>
                  <span className="text-sm text-gray-900">{name}</span>
                </div>
                <span
                  className={`text-sm font-medium text-${color}-600`}
                >
                  {status}
                </span>
              </div>
            ))}

            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Last System Check</span>
                <span className="text-gray-900">2 minutes ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
