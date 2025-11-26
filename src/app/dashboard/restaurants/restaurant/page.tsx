"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Download,
  Columns,
  Filter,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/apiConfig";

type Restaurant = {
  id: string;
  name: string;
  slug?: string;
  owner: string;          // ✅ required
  ownerAvatar?: string;
  phone?: string;
  email?: string;
  city?: string;
  location?: string;
  branches?: number;
  products?: number;
  image?: string;
};


export default function RestaurantsDashboard() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

const [stats, setStats] = useState({
  total: 0,
  verified: 0,
  pending: 0,
  suspended: 0,
  inactive: 0,
});



useEffect(() => {
  const fetchStores = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/v1/stores`, {
        headers: {
          "Content-Type": "application/json",
          "cushy-access-key": `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!json.data || !Array.isArray(json.data)) return;

      // Filter restaurants ONLY
   type StoreApiResponse = {
  id: string;
  name: string;
  coverImage?: string;
  location?: string;
  category: string;
  ownerName?: string;
  branchesCount?: number;
  productCount?: number;
  status?: string;
};

// cast json.data as this type
const restaurantList = (json.data as StoreApiResponse[]).filter(
  (s) => s.category === "restaurant"
);


      // ✅ Set total restaurants dynamically
      setStats((prev) => ({
        ...prev,
        total: restaurantList.length,
        verified: restaurantList.length
      }));

      // Format for UI
  const formatted: Restaurant[] = restaurantList.map((s) => ({
  id: s.id,
  name: s.name,
  image: s.coverImage,
  location: s.location,
  city: s.location?.split(",")[0] || "",
  owner: s.ownerName || "Not Provided", // <-- required field
         // optional
  branches: s.branchesCount || 1,
  products: s.productCount || 0,
}));


      setRestaurants(formatted);
    } catch (err) {
      console.error("ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchStores();
}, []);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600">Loading restaurants...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* TOP BAR */}
    

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <SmallStat title="Total Restaurants" value={stats.total.toString()} icon={<Users />} />
        <SmallStat title="Verified" value={stats.verified.toString()} icon={<CheckCircle />} color="green" />
        <SmallStat title="Pending Review" value={stats.pending.toString()} icon={<Clock />} color="amber" />
        <SmallStat title="Suspended" value={stats.suspended.toString()} icon={<XCircle />} color="red" />
        <SmallStat title="Inactive" value={stats.inactive.toString()} icon={<Clock />} color="gray" />
      </div>

      {/* FILTERS */}
    <div className="bg-white rounded-xl border p-4 mb-6">
  <div className="flex items-center justify-between">
    <h2 className="font-semibold text-lg">Filters</h2>
    <button className="text-sm text-purple-700">Clear All</button>
  </div>

  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1"></label>
   <SelectFilter label="Status" placeholder="All Statuses" />

    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1"></label>
      <SelectFilter label="Rating" placeholder="All Ratings" />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1"></label>
      <SelectFilter label="Branches" placeholder="Any" />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1"></label>
      <SelectFilter label="Date Joined" placeholder="All Time" />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1"></label>
      <SelectFilter label="Wallet Balance" placeholder="Any Amount" />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1"></label>
      <SelectFilter label="Sort By" placeholder="Newest First" />
    </div>
  </div>
</div>


      {/* HEADER BAR */}
      <div className="bg-white rounded-xl border p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h3 className="font-semibold">Restaurants List</h3>

          <div className="flex flex-wrap items-center gap-3">
            <HeaderButton icon={<Filter />} text="Bulk Actions" />
            <HeaderButton icon={<Columns />} text="Columns" />
            <HeaderButton icon={<Download />} text="Export CSV" />

            <button
              onClick={() => router.push("/dashboard/restaurants/new")}
              className="bg-purple-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 hover:bg-purple-800"
            >
              <Plus className="w-4 h-4" />
              Add Restaurant
            </button>
          </div>
        </div>
      </div>

      {/* RESPONSIVE TABLE */}
      {/* Responsive Restaurants Table */}
    {/* RESPONSIVE TABLE */}
<div className="bg-white rounded-xl border overflow-hidden mt-6">
  <div className="w-full overflow-x-auto">
    <table className="w-full table-auto text-sm">
      <thead className="bg-gray-50 border-b">
        <tr className="text-gray-600 text-xs">
          <th className="px-3 py-3 w-10">
            <input type="checkbox" className="rounded" />
          </th>
          <th className="px-3 py-3 font-medium text-left">RESTAURANT</th>
         
          <th className="px-3 py-3 font-medium text-left">LOCATION</th>
        </tr>
      </thead>

   <tbody>
  {restaurants.map((r) => (
    <tr key={r.id} className="border-b hover:bg-gray-50 transition">
      
      {/* Checkbox */}
      <td className="px-3 py-3 align-top">
        <input type="checkbox" className="rounded" />
      </td>

      {/* Restaurant */}
      <td className="px-3 py-3 align-top">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={r.image ?? "/rest-thumb-1.png"}
              alt={r.name}
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
          <div>
            <div className="font-medium text-sm md:text-base">{r.name}</div>
            <div className="text-xs text-gray-400">#{r.id.toUpperCase()}</div>
          </div>
        </div>
      </td>

      {/* Owner */}
   

      {/* Location */}
      <td className="px-3 py-3 align-top">
        <div className="font-medium">{r.city ?? "N/A"}</div>
        <div className="text-xs text-gray-400">{r.location ?? "N/A"}</div>
      </td>

      {/* Contact */}
 

      {/* Branches */}
  

      {/* Status */}
      <td className="px-3 py-3 align-top text-right">
        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
          ✓ Verified
        </span>
      </td>

    </tr>
  ))}
</tbody>

    </table>
  </div>
</div>



    </div>
  );
}

function SelectFilter({ label, placeholder }: { label: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select className="border rounded px-3 py-2 text-sm bg-white">
        {placeholder && <option value="">{placeholder}</option>}
      </select>
    </div>
  );
}

function Th({ label, className = "" }: { label: string; className?: string }) {
  return (
    <th
      className={`px-4 py-3 md:px-6 md:py-4 font-medium text-xs ${className}`}
    >
      {label}
    </th>
  );
}

function HeaderButton({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <button className="flex items-center gap-2 border rounded px-3 py-2 text-sm bg-white">
      {icon}
      {text}
    </button>
  );
}

function SmallStat({
  title,
  value,
  icon,
  color = "indigo",
}: {
  title: string;
  value: string;
  icon?: React.ReactNode;
  color?: "indigo" | "green" | "amber" | "red" | "gray";
}) {
  const colors = {
    indigo: "text-indigo-600",
    green: "text-green-600",
    amber: "text-amber-600",
    red: "text-red-600",
    gray: "text-gray-600",
  };

  return (
    <div className="bg-white rounded-xl border p-4 flex items-center gap-3 shadow-sm">
      <div className="p-2 rounded bg-gray-50">
        <div className={colors[color]}>{icon}</div>
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
}