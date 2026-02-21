import { useState, type FormEvent } from "react"
import { useAuth } from "@/store/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FolderKanban, Eye, EyeOff, AlertCircle } from "lucide-react"

export default function LoginPage() {
 const { login } = useAuth()
 const [email, setEmail] = useState("")
 const [password, setPassword] = useState("")
 const [showPassword, setShowPassword] = useState(false)
 const [error, setError] = useState("")
 const [loading, setLoading] = useState(false)

 const handleSubmit = (e: FormEvent) => {
 e.preventDefault()
 setError("")

 if (!email.trim() || !password.trim()) {
 setError("Please fill in all fields")
 return
 }

 setLoading(true)

 // Simulate a brief delay for UX
 setTimeout(() => {
 const result = login(email.trim(), password)
 if (!result.success) {
 setError(result.error || "Login failed")
 }
 setLoading(false)
 }, 400)
 }

 return (
 <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
 <div className="w-full max-w-md">
 {/* Logo / Brand */}
 <div className="flex flex-col items-center mb-8">
 <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground mb-4 shadow-lg">
 <FolderKanban className="w-7 h-7" />
 </div>
 <h1 className="text-2xl font-bold tracking-tight">ProjectHub</h1>
 <p className="text-muted-foreground text-sm mt-1">Project Management Dashboard</p>
 </div>

 {/* Login Card */}
 <Card className="shadow-lg border-0 shadow-black/5">
 <CardHeader className="text-center pb-4">
 <CardTitle className="text-xl">Welcome back</CardTitle>
 <CardDescription>Sign in to your account to continue</CardDescription>
 </CardHeader>
 <CardContent>
 <form onSubmit={handleSubmit} className="space-y-4">
 {/* Error Alert */}
 {error && (
 <div className="flex items-center gap-2 rounded-lg bg-destructive/10 text-destructive px-3 py-2.5 text-sm">
 <AlertCircle className="w-4 h-4 shrink-0" />
 <span>{error}</span>
 </div>
 )}

 {/* Email */}
 <div className="space-y-2">
 <Label htmlFor="email">Email</Label>
 <Input
 id="email"
 type="email"
 placeholder="admin@projecthub.com"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 autoComplete="email"
 autoFocus
 />
 </div>

 {/* Password */}
 <div className="space-y-2">
 <Label htmlFor="password">Password</Label>
 <div className="relative">
 <Input
 id="password"
 type={showPassword ? "text" : "password"}
 placeholder="••••••••"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 autoComplete="current-password"
 className="pr-10"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
 tabIndex={-1}
 >
 {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 </div>

 {/* Submit */}
 <Button type="submit" className="w-full" size="lg" disabled={loading}>
 {loading ? (
 <span className="flex items-center gap-2">
 <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 Signing in...
 </span>
 ) : (
 "Sign in"
 )}
 </Button>
 </form>

 {/* Hint */}
 <div className="mt-6 pt-4 border-t">
 <p className="text-xs text-muted-foreground text-center">
 <span className="font-medium">Demo credentials:</span>{" "}
 admin@projecthub.com / admin123
 </p>
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 )
}
