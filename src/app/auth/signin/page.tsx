import Link from "next/link"
import { TrendingUp, Users, Shield, Eye, Lock, Mail, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#4a1d5f] via-[#5b2c6f] to-[#3d1850] relative overflow-hidden">
        {/* Blur effects */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo and Title */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Cushy Access</h1>
            </div>
            <p className="text-purple-200 text-lg font-bold">Admin Dashboard</p>
          </div>

          {/* Features */}
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

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-600">Sign in to your admin account</p>
          </div>

          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@cushyaccess.com"
                  className="pl-10 h-12 bg-white border-gray-300"
                />
              </div>
            </div>

    
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-12 bg-white border-gray-300"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>

    
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Link href="/" className="text-sm text-purple-700 hover:text-purple-800 font-medium">
                Forgot password?
              </Link>
            </div>

            <Button className="w-full h-12 bg-[#5b2c6f] hover:bg-[#4a1d5f] text-white text-base font-medium">
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>

            

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              <span>Your session is secured with end-to-end encryption</span>
            </div>

            {/* Sign Up Link */}
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/" className="text-purple-700 hover:text-purple-800 font-medium">
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
