"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import logo from '@/assets/logo.png'
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { loginApi } from "./api"

const loginFormSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
})

type LoginFormValues = z.infer<typeof loginFormSchema>

const defaultValues: Partial<LoginFormValues> = {
  username: "",
  password: "",
}

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues,
  })

  // Use environment variables for API endpoints and static token
  const Genarate_Token = process.env.NEXT_PUBLIC_API_URL_AUTH
  const Base_Url = process.env.NEXT_PUBLIC_API_URL

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    try {
      // Step 1: Generate authentication token
      const tokenResponse = await fetch(`http://wbassetmgmtservice.link/VYOMAUMSRestAPI/api/auth/generateToken`, {
        method: "POST",
        headers: {
          "Authorization": "Basic dGVzdDAwMDE6YWRtaW5AMTIz",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
      })

      if (!tokenResponse.ok) {
        throw new Error("Failed to generate token")
      }

      const tokenData = await tokenResponse.json()
      const token = tokenData.data.access_token

      // Step 2: Use loginApi for authentication
      const result = await loginApi({
        username: data.username,
        password: data.password,
        authToken: token,
        url: `${Base_Url}user/authentication`,
      })

      const authData = result

      // Check if user role is HR or ADMIN
      if (authData.data && (authData.data.userrole === "HR" || authData.data.userrole === "ADMIN")) {
        // The cookies for access_token are already set in loginApi.
        // If you want to set additional cookies:
        document.cookie = `admin_Id=${encodeURIComponent(authData.data.admin_id)};max-age=${60 * 60 * 24}`
        document.cookie = `username=${encodeURIComponent(authData.data.username)};max-age=${60 * 60 * 24}`
        document.cookie = `userRole=${encodeURIComponent(authData.data.userrole)};max-age=${60 * 60 * 24}`
        document.cookie = `userFullName=${encodeURIComponent(authData.data.userfullname)};max-age=${60 * 60 * 24}`

        toast.success("Login successful", {
          description: `Welcome, ${authData.data.userfullname}`,
        })

        router.push("/dashboard")
      } else {
        toast.error("Access denied", {
          description: "You don't have permission to access this system.",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Login failed", {
        description: "Invalid credentials or server error. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <Toaster />
      <div className="grid w-full lg:grid-cols-2 gap-8 max-w-5xl">
        <div className="hidden lg:flex flex-col justify-center p-8">
          <div className="flex items-center mb-8">
            <Image src={logo} alt="logo" width={40} height={40} className="rounded-full border mr-4" />
            <h1 className="text-3xl font-bold">Vyoma Innovus Global</h1>
          </div>
          <h2 className="text-4xl font-bold mb-4">Attendance Management Dashboard</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Track employee attendance, location data, and manage leave requests with our comprehensive dashboard.
          </p>
          <div className="relative h-64 w-full rounded-lg overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-card/80 to-transparent z-10 flex items-center p-8">
              <div className="max-w-xs">
                <h3 className="text-xl font-semibold mb-2">Real-time tracking</h3>
                <p className="text-sm text-muted-foreground">
                  View employee check-ins and check-outs as they happen, with precision location data.
                </p>
              </div>
            </div>
            <div className="absolute inset-0">
              <Image
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Office team working"
                fill
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <div className="flex items-center lg:hidden mb-2">
                <Image src={logo} alt="logo" width={20} height={20} className="rounded-full border-2 border-primary mr-2" />
                <span className="text-2xl font-bold">Vyoma Innovus Global</span>
              </div>
              <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
              <CardDescription>Enter your credentials to access the dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="hr0001" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="••••••••"
                              type={showPassword ? "text" : "password"}
                              {...field}
                              disabled={isLoading}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              <p className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} Vyoma Innovus Global. All rights reserved.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
