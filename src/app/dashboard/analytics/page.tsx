"use client"

import { useState } from "react"
import {
  TrendingUp,
  ShoppingBag,
  CircleDollarSign,
  Percent,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"

export default function OrdersPage() {
  const [city, setCity] = useState("all")
  const [category, setCategory] = useState("all")

  return (
    <div className="space-y-6 p-6">
      {/* Header Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="bg-[#5B2C6F] text-white hover:bg-[#4A2359]"
          >
            Today
          </Button>
          <Button variant="outline">7 Days</Button>
          <Button variant="outline">30 Days</Button>
          <Button variant="outline">90 Days</Button>
        </div>

        <div className="flex gap-3 items-center">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              <SelectItem value="lagos">Lagos</SelectItem>
              <SelectItem value="abuja">Abuja</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total GMV"
          value="₦2.4M"
          change="+12.5%"
          positive
          icon={<CircleDollarSign className="w-6 h-6 text-emerald-500" />}
        />
        <MetricCard
          title="Total Orders"
          value="1,247"
          change="+8.2%"
          positive
          icon={<ShoppingBag className="w-6 h-6 text-purple-500" />}
        />
        <MetricCard
          title="Avg Order Value"
          value="₦1,925"
          change="-2.1%"
          icon={<TrendingUp className="w-6 h-6 text-amber-500" />}
        />
        <MetricCard
          title="Take Rate"
          value="3.2%"
          change="+0.3%"
          positive
          icon={<Percent className="w-6 h-6 text-teal-500" />}
        />
      </div>

      {/* Graphs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-[300px]">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>GMV Trend</CardTitle>
            <Select defaultValue="daily">
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Daily" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-full text-gray-400">
            Chart Placeholder
          </CardContent>
        </Card>

        <Card className="h-[300px]">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Order Volume</CardTitle>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="pharmacy">Pharmacy</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-full text-gray-400">
            Chart Placeholder
          </CardContent>
        </Card>
      </div>

      {/* Bottom 3 Panels */}
   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Delivery Performance */}
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Delivery Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Avg Delivery Time</p>
            <Progress value={87} className="[&>*]:bg-emerald-500" />
            <p className="font-semibold text-gray-800">28 mins</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">On-Time Delivery</p>
            <Progress value={87} className="[&>*]:bg-dark-500" />
            <p className="text-xs text-gray-700 mt-1 font-medium">87%</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
            <Progress value={94} className="[&>*]:bg-amber-400" />
            <p className="text-xs text-gray-700 mt-1 font-medium">94%</p>
          </div>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Category Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center text-gray-400 h-[150px]">
          Chart Placeholder
        </CardContent>
      </Card>

      {/* Health Services */}
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Health Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">Consultations</p>
            <div className="text-right">
              <p className="font-semibold text-emerald-600 text-lg">142</p>
              <p className="text-xs text-emerald-500">+23% from last week</p>
            </div>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-700">Completion Rate</p>
              <p className="text-sm font-semibold text-purple-700">89%</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">Average wait: 8 mins</p>
          </div>

          <div className="bg-amber-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-700">Rx → Purchase</p>
              <p className="text-sm font-semibold text-amber-500">67%</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">Conversion rate</p>
          </div>
        </CardContent>
      </Card>
    </div>
      {/* Top Performing Vendors */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Top Performing Vendors</CardTitle>
          <Button variant="link" className="text-sm text-[#5B2C6F]">View All</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-b">
                <tr>
                  <th className="text-left px-4 py-2">Vendor</th>
                  <th className="text-left px-4 py-2">Category</th>
                  <th className="text-left px-4 py-2">Orders</th>
                  <th className="text-left px-4 py-2">Revenue</th>
                  <th className="text-left px-4 py-2">Rating</th>
                  <th className="text-left px-4 py-2">Avg Time</th>
                </tr>
              </thead>
              <tbody>
                <VendorRow
                  image="/mamas-kitchen.png"
                  name="Mama’s Kitchen"
                  category="Restaurant"
                  orders={342}
                  revenue="₦428,500"
                  rating={4.8}
                  avgTime="22 mins"
                />
                <VendorRow
                  image="/medplus.png"
                  name="MedPlus Pharmacy"
                  category="Pharmacy"
                  orders={187}
                  revenue="₦156,800"
                  rating={4.5}
                  avgTime="19 mins"
                />
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* --- Components --- */

function MetricCard({ title, value, change, positive, icon }: unknown) {
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6 flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold mb-1">{value}</h3>
          <p className={`text-sm ${positive ? "text-emerald-600" : "text-red-500"}`}>{change}</p>
        </div>
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}

function VendorRow({ image, name, category, orders, revenue, rating, avgTime }: any) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="flex items-center gap-3 px-4 py-3">
        <img src="https://picsum.photos/40" width={40} height={40} alt="test" />


        <span className="font-medium">{name}</span>
      </td>
      <td className="px-4 py-3 text-gray-600">{category}</td>
      <td className="px-4 py-3">{orders}</td>
      <td className="px-4 py-3 font-medium">{revenue}</td>
      <td className="px-4 py-3">⭐ {rating}</td>
      <td className="px-4 py-3">{avgTime}</td>
    </tr>
  )
}
