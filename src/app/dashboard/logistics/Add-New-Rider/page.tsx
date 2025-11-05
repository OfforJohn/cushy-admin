"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Camera, IdCard, FileText, Car, Clock, Plus, Save, XCircle } from "lucide-react"

export default function AddNewRiderPage() {
  const [date, setDate] = useState<Date | undefined>(undefined)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Add New Rider</h1>
     
      </div>
         <p className="text-sm text-gray-500">
          Create a new rider profile and set up their delivery zone
        </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
       <div className="lg:col-span-2 space-y-8">
  {/* Rider Information */}
  <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-8">
    <h2 className="text-lg font-semibold text-gray-900">Rider Information</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input placeholder="Enter full name" />
      </div>
      <div className="space-y-2">
        <Label>Phone Number</Label>
        <Input placeholder="+234 801 234 5678" />
      </div>
      <div className="space-y-2">
        <Label>Email Address</Label>
        <Input placeholder="rider@example.com" />
      </div>
      <div className="space-y-2">
        <Label>Date of Birth</Label>
        <Input type="date" />
      </div>
      <div className="space-y-2">
        <Label>Gender</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Emergency Contact</Label>
        <Input placeholder="+234 801 234 5678" />
      </div>
    </div>
  </div>

  {/* Address Information */}
  <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-8">
    <h2 className="text-lg font-semibold text-gray-900">Address Information</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2 space-y-2">
        <Label>Street Address</Label>
        <Input placeholder="Enter street address" />
      </div>
      <div className="space-y-2">
        <Label>City</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lagos">Lagos</SelectItem>
            <SelectItem value="abuja">Abuja</SelectItem>
            <SelectItem value="minna">Minna</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>State</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lagos">Lagos</SelectItem>
            <SelectItem value="fct">FCT</SelectItem>
            <SelectItem value="niger">Niger</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>

  {/* Vehicle Information */}
  <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-8">
    <h2 className="text-lg font-semibold text-gray-900">Vehicle Information</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label>Vehicle Type</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select vehicle type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bike">Bike</SelectItem>
            <SelectItem value="car">Car</SelectItem>
            <SelectItem value="van">Van</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Vehicle Model</Label>
        <Input placeholder="e.g., Honda CB150" />
      </div>
      <div className="space-y-2">
        <Label>License Plate</Label>
        <Input placeholder="ABC-123-XY" />
      </div>
      <div className="space-y-2">
        <Label>Vehicle Color</Label>
        <Input placeholder="e.g., Red" />
      </div>
    </div>
  </div>

  {/* Banking Information */}
  <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-8">
    <h2 className="text-lg font-semibold text-gray-900">Banking Information</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label>Bank Name</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select bank" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gtbank">GTBank</SelectItem>
            <SelectItem value="access">Access Bank</SelectItem>
            <SelectItem value="uba">UBA</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Account Number</Label>
        <Input placeholder="0123456789" />
      </div>
      <div className="md:col-span-2 space-y-2">
        <Label>Account Name</Label>
        <Input placeholder="Account holder name" />
      </div>
    </div>
  </div>
</div>


        {/* Right Column */}
       <div className="space-y-6">
      {/* Required Documents */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">Required Documents</h2>

        {/* Profile Photo */}
        <div className="border border-dashed border-[#B88BD4] rounded-md py-6 px-2 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-purple-50 transition">
          <Camera className="w-6 h-6 text-gray-400 mb-2" />
          <p className="text-xs font-semibold text-gray-700">Profile Photo</p>
          <p className="text-[11px] text-gray-500 mt-1">Click to upload photo</p>
        </div>

        {/* National ID (NIN) */}
        <div className="border border-gray-200 rounded-md py-5 px-2 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition">
          <IdCard className="w-5 h-5 text-gray-400 mb-2" />
          <p className="text-xs font-semibold text-gray-700">National ID (NIN)</p>
          <p className="text-[11px] text-gray-500 mt-1">Upload NIN document</p>
        </div>

        {/* Driver’s License */}
        <div className="border border-gray-200 rounded-md py-5 px-2 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition">
          <FileText className="w-5 h-5 text-gray-400 mb-2" />
          <p className="text-xs font-semibold text-gray-700">Driver’s License</p>
          <p className="text-[11px] text-gray-500 mt-1">Upload license</p>
        </div>

        {/* Vehicle Papers */}
        <div className="border border-gray-200 rounded-md py-5 px-2 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition">
          <Car className="w-5 h-5 text-gray-400 mb-2" />
          <p className="text-xs font-semibold text-gray-700">Vehicle Papers</p>
          <p className="text-[11px] text-gray-500 mt-1">Upload vehicle documents</p>
        </div>
      </div>

      {/* Zone Assignment */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">Zone Assignment</h2>

        {/* Primary Zone */}
        <div>
          <Label className="text-xs font-medium text-gray-700">Primary Zone</Label>
          <Select>
            <SelectTrigger className="mt-1 h-9 text-sm">
              <SelectValue placeholder="Select zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zone-a">Zone A</SelectItem>
              <SelectItem value="zone-b">Zone B</SelectItem>
              <SelectItem value="zone-c">Zone C</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Secondary Zones */}
        <div>
          <Label className="text-xs font-medium text-gray-700">Secondary Zones</Label>
          <div className="flex flex-col mt-2 space-y-1">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" /> Victoria Island
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" /> Ikeja
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" /> Lekki
            </label>
          </div>
        </div>

        {/* Working Hours */}
        <div>
          <Label className="text-xs font-medium text-gray-700">Working Hours</Label>
          <div className="flex items-center gap-2 mt-2">
            <div className="relative w-1/2">
              <Input type="time" defaultValue="08:00" className="h-9 pr-8 text-sm" />
              <Clock className="absolute right-2 top-2.5 w-4 h-4 text-gray-400" />
            </div>
            <div className="relative w-1/2">
              <Input type="time" defaultValue="20:00" className="h-9 pr-8 text-sm" />
              <Clock className="absolute right-2 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
  <div className="border border-gray-200 rounded-lg p-5 flex flex-col items-center space-y-3 bg-white shadow-sm">
      <Button className="w-[250px] bg-[#5B2C6F] hover:bg-[#4a2359] text-white text-sm font-medium flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" />
        Create Rider
      </Button>

      <Button
        className="w-[250px] bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        Save as Draft
      </Button>

      <Button
        variant="outline"
        className="w-[250px] text-sm font-medium text-gray-600 border-gray-300 flex items-center justify-center gap-2"
      >
        <XCircle className="w-4 h-4" />
        Cancel
      </Button>
    </div>

    </div>
      </div>

    </div>
  )
}
