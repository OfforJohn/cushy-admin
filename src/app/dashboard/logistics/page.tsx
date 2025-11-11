"use client"

import { useEffect, useState } from "react"
import { Bike, Clock, Package, TrendingUp, Download, Plus, RefreshCw, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { API_BASE_URL } from "@/lib/apiConfig"

export default function LogisticsPage() {
  const [activeTab, setActiveTab] = useState("riders")
  const router = useRouter() // 👈 initialize router
const [riders, setRiders] = useState<Rider[]>([]);

  const [authChecked, setAuthChecked] = useState(false) // ✅ wait until token check completes


const activeRidersCount = riders.filter(rider => rider.status === "active").length;


type Rider = {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  status: string; // active, inactive, etc.
  vehicle_type: string | null;
  vehicle_id: string;
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  last_active: string | null;
  company_id: number;
  created_at: string;
  updated_at: string;
  assigned_zones: [];
};

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      // ✅ Always set a flash message for unauthenticated users
      sessionStorage.setItem("authMessage", "Please sign back in to continue.")
      router.replace("/auth/signin")
      return
    }

    setAuthChecked(true) // only allow page to load once token exists
  }, [router])

  // ✅ Fetch riders from API
useEffect(() => {
  
    if (!authChecked) return // wait until token verified
  async function fetchRiders() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/get-all-riders`, {
        headers: {
          "Content-Type": "application/json",
          "cushy-access-key": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!data.error) {
        setRiders(data.data.drivers); // store all riders
      }
    } catch (error) {
      console.error("Failed to fetch riders:", error);
    }
  }
  fetchRiders();
}, [authChecked]);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logistics</h1>
          <p className="text-sm text-gray-600 mt-1">Manage riders, delivery jobs, and zones</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            className="bg-[#5B2C6F] hover:bg-[#4a2359] text-white cursor-pointer transition-transform duration-150 hover:scale-105"
            onClick={() => router.push("/dashboard/logistics/Add-New-Rider")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Rider
          </Button>

        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("riders")}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === "riders"
                ? "border-[#5B2C6F] text-[#5B2C6F]"
                : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            Riders
          </button>
          <button
            onClick={() => setActiveTab("delivery-jobs")}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === "delivery-jobs"
                ? "border-[#5B2C6F] text-[#5B2C6F]"
                : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            Delivery Jobs
          </button>
          <button
            onClick={() => setActiveTab("zones")}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === "zones"
                ? "border-[#5B2C6F] text-[#5B2C6F]"
                : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            Zones & SLAs
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Riders</p>
              <h3 className="text-3xl font-bold">{activeRidersCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <Bike className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>


        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Delivery Time</p>
              <h3 className="text-3xl font-bold">24min</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>


        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Jobs</p>
              <h3 className="text-3xl font-bold">89</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Success Rate</p>
              <h3 className="text-3xl font-bold">94.2%</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-3 flex-wrap">
          <Select defaultValue="all-cities">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-cities">All Cities</SelectItem>
              <SelectItem value="lagos">Lagos</SelectItem>
              <SelectItem value="abuja">Abuja</SelectItem>
              <SelectItem value="minna">Minna</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all-zones">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Zones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-zones">All Zones</SelectItem>
              <SelectItem value="zone-a">Zone A</SelectItem>
              <SelectItem value="zone-b">Zone B</SelectItem>
              <SelectItem value="zone-c">Zone C</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all-status">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-status">All Status</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="on-delivery">On Delivery</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Verification Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Verification Status</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending Verification</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>


      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Riders</h2>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone/Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle Type
                </th>
             
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle Id
                </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company Id
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
        <tbody className="bg-white divide-y divide-gray-200">
  {riders.map((rider) => (
    <tr key={rider.id} className="hover:bg-gray-50">
      {/* Rider Name and Avatar */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {rider.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>

         <div className="flex flex-col">
  <p className="text-sm font-semibold text-gray-900">{rider.name}</p>
  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full w-max">
    RIDER ID{rider.id}
  </span>
</div>

        </div>
      </td>

      {/* City/Zone */}
      <td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center gap-2">
    <svg
      className="w-4 h-4 text-gray-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 5.5a2.5 2.5 0 012.5-2.5h1.75a.75.75 0 01.75.75v3a.75.75 0 01-.75.75H6a2.5 2.5 0 01-2.5-2.5zM21 16.5a2.5 2.5 0 01-2.5 2.5h-1.75a.75.75 0 01-.75-.75v-3a.75.75 0 01.75-.75H18a2.5 2.5 0 012.5 2.5z"
      />
    </svg>
    <span className="text-sm text-gray-900">{rider.phone}</span>
  </div>
</td>


      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            rider.status === "active"
              ? "bg-green-50 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              rider.status === "active" ? "bg-green-600" : "bg-gray-500"
            }`}
          ></span>
          {rider.status.charAt(0).toUpperCase() + rider.status.slice(1)}
        </span>
      </td>

      {/* Active Jobs, Success Rate, Avg Time, Wallet */}<td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center gap-2">
    <svg
      className="w-4 h-4 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 12H8m0 0l4-4m0 0l4 4M12 16v-8"
      />
    </svg>
    <span className="text-sm text-gray-700 truncate max-w-[200px]" title={rider.email}>
      {rider.email}
    </span>
  </div>
</td>
<td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center gap-2">
    {rider.vehicle_type === "motorcycle" && (
      <Bike className="w-4 h-4 text-purple-600" />
    )}
    {rider.vehicle_type === "bicycle" && (
      <svg className="w-4 h-4 text-green-600" /* your bicycle icon */ />
    )}
    {rider.vehicle_type === "car" && (
      <svg className="w-4 h-4 text-blue-600" /* car icon */ />
    )}
    <span className="text-sm text-gray-700 capitalize">{rider.vehicle_type || "-"}</span>
  </div>
</td>
<td className="px-6 py-4 whitespace-nowrap">
  <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800">
    {rider.vehicle_id || "-"}
  </span>
</td>
<td className="px-6 py-4 whitespace-nowrap">
  <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800">
    {rider.company_id || "-"}
  </span>
</td>



      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Button variant="link" size="sm" className="text-[#5B2C6F] h-auto p-0">
            View
          </Button>
          <Button
            variant="link"
            size="sm"
            className={`text-green-600 h-auto p-0 ${
              rider.status !== "active" ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            Payout
          </Button>
        </div>
      </td>
    </tr>
  ))}
</tbody>

          </table>
        </div>
      </div>
    </div>
  )
}
