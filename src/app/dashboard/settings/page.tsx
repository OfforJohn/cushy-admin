"use client"

import { useEffect, useState } from "react"
import {
  Edit,
  Plus,
  MoreVertical,
  Search,
  User,
  ShoppingCart,
  Tag,
  CheckCircle,
  ShoppingBasket,
  Utensils,
  Truck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/toast-provider"

export default function SettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  const [activeTab, setActiveTab] = useState("All Coupons");

  const [loadingToggle, setLoadingToggle] = useState(false);




  const [lastUpdated, setLastUpdated] = useState<{
    time: string;
    admin: string;
    status: string;
  } | null>(null);
  const [pendingFreeDelivery, setPendingFreeDelivery] = useState(false);

  const [freeDeliveryEnabled, setFreeDeliveryEnabled] = useState(false);




  const handleSwitchChange = (value: boolean) => {
    setPendingFreeDelivery(value); // update local "pending" state only
  };



  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUserEmail(parsed.name || parsed.email); // use name if available, else email
    }
  }, []);






  const { Toast, showToast } = useToast();

  const users = [
    { name: "John Doe", email: "john@example.com", avatarBg: "bg-indigo-600" },
    { name: "Sarah Ahmed", email: "sarah@example.com", avatarBg: "bg-emerald-600" },
    { name: "Michael Bello", email: "michael@example.com", avatarBg: "bg-rose-500" },
  ]

  const tabs = [
    "All Coupons",
    "Site-Wide",
    "Merchant-Specific",
    "Active",
    "Expired",
  ];





  // Capture admin info from localStorage
  const [userEmail, setUserEmail] = useState<string | null>(null);
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUserEmail(parsed.name || parsed.email); // use name if available
    }
  }, []);

  // When admin toggles the switch, update pending state and live preview
  const handleToggleSwitch = (value: boolean) => {
    setPendingFreeDelivery(value);

    const now = new Date();
    setLastUpdated({
      time: now.toLocaleString("en-US", { hour12: true }),
      admin: userEmail || "Admin",
      status: value ? "Enabled" : "Disabled",
    });
  };

  useEffect(() => {
    const savedStatus = localStorage.getItem("freeDeliveryEnabled");
    if (savedStatus !== null) {
      const isActive = savedStatus === "true"; // stored as string
      setFreeDeliveryEnabled(isActive);
      setPendingFreeDelivery(isActive); // also sync the switch
    }
  }, []);


  // When admin clicks Save Changes, commit the change
  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoadingToggle(true);

      const res = await fetch(
        `https://cushy-access-backend-f3ab.onrender.com/api/v1/admin/toggle-global-free-delivery`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "cushy-access-key": `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: pendingFreeDelivery }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to update free delivery", "error");
        return;
      }

      // ✅ Commit change
      setFreeDeliveryEnabled(pendingFreeDelivery);

      // ✅ Save to localStorage for persistence
      localStorage.setItem("freeDeliveryEnabled", pendingFreeDelivery.toString());

      showToast(
        `Free delivery ${pendingFreeDelivery ? "enabled" : "disabled"} site-wide`,
        "success"
      );
    } catch (err) {
      showToast("An error occurred. Please try again.", "error");
    } finally {
      setLoadingToggle(false);
    }
  };





  return (
    <div className="px-4 sm:px-6 md:px-8 py-6 max-w-7xl mx-auto space-y-6">
      {/* Tabs */}
      <div className="bg-white p-3 rounded border border-gray-200">
        <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
          <button className="px-3 py-1 rounded bg-[#5B2C6F] text-white text-sm font-medium">General</button>
          <button className="px-3 py-1 rounded text-sm font-medium text-gray-600">Locations</button>
          <button className="px-3 py-1 rounded text-sm font-medium text-gray-600">Fees</button>
          <button className="px-3 py-1 rounded text-sm font-medium text-gray-600">RBAC</button>
          <button className="px-3 py-1 rounded text-sm font-medium text-gray-600">Integrations</button>
          <button className="px-3 py-1 rounded text-sm font-medium text-gray-600">AI Controls</button>
        </div>
      </div>

      {/* Row 1: See Users Cart (left) + Service Areas (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* See Users Cart */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-semibold">See Users Cart</h3>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="px-2 py-1">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="mt-3">
            <Input placeholder="Enter user ID, phone or email..." />
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-500 font-medium mb-2">Quick Access</p>
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.email} className="flex items-center justify-between p-2 rounded border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${u.avatarBg}`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">2 items in cart</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded p-3 text-center">
              <p className="text-xs text-gray-500">Active Carts</p>
              <p className="text-2xl font-bold text-[#5B2C6F]">847</p>
            </div>
            <div className="bg-gray-50 rounded p-3 text-center">
              <p className="text-xs text-gray-500">Abandoned</p>
              <p className="text-2xl font-bold text-amber-500">234</p>
            </div>
          </div>
        </div>

        {/* Service Areas */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Service Areas</h3>
            <Button className="bg-[#5B2C6F] hover:bg-[#4A2359] text-white flex items-center gap-2 py-1 px-3 text-sm">
              <Plus className="w-4 h-4" /> Add City
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {[
              { city: "Minna", region: "Niger State", status: "Active", color: "teal" },
              { city: "Abuja", region: "FCT", status: "Active", color: "teal" },
              { city: "Lagos", region: "Lagos State", status: "Pending", color: "orange" },
            ].map((c) => (
              <div key={c.city} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${c.color === "teal" ? "bg-emerald-500" : "bg-orange-500"} text-white font-bold`}>
                    {c.status === "Pending" ? "!" : <CheckCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{c.city}</p>
                    <p className="text-xs text-gray-500">{c.region}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.color === "teal" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>
                    {c.status}
                  </span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coupon Management - full width */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Coupon Management</h3>
            <p className="text-sm text-gray-500">
              Create and manage site-wide and merchant-specific coupons
            </p>
          </div>

          <Button className="bg-[#5B2C6F] hover:bg-[#4A2359] text-white flex items-center gap-2 px-4 py-2 text-sm rounded-md">
            <Plus className="w-4 h-4" /> Create Coupon
          </Button>
        </div>

        {/* Tabs */}

        <div className="flex items-center gap-6 border-b border-gray-200 text-sm">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-gray-700 hover:text-[#5B2C6F] relative group`}
            >
              {tab}

              {/* ACTIVE underline */}
              {activeTab === tab && (
                <span className="absolute left-0 -bottom-[1px] w-full h-[2px] bg-black"></span>
              )}

              {/* HOVER underline */}
              {activeTab !== tab && (
                <span className="absolute left-0 -bottom-[1px] w-full h-[2px] bg-[#5B2C6F] scale-x-0 group-hover:scale-x-100 transition-transform"></span>
              )}
            </button>
          ))}
        </div>

        {/* Coupon List */}
        <div className="mt-4 space-y-4">

          {/* Coupon Item */}
          <div className="border border-gray-200 rounded-lg p-4 flex items-start justify-between hover:shadow-sm transition">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                <Tag className="w-5 h-5 text-yellow-600" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">WELCOME50</p>
                  <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded">
                    Site-Wide
                  </span>
                </div>

                <p className="text-sm text-gray-600">50% off first order • Min ₦1,000</p>

                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <span>Valid until Dec 31, 2024</span>
                  <span>•</span>
                  <span>234 uses</span>
                  <span className="text-green-600 font-medium">• Active</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Edit className="w-4 h-4 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
          </div>

          {/* Second Coupon */}
          <div className="border border-gray-200 rounded-lg p-4 flex items-start justify-between hover:shadow-sm transition">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">FREEDEL</p>
                  <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded">
                    Site-Wide
                  </span>
                </div>

                <p className="text-sm text-gray-600">Free delivery on all orders</p>

                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <span>Valid until Jan 15, 2025</span>
                  <span>•</span>
                  <span>1,456 uses</span>
                  <span className="text-green-600 font-medium">• Active</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Edit className="w-4 h-4 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
          </div>

        </div>
      </div>


      {/* Row 3: Fee Structure (left) + System Status (right) */}
      <div className="min-h-screen bg-gray-50 p-6 space-y-6">

        {/* 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Fee Structure */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Fee Structure</h3>
              <Button variant="ghost" size="icon">
                <Edit className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-[#5B2C6F]">Service Fee (%)</Label>
                  <Input type="number" defaultValue={3} />
                </div>
                <div>
                  <Label className="text-sm font-medium text-[#5B2C6F]">Delivery fee per mile (₦)</Label>
                  <Input type="number" defaultValue={50} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-[#5B2C6F]">Restaurant Packaging Fee (₦)</Label>
                  <Input type="number" defaultValue={50} />
                </div>
                <div>
                  <Label className="text-sm font-medium text-[#5B2C6F]">Groceries Packaging Fee (₦)</Label>
                  <Input type="number" defaultValue={50} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-[#5B2C6F]">Pharma Packaging Fee (₦)</Label>
                  <Input type="number" defaultValue={1.5} />
                </div>
                <div>
                  <Label className="text-sm font-medium text-[#5B2C6F]">Health Commission (%)</Label>
                  <Input type="number" defaultValue={20} />
                </div>
              </div>

            </div>
          </div>

          {/* System Status */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold mb-4">System Status</h3>

            <div className="space-y-4">

              {[
                { name: "Database", status: "Operational", badge: "green" },
                { name: "Payment Gateway", status: "Operational", badge: "green" },
                { name: "API Services", status: "Operational", badge: "green" },
                { name: "SMS Service", status: "Degraded", badge: "orange" },
                { name: "Email Service", status: "Operational", badge: "green" },
                { name: "Push Notifications", status: "Operational", badge: "green" }
              ].map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${s.badge === "green" ? "bg-emerald-500" : "bg-orange-500"
                      }`}></div>
                    <span className="text-sm text-gray-900">{s.name}</span>
                  </div>
                  <span className={`text-sm font-medium ${s.badge === "green" ? "text-emerald-600" : "text-orange-600"
                    }`}>
                    {s.status}
                  </span>
                </div>
              ))}

              <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between text-sm">
                <span className="text-gray-500">Last System Check</span>
                <span className="text-gray-900">2 minutes ago</span>
              </div>

            </div>
          </div>
          <div className="bg-emerald-400 rounded-xl p-6 text-white shadow-sm">

            {/* TOP ROW */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-semibold">Free Delivery Mode</h4>
                <p className="text-sm opacity-90">
                  Enable site-wide free delivery for all orders
                </p>
              </div>

              <Switch
                disabled={loadingToggle}
                checked={pendingFreeDelivery}
                onCheckedChange={handleToggleSwitch}
              />



            </div>

            {/* RESPONSIVE 3 BUTTONS */}
            <div className="flex flex-wrap items-center gap-4 mt-5">

              <div className="w-full sm:w-32 bg-emerald-300/40 rounded-lg p-4 flex flex-col items-center justify-center">
                <Truck className="w-8 h-8 text-white mb-1" />
                <span className="text-sm font-semibold">All Orders</span>
              </div>

              <div className="w-full sm:w-32 bg-emerald-300/40 rounded-lg p-4 flex flex-col items-center justify-center">
                <Utensils className="w-8 h-8 text-white mb-1" />
                <span className="text-sm font-semibold">Restaurants</span>
              </div>

              <div className="w-full sm:w-32 bg-emerald-300/40 rounded-lg p-4 flex flex-col items-center justify-center">
                <ShoppingBasket className="w-8 h-8 text-white mb-1" />
                <span className="text-sm font-semibold">Groceries</span>
              </div>

            </div>

            {/* IMPACT ROW */}
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm opacity-90">Impact Estimate:</p>
              <p className="text-sm font-semibold">+45% Order Volume</p>
            </div>

          </div>


          {Toast}



        </div>
   <p className="mt-3 text-xs opacity-80">
  Last updated: {lastUpdated ? lastUpdated.time : "Not updated yet"} • 
  Updated by {lastUpdated ? lastUpdated.admin : "-"} • 
  Status:{" "}
  <span className={freeDeliveryEnabled ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"}>
    {freeDeliveryEnabled ? "Enabled" : "Disabled"}
  </span>
</p>




        <Button
          onClick={handleSaveChanges}
          className="bg-[#5B2C6F] hover:bg-[#4A2359] text-white flex items-center gap-2 px-4 py-2 text-sm rounded-md"
        >
          Save Changes
        </Button>



        {/* Free Delivery Mode */}

      </div>


    </div>
  )
}
