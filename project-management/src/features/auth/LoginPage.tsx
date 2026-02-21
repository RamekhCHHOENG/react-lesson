import { useState, type FormEvent } from "react"
import { useAuth } from "@/store/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState("admin@projecthub.com")
  const [password, setPassword] = useState("admin123")
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
    setTimeout(() => {
      const result = login(email.trim(), password)
      if (!result.success) {
        setError(result.error || "Login failed")
      }
      setLoading(false)
    }, 400)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFBFC] p-4">
      {/* Atlassian-style top logo */}
      <div className="flex flex-col items-center mb-8">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mb-6">
          <rect width="40" height="40" rx="8" fill="#0052CC" />
          <path d="M12 28L18 12h4l6 16h-4l-1.2-3.5h-7.6L14 28h-2zm5.8-6.5h4.4L20 14.5l-2.2 7z" fill="white"/>
        </svg>
        <h1 className="text-[#172B4D] text-base font-normal">Log in to your account</h1>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-[400px] shadow-lg border-0 shadow-black/8 rounded-[3px]">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-2 rounded bg-[#FFEBE6] text-[#DE350B] px-3 py-2.5 text-sm border border-[#DE350B]/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-[#6B778C] uppercase tracking-wide">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                className="h-10 rounded-[3px] border-[#DFE1E6] focus-visible:border-[#4C9AFF] focus-visible:ring-[#4C9AFF]"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-[#6B778C] uppercase tracking-wide">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="pr-10 h-10 rounded-[3px] border-[#DFE1E6] focus-visible:border-[#4C9AFF] focus-visible:ring-[#4C9AFF]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B778C] hover:text-[#172B4D] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-10 rounded-[3px] bg-[#0052CC] hover:bg-[#0065FF] text-white font-medium"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : (
                "Log in"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer links like Atlassian */}
      <div className="mt-6 text-center space-y-2">
        <p className="text-xs text-[#6B778C]">
          Demo credentials are pre-filled. Click &ldquo;Log in&rdquo; to continue.
        </p>
      </div>
    </div>
  )
}
