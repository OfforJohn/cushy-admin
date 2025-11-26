"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    ShoppingBasket,
    CheckCircle2,
    Clock,
    XCircle,
    TrendingUp,
    RefreshCcw,
    MoreVertical,
    Plus,
    Columns,
    Download,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/apiConfig";

type Grocery = {
    id: string;
    name: string;
    category: string;
    location?: string;
    city?: string;
    branches?: number;
    items?: number;
    status?: "Active" | "Pending" | "Suspended";
    rating?: number;
    ratingCount?: number;
    walletBalance?: number;
    joinedDate?: string;
    image?: string;
    coverImage?: string;
};

type Stats = {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    avgRating: number;
};

export default function GroceriesDashboard() {
    const router = useRouter();
    const [groceries, setGroceries] = useState<Grocery[]>([]);
    const [stats, setStats] = useState<Stats>({
        total: 0,
        active: 0,
        pending: 0,
        suspended: 0,
        avgRating: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroceries = async () => {
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

                // Filter only grocery stores
                const list = (json.data as Grocery[]).filter(
                    (s: Grocery) => s.category === "grocery"
                );
                setGroceries(
                    list.map((p: Grocery) => ({
                        ...p,
                        city: p.location?.split(",")[0] || "N/A",
                        status: p.status || "Pending",
                        rating: p.rating || parseFloat((Math.random() * 1 + 4).toFixed(1)),
                        ratingCount: p.ratingCount || Math.floor(Math.random() * 200),
                        walletBalance: p.walletBalance || Math.floor(Math.random() * 50000),
                        joinedDate: p.joinedDate || new Date().toLocaleDateString(),
                        image: p.coverImage || "/rest-thumb-1.png", // <--- use coverImage here
                    }))
                );


                // Calculate stats dynamically
                const total = list.length;
                const active = list.filter((g) => g.status === "Active").length;
                const pending = list.filter((g) => g.status === "Pending").length;
                const suspended = list.filter((g) => g.status === "Suspended").length;
                const avgRating =
                    list.reduce((acc, curr) => acc + (curr.rating || 0), 0) / total || 0;

                setStats({ total, active, pending, suspended, avgRating: parseFloat(avgRating.toFixed(1)) });

                
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchGroceries();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <p className="text-gray-600">Loading groceries...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            {/* TOP STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                <StatBox icon={<ShoppingBasket />} title="Total Supermarkets" value={stats.total.toString()} />
                <StatBox icon={<CheckCircle2 />} title="Active" value={stats.active.toString()} color="green" />
                <StatBox icon={<Clock />} title="Pending Verification" value={stats.pending.toString()} color="amber" />
                <StatBox icon={<XCircle />} title="Suspended" value={stats.suspended.toString()} color="red" />
                <StatBox icon={<TrendingUp />} title="Avg Rating" value={stats.avgRating.toString()} color="purple" />
            </div>

            {/* FILTERS */}
            <div className="bg-white rounded-xl border p-4 mb-6">
                <div className="flex justify-between mb-4">
                    <h3 className="font-semibold">Filters</h3>
                    <button className="text-sm text-gray-500 hover:underline">Clear All</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Dropdown label="Status" />
                    <Dropdown label="City" />
                    <Dropdown label="Rating" />
                    <Dropdown label="Branches" />
                    <Dropdown label="Wallet Balance" />
                    <Dropdown label="Join Date" />
                </div>
            </div>

            {/* HEADER BAR */}
            <div className="bg-white rounded-xl border p-4 mb-4 flex flex-wrap justify-between items-center gap-2">
                <h3 className="font-semibold">Supermarket</h3>
                <div className="flex flex-wrap items-center gap-2">
                    <HeaderButton icon={<Columns />} text="Columns" />
                    <HeaderButton icon={<Download />} text="Export CSV" />
                    <button
                        onClick={() => router.push("/dashboard/groceries/new")}
                        className="bg-yellow-400 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 hover:bg-yellow-500"
                    >
                        <Plus className="w-4 h-4" />
                        Add Grocery
                    </button>
                    <button className="bg-purple-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 hover:bg-purple-800">
                        <RefreshCcw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl border overflow-x-auto hidden md:block">
                <table className="min-w-[900px] w-full table-auto text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr className="text-gray-600 text-xs">
                            <th className="px-3 py-3"></th>
                            <th className="px-3 py-3 font-medium text-left">NAME</th>
                            <th className="px-3 py-3 font-medium text-left">LOCATION</th>

                            <th className="px-3 py-3 font-medium text-left">Status</th>
                            <th className="px-3 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {groceries.map((g) => (
                            <tr key={g.id} className="border-b hover:bg-gray-50 transition">
                                <td className="px-3 py-3">
                                    <input type="checkbox" />
                                </td>


                                {/* Restaurant */}
                                <td className="px-3 py-3 align-top">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden flex-shrink-0">
                                            <Image
                                                src={g.image ?? "/rest-thumb-1.png"}
                                                alt={g.name}
                                                width={48}
                                                height={48}
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm md:text-base">{g.name}</div>
                                            <div className="text-xs text-gray-400">#{g.id.toUpperCase()}</div>
                                        </div>
                                    </div>
                                </td>

                                {/* Location */}
                                <td className="px-3 py-3 align-top">
                                    <div className="font-medium">{g.city ?? "N/A"}</div>
                                    <div className="text-xs text-gray-400">{g.location ?? "N/A"}</div>
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
        </div>
    );
}

/* --- COMPONENTS --- */
type ColorType = "indigo" | "green" | "amber" | "red" | "purple";

function StatBox({
  icon,
  title,
  value,
  color = "indigo",
}: {
  icon: React.ReactNode;  // ✅ changed from 'any' to React.ReactNode
  title: string;
  value: string;
  color?: ColorType;
}) {
  const colors: Record<ColorType, string> = {
    indigo: "text-indigo-600",
    green: "text-green-600",
    amber: "text-amber-600",
    red: "text-red-600",
    purple: "text-purple-600",
  };
    return (
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3 shadow-sm">
            <div className={`p-2 rounded bg-gray-50 ${colors[color]}`}>{icon}</div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-xl font-semibold">{value}</p>
            </div>
        </div>
    );
}

function Dropdown({ label }: { label: string }) {
    return (
        <select className="border rounded-lg px-3 py-2 text-sm bg-white w-full">
            <option>All {label}</option>
        </select>
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
