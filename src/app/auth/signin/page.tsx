
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { TrendingUp, Users, Shield, Eye, Lock, Mail, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ToastProvider, useToast } from "@/components/ui/toast-provider"

export default function LoginPage() {
  const router = useRouter()
  const [emailOrMobile, setEmailOrMobile] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { Toast, showToast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("https://staging.cushyaccess.com/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrMobile, password }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Login failed")

      const user = data.data?.user
      const token = data.data?.access_token
      if (!user) throw new Error("Invalid response: user not found")

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      showToast("Login successful!", "success")

      const role = user.userRole?.toLowerCase()
      if (role === "vendor") router.push("/vendor/dashboard")
      else if (role === "admin") router.push("/dashboard")
      else router.push("/user/dashboard")
    } catch (err: any) {
      showToast(err.message || "Login failed", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE (same as before) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#4a1d5f] via-[#5b2c6f] to-[#3d1850] relative overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Cushy Access</h1>
            </div>
            <p className="text-purple-200 text-lg font-bold">Admin Dashboard</p>
          </div>
          {/* Features (same as before) */}
          <div className="space-y-8 my-auto">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">Real-time Analytics</h3>
                <p className="text-purple-200">Monitor orders, revenue, and performance</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">User Management</h3>
                <p className="text-purple-200">Manage vendors, riders, and customers</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">Secure Access</h3>
                <p className="text-purple-200">Role-based permissions and audit logs</p>
              </div>
            </div>
          </div>

          <div className="flex gap-16">
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-1">50K+</div>
              <div className="text-purple-200">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-1">1.2M</div>
              <div className="text-purple-200">Orders Processed</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Email or Mobile */}
            <div className="space-y-2">
              <Label htmlFor="emailOrMobile" className="text-gray-700 font-medium">
                Email or Mobile
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="emailOrMobile"
                  type="text"
                  placeholder="vendor@example.com or 9153300907"
                  className="pl-10 h-12 bg-white border-gray-300"
                  value={emailOrMobile}
                  onChange={(e) => setEmailOrMobile(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-12 bg-white border-gray-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Link href="/forgot-password" className="text-sm text-purple-700 hover:text-purple-800 font-medium">
                Forgot password?
              </Link>
            </div>

             {Toast} {/* 👈 this makes it render on screen */}


            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#5b2c6f] hover:bg-[#4a1d5f] text-white text-base font-medium"
            >
              {loading ? "Signing In..." : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </Button>

            {/* Security Info */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              <span>Your session is secured with end-to-end encryption</span>
            </div>

            {/* Sign Up Link */}
            <div className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-purple-700 hover:text-purple-800 font-medium">
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
