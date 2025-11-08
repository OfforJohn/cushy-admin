"use client";

import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  CheckCircle2,
  Hourglass,
  XCircle,
  ArrowUpRight,
  FileText,
  AlertTriangle,
  MoreHorizontal,
  Eye,
  Check,
} from "lucide-react";

/* ---------- Sample data ---------- */
const VENDORS = [
  {
    vendor: "Mama Cass Kitchen",
    id: "VEN-2024-078",
    type: "Restaurant",
    cac: "RC-1234567",
    nin: "12345678901",
    submitted: "Jan 20, 2024",
    overdue: "7 days overdue",
    status: "Pending Review",
    priority: "Urgent",
    kycFlags: ["docs", "missing_photo"],
  },
  {
    vendor: "HealthPlus Pharmacy",
    id: "VEN-2024-079",
    type: "Pharmacy",
    cac: "RC-2345678",
    nin: "PCN-123456",
    submitted: "Jan 22, 2024",
    overdue: "2 days ago",
    status: "Under Review",
    priority: "High",
    kycFlags: ["docs"],
  },
];

/* ---------- Component ---------- */
export default function VendorApprovalPage() {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [activeVendor, setActiveVendor] = useState<Vendor | null>(null);

  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

interface Vendor {
  vendor: string;
  id: string;
  type: string;
  cac: string;
  nin: string;
  submitted: string;
  overdue: string;
  status: string;
  priority: string;
  kycFlags: string[];
}


  const toggleRow = (id: string) =>
    setSelectedRows((s) => ({ ...s, [id]: !s[id] }));
const openApprove = (row: Vendor) => {
  setActiveVendor(row);
  setApproveOpen(true);
};

const openReject = (row: Vendor) => {
  setActiveVendor(row);
  setRejectOpen(true);
};

const openView = (row: Vendor) => {
  setActiveVendor(row);
  setViewOpen(true);
};


  return (
    <div className="min-h-screen bg-[#F6F7F8] p-4 sm:p-6 space-y-6 text-sans">
      {/* Top nav */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            className="w-full bg-white border border-gray-200 rounded-md px-10 py-2 text-sm placeholder-gray-400 focus:outline-none"
            placeholder="Search vendor or business name..."
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Review"
          value="31"
          subtitle="Avg 3.2 days"
          icon={<Hourglass className="w-5 h-5 text-yellow-500" />}
        />
        <StatCard
          title="Approved Today"
          value="12"
          subtitle={<span className="text-emerald-600 text-sm">↑ 47 this week</span>}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        />
        <StatCard
          title="Rejected This Week"
          value="8"
          subtitle="× Invalid KYC docs"
          icon={<XCircle className="w-5 h-5 text-red-500" />}
        />
        <StatCard
          title="Total Active Vendors"
          value="1,247"
          subtitle={<span className="text-emerald-600 text-sm">↑ 23 this month</span>}
          icon={<ArrowUpRight className="w-5 h-5 text-sky-500" />}
        />
      </div>

      {/* Quick actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="font-semibold text-gray-800">Quick Actions</div>
          <button className="bg-[#5B2C6F] text-white text-sm px-3 py-2 rounded-md">✓ Bulk Approve (5)</button>
          <button className="bg-[#E24545] text-white text-sm px-3 py-2 rounded-md">✕ Bulk Reject (2)</button>
          <button className="bg-gray-300 border border-gray-400 text-sm px-3 py-2 rounded-md hover:bg-gray-400">
  🔔 Send Reminders
</button>

        </div>

        <div>
      <button className="bg-gray-300 border border-gray-400 text-sm px-3 py-2 rounded-md flex items-center gap-2 w-full md:w-auto hover:bg-gray-400">
  <FileText className="w-4 h-4" /> Export KYC Report
</button>

        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SmallSelect label="All Status" />
          <SmallSelect label="All Business Types" />
          <SmallSelect label="All Cities" />
          <SmallSelect label="More Filters" icon />
        </div>

        <div className="text-sm text-gray-500 flex items-center gap-2 justify-end">
          Showing urgent reviews first
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b gap-2">
          <div className="text-sm font-medium">Vendor Approval Queue</div>
          <div className="text-sm text-gray-500">31 pending approvals</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-gray-50 text-gray-600 uppercase text-[12px]">
              <tr>
                <th className="p-3 w-8"><input type="checkbox" /></th>
                <th className="p-3 text-left">Vendor</th>
                <th className="p-3 text-left">Business Type</th>
                <th className="p-3 text-left">Registration</th>
                <th className="p-3 text-left">Submitted</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Priority</th>
                <th className="p-3 text-left">KYC Documents</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {VENDORS.map((v) => (
                <tr key={v.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={!!selectedRows[v.id]}
                      onChange={() => toggleRow(v.id)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-sm">
                        🍽
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{v.vendor}</div>
                        <div className="text-[12px] text-gray-500">ID: {v.id}</div>
                      </div>
                    </div>
                  </td>

                  <td className="p-3">
                    <span className="text-[12px] bg-orange-100 text-orange-600 px-3 py-1 rounded-full">{v.type}</span>
                  </td>

                  <td className="p-3 text-[13px] text-gray-700">
                    <div>CAC: {v.cac}</div>
                    <div className="text-xs text-gray-400">NIN: {v.nin}</div>
                  </td>

                  <td className="p-3 text-[13px]">
                    <div>{v.submitted}</div>
                    <div className="text-xs text-red-500">{v.overdue}</div>
                  </td>

                  <td className="p-3">
                    {v.status === "Pending Review" ? (
                      <span className="bg-yellow-100 text-yellow-700 text-[12px] px-3 py-1 rounded-full">Pending Review</span>
                    ) : (
                      <span className="bg-blue-100 text-blue-700 text-[12px] px-3 py-1 rounded-full">Under Review</span>
                    )}
                  </td>

                  <td className="p-3">
                    {v.priority === "Urgent" ? (
                      <span className="bg-red-100 text-red-700 text-[12px] px-3 py-1 rounded-full">Urgent</span>
                    ) : (
                      <span className="bg-blue-100 text-blue-700 text-[12px] px-3 py-1 rounded-full">High</span>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </div>
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        onClick={() => openApprove(v)}
                        className="bg-emerald-600 text-white text-sm px-3 py-1 rounded-md flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>

                      <button
                        onClick={() => openReject(v)}
                        className="bg-red-600 text-white text-sm px-3 py-1 rounded-md"
                      >
                        Reject
                      </button>

                      <button
                        onClick={() => openView(v)}
                        className="bg-white border border-gray-200 text-sm px-3 py-1 rounded-md"
                      >
                        <Eye className="w-4 h-4 inline-block mr-1" /> View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-xs text-gray-500">Showing 1–10 of 31</div>
          <div className="flex items-center gap-2">
            <button className="text-sm px-3 py-1 border rounded-md bg-white">Prev</button>
            <button className="text-sm px-3 py-1 border rounded-md bg-white">Next</button>
          </div>
        </div>
      </div>

      {/* Modals (unchanged, still responsive due to Tailwind defaults) */}
      {approveOpen && activeVendor && (
        <Modal onClose={() => setApproveOpen(false)} title="Approve Vendor">
          <div className="space-y-3">
            <div className="text-sm">You are about to approve:</div>
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="font-medium">{activeVendor.vendor}</div>
              <div className="text-xs text-gray-500">ID: {activeVendor.id}</div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm">Notify vendor:</label>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setApproveOpen(false)} className="px-4 py-2 rounded-md border">Cancel</button>
              <button
                onClick={() => {
                  setApproveOpen(false);
                  setActiveVendor(null);
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md"
              >
                Confirm Approve
              </button>
            </div>
          </div>
        </Modal>
      )}

      {rejectOpen && activeVendor && (
        <Modal onClose={() => setRejectOpen(false)} title="Reject Vendor">
          <div className="space-y-3">
            <div className="text-sm">Reason for rejection:</div>
            <textarea className="w-full p-3 border rounded-md min-h-[100px]" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setRejectOpen(false)} className="px-4 py-2 rounded-md border">Cancel</button>
              <button
                onClick={() => {
                  setRejectOpen(false);
                  setActiveVendor(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md"
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </Modal>
      )}

      {viewOpen && activeVendor && (
        <Modal onClose={() => setViewOpen(false)} title="Vendor Details">
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-medium">{activeVendor.vendor}</div>
              <div className="text-xs text-gray-500">ID: {activeVendor.id}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500">Business Type</div>
                <div className="font-medium">{activeVendor.type}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Registration</div>
                <div className="font-medium">CAC: {activeVendor.cac}</div>
                <div className="text-xs text-gray-400">NIN: {activeVendor.nin}</div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setViewOpen(false)} className="px-4 py-2 rounded-md border">Close</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- Helper Components ---------- */interface StatCardProps {
  title: string;
  value: string;
  subtitle: React.ReactNode;
  icon: React.ReactNode;
}

function StatCard({ title, value, subtitle, icon }: StatCardProps) {

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-50 rounded-md flex items-center justify-center">{icon}</div>
        <div>
          <div className="text-xs text-gray-500">{title}</div>
          <div className="text-2xl font-semibold">{value}</div>
          <div className="text-xs text-gray-400">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}
interface SmallSelectProps {
  label: string;
  icon?: boolean;
}

function SmallSelect({ label, icon }: SmallSelectProps) {

  return (
    <button className="bg-white border border-gray-200 px-3 py-2 rounded-md text-sm flex items-center gap-2 w-full sm:w-auto justify-between">
      <span>{label}</span>
      {icon ? <MoreHorizontal className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
    </button>
  );
}
interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}

function Modal({ children, onClose, title }: ModalProps) {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="relative w-full sm:w-[540px] bg-white rounded-lg shadow-xl p-5 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">{title}</div>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
