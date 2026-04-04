import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  AppWindow, Search, GitBranch, MessageSquare, BarChart3,
  Calendar, Clock, FileText, Zap, Shield, Globe, Palette,
  Activity, Bot, Database, ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface App {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  category: string
  installed: boolean
}

const APPS: App[] = [
  { id: "1", name: "GitHub Integration", description: "Link commits, branches and PRs to Jira issues", icon: GitBranch, color: "bg-gray-800", category: "Developer Tools", installed: true },
  { id: "2", name: "Slack Notifications", description: "Get Jira updates directly in Slack channels", icon: MessageSquare, color: "bg-purple-600", category: "Communication", installed: true },
  { id: "3", name: "Power Reports", description: "Advanced reporting and analytics dashboards", icon: BarChart3, color: "bg-blue-600", category: "Reporting", installed: false },
  { id: "4", name: "Calendar Sync", description: "Sync due dates and sprints to Google Calendar", icon: Calendar, color: "bg-green-600", category: "Productivity", installed: false },
  { id: "5", name: "Time Tracker", description: "Track time spent on issues with automatic logging", icon: Clock, color: "bg-orange-600", category: "Productivity", installed: true },
  { id: "6", name: "Confluence Pages", description: "Embed and link Confluence pages in your project", icon: FileText, color: "bg-blue-500", category: "Documentation", installed: true },
  { id: "7", name: "Automation Rules", description: "Automate workflows with custom rules and triggers", icon: Zap, color: "bg-yellow-600", category: "Automation", installed: false },
  { id: "8", name: "Security Scanner", description: "Scan code for vulnerabilities from Jira issues", icon: Shield, color: "bg-red-600", category: "Security", installed: false },
  { id: "9", name: "Figma Designs", description: "Attach Figma designs and prototypes to issues", icon: Palette, color: "bg-pink-600", category: "Design", installed: false },
  { id: "10", name: "CI/CD Pipeline", description: "Monitor build and deployment status", icon: Activity, color: "bg-teal-600", category: "Developer Tools", installed: true },
  { id: "11", name: "AI Assistant", description: "AI-powered task summaries and smart suggestions", icon: Bot, color: "bg-indigo-600", category: "AI & ML", installed: false },
  { id: "12", name: "Database Manager", description: "Manage database migrations linked to issues", icon: Database, color: "bg-slate-600", category: "Developer Tools", installed: false },
]

const CATEGORIES = ["All", "Developer Tools", "Communication", "Productivity", "Reporting", "Documentation", "Automation", "Security", "Design", "AI & ML"]

export default function AppsPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [apps, setApps] = useState(APPS)

  const filtered = apps.filter((app) => {
    if (search && !app.name.toLowerCase().includes(search.toLowerCase()) && !app.description.toLowerCase().includes(search.toLowerCase())) return false
    if (category !== "All" && app.category !== category) return false
    return true
  })

  const toggleInstall = (id: string) => {
    setApps((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a
        const next = { ...a, installed: !a.installed }
        toast.success(next.installed ? `${a.name} installed` : `${a.name} uninstalled`)
        return next
      })
    )
  }

  const installedCount = apps.filter((a) => a.installed).length

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <AppWindow className="h-6 w-6 text-primary" />
            Apps
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{installedCount} apps installed · Browse the marketplace</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Globe className="h-4 w-4" />
          Marketplace
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search apps..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.slice(0, 6).map((cat) => (
            <Button key={cat} variant={category === cat ? "secondary" : "ghost"} size="sm" className="text-xs font-bold" onClick={() => setCategory(cat)}>
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* App Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((app) => (
          <Card key={app.id} className="group hover:border-primary/30 transition-all hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-md", app.color)}>
                  <app.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold truncate">{app.name}</h3>
                    {app.installed && <Badge variant="outline" className="text-[9px] bg-green-500/10 text-green-600 border-green-500/30">Installed</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{app.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">{app.category}</span>
                    <Button
                      variant={app.installed ? "outline" : "default"}
                      size="sm"
                      className="h-7 text-xs font-bold"
                      onClick={() => toggleInstall(app.id)}
                    >
                      {app.installed ? "Uninstall" : "Install"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
