"use client";
import { JSX, useEffect, useState } from "react";
import { Users, UserCheck, Wallet, RefreshCw, Clock, Plus } from "lucide-react";
import { useRouter } from "next/navigation";


export default function UsersWalletPage() {
  const router = useRouter();

  type User = {
    avatar?: string;
    name: string;
    phone: string;
    email: string;
    location?: string;
    status: "Active" | "Suspended";
    wallet?: number;
    orders?: number;
    lastActive?: string;
  };

  const [users, setUsers] = useState<User[]>([]);

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalBalance: 0,
    dailyTransactions: 0,
    pendingPayouts: "no data yet",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [userSummariesRes, dashboardStatsRes, dailyTxRes] = await Promise.all([
          fetch("http://localhost:4000/api/v1/admin/user-summaries?page=1&size=10"),
          fetch("http://localhost:4000/api/v1/admin/dashboard-stats"),
          fetch("http://localhost:4000/api/v1/admin/daily-transaction-percentage"),
        ]);

        const userSummariesData = await userSummariesRes.json();
        const dashboardStatsData = await dashboardStatsRes.json();
        const dailyTxData = await dailyTxRes.json();

        if (userSummariesData?.data?.users) {
          setUsers(userSummariesData.data.users as User[]); // ✅ cast to known type
          setStats((prev) => ({
            ...prev,
            totalUsers: userSummariesData.data.pagination?.total ?? 0,
          }));
        }

        setStats((prev) => ({
          ...prev,
          totalUsers: dashboardStatsData?.data?.usersCount ?? prev.totalUsers,
          activeUsers: dashboardStatsData?.data?.activeUsersResult ?? 0,
          totalBalance: dashboardStatsData?.data?.totalBalanceResult ?? 0,
          dailyTransactions: dailyTxData?.data?.totalTransactions ?? 0,
        }));
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-semibold">Users & Wallet Management</h1>
        <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
          Live
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={<Users className="w-6 h-6 text-indigo-500" />}
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          subtitle="All registered users"
        />
        <StatCard
          icon={<UserCheck className="w-6 h-6 text-green-500" />}
          title="Active Users"
          value={stats.activeUsers.toLocaleString()}
          subtitle="Currently active"
        />
        <StatCard
          icon={<Wallet className="w-6 h-6 text-yellow-500" />}
          title="Total Wallet Balance"
          value={`₦${stats.totalBalance.toLocaleString()}`}
          subtitle="Across all users"
        />
        <StatCard
          icon={<RefreshCw className="w-6 h-6 text-purple-500" />}
          title="Daily Transactions"
          value={stats.dailyTransactions.toLocaleString()}
          subtitle="Today's activity"
        />
        <StatCard
          icon={<Clock className="w-6 h-6 text-amber-500" />}
          title="Pending Payouts"
          value={stats.pendingPayouts}
          subtitle="Requires approval"
        />
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left - Users Management */}
        <div className="bg-white border rounded-xl p-4 shadow-sm lg:col-span-2 flex flex-col">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
            <h2 className="text-lg font-semibold">Users Management</h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search users..."
                className="border rounded-lg px-3 py-2 text-sm w-full sm:w-56"
              />
              <button
                onClick={() => router.push("/dashboard/manual-wallet-credit")}
                className="bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 w-full sm:w-auto hover:bg-purple-800 transition"
              >
                <Plus className="w-4 h-4" /> Manual Credit
              </button>

            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
            <select className="border rounded-lg px-3 py-2 text-sm w-full sm:w-auto">
              <option>All Status</option>
              <option>Active</option>
              <option>Suspended</option>
            </select>
            <select className="border rounded-lg px-3 py-2 text-sm w-full sm:w-auto">
              <option>All Cities</option>
              <option>Lagos</option>
              <option>Abuja</option>
              <option>Minna</option>
            </select>
            <button className="border rounded-lg px-3 py-2 text-sm flex items-center gap-2 w-full sm:w-auto hover:bg-gray-100 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Export CSV
            </button>
          </div>

          {/* Users Table */}
          <div className="w-full overflow-x-auto rounded-lg border">
            <table className="min-w-full text-left text-sm border-collapse">
              <thead className="border-b bg-gray-100 text-gray-700">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Wallet</th>
                  <th className="py-3 px-4">Orders</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50 transition">
                    <td className="py-4 px-4 flex items-center gap-3 min-w-[180px]">
                      <img
                        src={user.avatar || "/default-avatar.png"}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="truncate">
                        <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">{user.phone}</p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 text-gray-700 whitespace-nowrap">{user.location || "N/A"}</td>
                    <td className="px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${user.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                          }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 font-semibold text-gray-800 whitespace-nowrap">
                      ₦{user.wallet?.toLocaleString() ?? 0}
                    </td>
                    <td className="px-4 text-gray-700 font-medium whitespace-nowrap">{user.orders ?? 0}</td>
                    <td className="px-4 text-gray-500 whitespace-nowrap">{user.lastActive ?? "N/A"}</td>
                    <td className="px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-4 text-gray-600 text-lg font-semibold">
                        <button
                          aria-label="View user details"
                          className="hover:text-purple-600 transition"
                          title="View"
                        >
                          👁
                        </button>
                        <button
                          aria-label="Credit wallet"
                          className="hover:text-purple-600 transition"
                          title="Credit"
                        >
                          💰
                        </button>
                        <button
                          aria-label="More actions"
                          className="hover:text-purple-600 transition"
                          title="More"
                        >
                          ⋮
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right - Quick Wallet Actions */}
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Quick Wallet Actions</h3>
          <button
            onClick={() => router.push("/dashboard/manual-wallet-credit")}
            className="bg-green-500 text-white w-full py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-green-600 transition"
          >
            <Plus className="w-4 h-4" /> Manual Credit
          </button>

        </div>
      </div>
    </div>
  );
}

/* Reusable Stat Card */
function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: JSX.Element;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 border shadow-sm flex items-start gap-3 min-w-[150px]">
      <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
      <div>
        <h3 className="text-gray-500 text-sm">{title}</h3>
        <p className="text-xl font-semibold">{value}</p>
        <p className="text-xs text-green-600 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}
