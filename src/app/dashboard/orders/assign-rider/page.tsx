"use client"

import {
    MapPin,
    User,
    Truck,
    CheckCircle2,
    Clock,
    Star,
    Search,
    ArrowLeft,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function AssignRiderPage() {
    const [zone, setZone] = useState("All Zones")
    const [status, setStatus] = useState("Online Only")
    const router = useRouter();

    const riders = [
        {
            name: "Michael Adebayo",
            id: "RDR-001",
            distance: "2.1 km away",
            eta: "8 mins",
            rating: 4.8,
            reviews: 127,
            success: 98,
            online: true,
            available: true,
        },
        {
            name: "David Okafor",
            id: "RDR-005",
            distance: "3.2 km away",
            eta: "12 mins",
            rating: 4.9,
            reviews: 89,
            success: 95,
            online: true,
            available: true,
        },
        {
            name: "Emmanuel Okoro",
            id: "RDR-012",
            distance: "4.8 km away",
            eta: "18 mins",
            rating: 4.7,
            reviews: 156,
            success: 92,


        },
        {
            name: "Ahmed Musa",
            id: "RDR-018",
            distance: "5.4 km away",
            eta: "22 mins",
            rating: 4.6,
            reviews: 203,
            success: 94,
            online: true,
            available: true,
        },
    ]

    return (
        <div className="min-h-screen bg-gray-50 p-6 space-y-6">
            {/* Header */}
            {/* Header */}
            <div className="flex items-center justify-between py-3 px-1">
                {/* Left Section */}
                <div className="flex items-center gap-2">
                    {/* Back button */}
                    <button className="flex items-center gap-2 text-[#031B4E] hover:text-[#5B2C6F] transition">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-[#031B4E] hover:text-[#5B2C6F] transition cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-base font-semibold">Assign Rider</span>
                        </button>

                    </button>

                    {/* Status Badge */}
                    <span
                        className="
    bg-[#FF9053] text-white font-semibold rounded-full
    inline-flex items-center justify-center
    min-w-max
    text-[11px] px-3 py-[3px]
    sm:text-sm sm:px-4 sm:py-1.5
  "
                    >
                        Pending Assignment
                    </span>


                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">



                </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel - Order Details */}
                <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Order Details</h3>

                        <div className="text-sm space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Order ID</span>
                                <span className="text-[#5B2C6F] font-medium">#ORD-2024-001</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Customer</span>
                                <div className="flex items-center gap-2">
                                    <img
                                        src="https://i.pravatar.cc/40?img=12"
                                        alt="avatar"
                                        className="w-5 h-5 rounded-full object-cover"
                                    />
                                    <span className="text-gray-800 font-medium">John Doe</span>
                                </div>

                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Vendor</span>
                                <span className="text-gray-800 font-medium">Tasty Bites Restaurant</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Business Type</span>
                                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-[2px] rounded-full">Restaurant</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Amount</span>
                                <span className="font-semibold text-gray-900">₦12,500</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Delivery Type</span>
                                <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-[2px] rounded-full">Express</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Payment Status</span>
                                <span className="bg-green-100 text-green-600 text-xs px-2 py-[2px] rounded-full font-medium">
                                    Paid
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Delivery Address</h3>

                        <div className="space-y-4 text-sm">

                            {/* Pickup */}
                            <div>
                                <div className="flex items-center gap-2 font-medium text-gray-700">
                                    <MapPin className="w-4 h-4 text-purple-600" />
                                    <span>Pickup Location</span>
                                </div>

                                <div className="text-gray-600 ml-6 mt-1 leading-5">
                                    Tasty Bites Restaurant <br />
                                    12 Allen Avenue, Ikeja, Lagos
                                </div>
                            </div>

                            {/* Delivery */}
                            <div>
                                <div className="flex items-center gap-2 font-medium text-gray-700">
                                    <MapPin className="w-4 h-4 text-green-600" />
                                    <span>Delivery Location</span>
                                </div>

                                <div className="text-gray-600 ml-6 mt-1 leading-5">
                                    John Doe <br />
                                    45 Victoria Island, Lagos <br />
                                    +234 801 234 5678
                                </div>
                            </div>

                            {/* Distance & Time */}
                            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 ml-6 text-gray-700 text-sm space-y-1">
                                <p>
                                    <span className="font-medium">Estimated Distance:</span> 8.5 km
                                </p>
                                <p>
                                    <span className="font-medium">Estimated Time:</span> 25–30 mins
                                </p>
                            </div>

                        </div>
                    </div>

                </div>

                {/* Right Panel - Riders */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm p-5">
                    <div className="space-y-3">
                        {riders.map((rider, i) => (
                            <div
                                key={i}
                                className="flex flex-col sm:flex-row items-center justify-between border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                            >
                                {/* LEFT: Avatar + Name + Ratings */}
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img
                                            src={`https://i.pravatar.cc/60?img=${i + 1}`}
                                            alt="rider"
                                            className="w-12 h-12 rounded-full object-cover"
                                        />

                                        {/* ✅ Status dot positioned properly */}
                                        <span
                                            className={`absolute -bottom-[2px] left-[78%] w-4 h-4 rounded-full border-2 border-white ${rider.online
                                                ? "bg-green-500"
                                                : rider.available
                                                    ? "bg-green-300"
                                                    : "bg-orange-400"
                                                }`}
                                        ></span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">
                                            {rider.name}
                                        </p>
                                        <p className="text-xs text-gray-500">ID: {rider.id}</p>

                                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                                            <Star className="w-3 h-3 text-yellow-500" />
                                            {rider.rating} ({rider.reviews} reviews) • {rider.success}% success rate
                                        </div>
                                    </div>
                                </div>

                                {/* ✅ MIDDLE: Badges + Location + ETA CENTERED */}
                                <div className="flex flex-col items-center justify-center mt-3 sm:mt-0 text-xs text-gray-600">
                                    <div className="flex items-center gap-2">
                                        {rider.online ? (
                                            <span className="bg-green-100 text-green-800 text-[11px] px-2 py-[2px] rounded-full">
                                                Online
                                            </span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-700 text-[11px] px-2 py-[2px] rounded-full">
                                                I Active Job
                                            </span>
                                        )}

                                        {rider.available ? (
                                            <span className="bg-blue-100 text-blue-800 text-[11px] px-2 py-[2px] rounded-full">
                                                Available
                                            </span>
                                        ) : (
                                            <span className="bg-yellow-100 text-yellow-800 text-[11px] px-2 py-[2px] rounded-full">
                                                Busy
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-1">📍 {rider.distance}</p>
                                    <p>⏱ ETA: {rider.eta}</p>
                                </div>

                                {/* RIGHT: Button */}
                                <div className="mt-3 sm:mt-0">
                                    {rider.available ? (
                                        <Button className="bg-[#5B2C6F] hover:bg-[#4a2359] text-white text-xs px-4 py-1.5">
                                            Assign
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            className="border-gray-300 text-gray-700 text-xs px-4 py-1.5"
                                        >
                                            Queue
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>


                    {/* Footer Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-6">
                        <Button
                            variant="outline"
                            className="border-gray-300 text-gray-700 text-sm px-4 py-2"
                        >
                            Auto-Assign Best Match
                        </Button>
                        <Button
                            variant="outline"
                            className="border-gray-300 text-gray-700 text-sm px-4 py-2"
                        >
                            Broadcast to Zone
                        </Button>
                        <Button
                            variant="outline"
                            className="border-gray-300 text-gray-700 text-sm px-4 py-2"
                        >
                            Cancel
                        </Button>
                        <Button className="bg-[#F39C12] hover:bg-[#D68910] text-white text-sm px-4 py-2">
                            Send Assignment
                        </Button>
                    </div>
                </div>
            </div>





        </div>
    )
}
