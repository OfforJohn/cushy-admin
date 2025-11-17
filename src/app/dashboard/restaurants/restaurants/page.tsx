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

type Restaurant = {
  id: string;
  name: string;
  slug?: string;
  owner: string;
  ownerAvatar?: string;
  phone?: string;
  email?: string;
  city?: string;
  location?: string;
  branches?: number;
  products?: number;
  status?: "Verified" | "Pending" | "Suspended" | "Inactive";
  image?: string;
};

export default function RestaurantsDashboard() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 387,
    verified: 342,
    pending: 28,
    suspended: 12,
    inactive: 5,
  });

  useEffect(() => {
    const mock: Restaurant[] = [
      {
        id: "rest-001",
        name: "Tasty Bites",
        owner: "Chukwudi Okafor",
        ownerAvatar: "/default-owner-1.png",
        phone: "+234 803 456 7890",
        email: "tasty@bites.com",
        city: "Lagos",
        location: "Victoria Island",
        branches: 3,
        products: 127,
        status: "Verified",
        image: "/rest-thumb-1.png",
      },
      {
        id: "rest-002",
        name: "Pizza Palace",
        owner: "Ahmed Ibrahim",
        ownerAvatar: "/default-owner-2.png",
        phone: "+234 805 234 5678",
        email: "info@pizzapalace.ng",
        city: "Abuja",
        location: "Wuse 2",
        branches: 5,
        products: 89,
        status: "Pending",
        image: "/rest-thumb-2.png",
      },
    ];

    setTimeout(() => {
      setRestaurants(mock);
      setLoading(false);
    }, 400);
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍽️</span>
          <h1 className="text-2xl font-semibold">Restaurants</h1>

          <select className="border rounded px-3 py-2 text-sm bg-white">
            <option>All Cities</option>
            <option>Lagos</option>
            <option>Abuja</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="search"
            placeholder="Search restaurants..."
            className="w-full md:w-72 rounded-full border px-4 py-2 text-sm bg-white"
          />

          <div className="flex items-center gap-2">
            <Image
              src="/default-admin-avatar.png"
              alt="admin"
              width={36}
              height={36}
              className="rounded-full"
            />
            <div className="text-sm">
              <p className="font-medium">Sarah Admin</p>
              <p className="text-gray-400 text-xs">SuperAdmin</p>
            </div>
          </div>
        </div>
      </div>

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
      <div className="bg-white rounded-xl border overflow-hidden mt-6">
        <div className="w-full overflow-x-auto">
          <table className="min-w-max text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-gray-600 text-xs">
                <th className="px-4 py-3 w-10 md:px-6 md:py-4">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-4 py-3 md:px-6 md:py-4 font-medium">RESTAURANT</th>
                <th className="px-4 py-3 md:px-6 md:py-4 font-medium">OWNER</th>
                <th className="px-4 py-3 md:px-6 md:py-4 font-medium">LOCATION</th>
                <th className="px-4 py-3 md:px-6 md:py-4 font-medium">CONTACT</th>
                <th className="px-4 py-3 md:px-6 md:py-4 font-medium text-center">
                  BRANCHES
                </th>
                <th className="px-4 py-3 md:px-6 md:py-4 font-medium text-center">
                  PRODUCTS
                </th>
                <th className="px-4 py-3 md:px-6 md:py-4 font-medium text-right">
                  STATUS
                </th>
              </tr>
            </thead>

            <tbody>
              {restaurants.map((r) => (
                <tr
                  key={r.id}
                  className="border-b hover:bg-gray-50/70 transition"
                >
                  <td className="px-4 py-4 md:px-6 md:py-5 align-top">
                    <input type="checkbox" className="rounded" />
                  </td>

                  <td className="px-4 py-4 md:px-6 md:py-5 align-top">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden">
                        <Image
                          src={r.image ?? "/rest-thumb-1.png"}
                          alt={r.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>

                      <div>
                        <div className="font-medium text-sm md:text-base">
                          {r.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          #{r.id.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* OWNER */}
                  <td className="px-4 py-4 md:px-6 md:py-5 align-top">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden">
                        <Image
                          src={r.ownerAvatar ?? "/default-owner-1.png"}
                          alt={r.owner}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>

                      <div>
                        <div className="text-sm font-medium">{r.owner}</div>
                        <div className="text-xs text-gray-400">Owner</div>
                      </div>
                    </div>
                  </td>

                  {/* LOCATION */}
                  <td className="px-4 py-4 md:px-6 md:py-5 align-top">
                    <div className="font-medium">{r.city}</div>
                    <div className="text-xs text-gray-400">{r.location}</div>
                  </td>

                  {/* CONTACT */}
                  <td className="px-4 py-4 md:px-6 md:py-5 align-top">
                    <div className="text-sm font-medium">{r.phone}</div>
                    <div className="text-xs text-gray-400">{r.email}</div>
                  </td>

                  {/* BRANCHES */}
                  <td className="px-4 py-4 md:px-6 md:py-5 align-top text-center">
                    <span className="font-medium">{r.branches}</span>
                  </td>

                  {/* PRODUCTS */}
                  <td className="px-4 py-4 md:px-6 md:py-5 align-top text-center">
                    <span className="font-medium">{r.products}</span>
                  </td>

                  {/* STATUS */}
                  <td className="px-4 py-4 md:px-6 md:py-5 align-top">
                    <div className="flex justify-end">
                      {r.status === "Verified" && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          ✓ Verified
                        </span>
                      )}
                      {r.status === "Pending" && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-600 text-xs rounded-full">
                          Pending
                        </span>
                      )}
                      {r.status === "Suspended" && (
                        <span className="px-3 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                          Suspended
                        </span>
                      )}
                      {r.status === "Inactive" && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      <p className="text-gray-400 text-xs mt-4">
        Showing {restaurants.length} restaurants
      </p>
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
