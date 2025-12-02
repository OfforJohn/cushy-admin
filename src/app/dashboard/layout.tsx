"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (<div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gray-50">


    {/* Backdrop overlay (only on mobile when sidebar is open) */}
    <div
      className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300
 ${sidebarOpen ? "block md:hidden" : "hidden"
        }`}
      onClick={() => setSidebarOpen(false)}
    />

    {/* Sidebar */}
<div
  className={`fixed z-50 top-0 left-0 h-screen w-64 shadow-lg transform transition-transform duration-300 ease-in-out
    overflow-y-auto
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
    md:translate-x-0 md:z-10`}
>
  <Sidebar />
</div>



    {/* Main content */}
    <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-64">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {children}
      </div>
    </div>

  </div>
  )
}
