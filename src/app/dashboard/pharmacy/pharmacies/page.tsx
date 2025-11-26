"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Download,
  Filter,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/apiConfig";

// API response type
type StoreAPIResponse = {
  id: string;
  name: string;
  email?: string;
  coverImage?: string;
  location?: string;
  licenseNo?: string;
  status?: "Verified" | "Pending" | "Suspended";
  rating?: number;
  ratingCount?: number;
  walletBalance?: number;
  category: string;
};



type Pharmacy = {
  id: string;
  name: string;
  email?: string;
  location?: string;
  city?: string;
  licenseNo?: string;
  status?: "Verified" | "Pending" | "Suspended";
  rating?: number;
  ratingCount?: number;
  walletBalance?: number;
  image?: string;
};

export default function PharmaciesDashboard() {
  const router = useRouter();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    activeOrders: 0,
  });

  useEffect(() => {
    const fetchPharmacies = async () => {
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

        // Filter only med_tech stores (pharmacies)
       const list: StoreAPIResponse[] = json.data.filter(
          (s: StoreAPIResponse) => s.category === "med_tech"
        );

   

        // ✅ Set total restaurants dynamically
        setStats((prev) => ({
          ...prev,
          total: list.length,
          verified: list.length
        }));

        const formatted: Pharmacy[] = list.map((p) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          location: p.location,
          city: p.location?.split(",")[0] || "N/A",
          licenseNo: p.licenseNo || `PCN-${Math.floor(Math.random() * 1000)}`,
          status: p.status || "Pending",
          rating: p.rating || parseFloat((Math.random() * 1 + 4).toFixed(1)),
          ratingCount: p.ratingCount || Math.floor(Math.random() * 200),
          walletBalance: p.walletBalance || Math.floor(Math.random() * 50000),
          image: p.coverImage,
        }));

        setPharmacies(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600">Loading pharmacies...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <SmallStat
          title="Total Pharmacies"
          value={stats.total.toString()}
          icon={<Users />}
        />
        <SmallStat
          title="Verified"
          value={stats.verified.toString()}
          icon={<CheckCircle />}
          color="green"
        />
        <SmallStat
          title="Pending Verification"
          value={stats.pending.toString()}
          icon={<Clock />}
          color="amber"
        />
        <SmallStat
          title="Active Orders"
          value={stats.activeOrders.toString()}
          icon={<XCircle />}
          color="purple"
        />
      </div>

      {/* HEADER BAR */}
      <div className="bg-white rounded-xl border p-4 mb-4 flex flex-wrap justify-between items-center gap-2">
        <h3 className="font-semibold">All Pharmacies</h3>
        <div className="flex flex-wrap items-center gap-2">
          <HeaderButton icon={<Filter />} text="Filter" />
          <select className="border rounded px-3 py-2 text-sm">
            <option>All Status</option>
          </select>
          <HeaderButton icon={<Download />} text="Export CSV" />
          <button
            onClick={() => router.push("/dashboard/pharmacies/new")}
            className="bg-purple-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 hover:bg-purple-800"
          >
            <Plus className="w-4 h-4" />
            Add Pharmacy
          </button>
        </div>
      </div>

      {/* TABLE FOR MD+ SCREENS */}
      <div className="hidden md:block bg-white rounded-xl border overflow-x-auto">
        <table className="min-w-[800px] w-full table-auto text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-gray-600 text-xs">
              <th className="px-3 py-3 text-left">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="px-3 py-3 font-medium text-left">NAME</th>
              <th className="px-3 py-3 font-medium text-left">LOCATION</th>

              <th className="px-3 py-3 font-medium text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {pharmacies.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                {/* Checkbox */}
                <td className="px-3 py-3 align-top">
                  <input type="checkbox" className="rounded" />
                </td>

                {/* Restaurant */}
                <td className="px-3 py-3 align-top">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={p.image ?? "/rest-thumb-1.png"}
                        alt={p.name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium text-sm md:text-base">{p.name}</div>
                      <div className="text-xs text-gray-400">#{p.id.toUpperCase()}</div>
                    </div>
                  </div>
                </td>

                {/* Location */}
                <td className="px-3 py-3 align-top">
                  <div className="font-medium">{p.city ?? "N/A"}</div>
                  <div className="text-xs text-gray-400">{p.location ?? "N/A"}</div>
                </td>

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

      {/* CARD VIEW FOR SMALL SCREENS */}
      <div className="block md:hidden space-y-4">
        {pharmacies.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-xl border p-4 shadow-sm flex flex-col gap-2"
          >
            <div className="flex items-center gap-3">
              <Image
                src={p.image ?? "/rest-thumb-1.png"}
                alt={p.name}
                width={50}
                height={50}
                className="object-cover rounded-lg"
              />
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-gray-400">{p.email}</div>
              </div>
            </div>
            <p className="text-sm">ID: {p.id.toUpperCase()}</p>
            <p className="text-sm">Location: {p.location}</p>
            <p className="text-sm">License: {p.licenseNo}</p>
            <p className="text-sm">
              Status:{" "}
              <span
                className={`px-2 py-1 rounded-full text-xs ${p.status === "Verified"
                    ? "bg-green-100 text-green-700"
                    : p.status === "Pending"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                  }`}
              >
                {p.status}
              </span>
            </p>
            <p className="text-sm">
              Rating: {p.rating?.toFixed(1)} ★ ({p.ratingCount})
            </p>
            <p className="text-sm">
              Wallet: ₦{p.walletBalance?.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Components
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
  color?: "indigo" | "green" | "amber" | "red" | "purple";
}) {
  const colors = {
    indigo: "text-indigo-600",
    green: "text-green-600",
    amber: "text-amber-600",
    red: "text-red-600",
    purple: "text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl border p-4 flex items-center gap-3 shadow-sm">
      <div className="p-2 rounded bg-gray-50">{icon && <div className={colors[color]}>{icon}</div>}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
}
