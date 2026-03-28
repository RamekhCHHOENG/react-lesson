import { Bell, ChevronDown, CircleHelp, Search, Settings, Grid3X3, Sun, Moon, Map, Activity, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useUnreadCount } from "@/hooks/useNotifications"
import { getInitials } from "@/lib/utils"
import { useAuth } from "@/store/auth"
import { useTheme } from "@/components/theme-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"


interface TopNavProps {
  onSearchClick?: () => void
  onMenuClick?: () => void
  onCreateClick?: () => void
}

export function TopNav({ onCreateClick, onSearchClick }: TopNavProps) {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const { data: unreadData } = useUnreadCount()
  const unreadCount = unreadData?.count ?? 0

  return (
    <header className="border-b border-border/80 bg-background/95 backdrop-blur-md px-4 py-1 flex items-center h-[56px] justify-between sticky top-0 z-[100]">
      <div className="flex items-center gap-1">
        {/* App Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
             <button className="flex h-8 w-8 items-center justify-center rounded-[3px] text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-all outline-none">
               <Grid3X3 className="h-5 w-5" />
             </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[320px] p-4 bg-background border border-border shadow-2xl rounded-[4px] mt-2">
             <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Switch to</span>
                <span className="text-xs font-semibold text-primary cursor-pointer hover:underline">Manage</span>
             </div>
             <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-3 p-2 rounded-[3px] hover:bg-secondary/60 cursor-pointer transition-colors group">
                   <div className="h-8 w-8 bg-[#0052cc] rounded-[3px] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform"><Map className="h-4 w-4" /></div>
                   <span className="text-sm font-bold text-foreground/90">Jira</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-[3px] hover:bg-secondary/60 cursor-pointer transition-colors group">
                   <div className="h-8 w-8 bg-blue-600 rounded-[3px] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform"><span className="text-xs font-bold">C</span></div>
                   <span className="text-sm font-bold text-foreground/90">Confluence</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-[3px] hover:bg-secondary/60 cursor-pointer transition-colors group">
                   <div className="h-8 w-8 bg-green-600 rounded-[3px] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform"><Activity className="h-4 w-4" /></div>
                   <span className="text-sm font-bold text-foreground/90">Opsgenie</span>
                </div>
             </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Logo */}
        <div 
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-[3px] hover:bg-secondary/50 cursor-pointer transition-all mx-1 group outline-none"
          onClick={() => navigate("/")}
        >
           <div className="h-7 w-7 rounded-[3px] bg-[#0052cc] flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
             <svg viewBox="0 0 24 24" fill="white" className="h-4.5 w-4.5">
               <path d="M11.5 2C11.5 2.55 11.05 3 10.5 3H3C2.45 3 2 3.45 2 4V11.5H10.5C11.05 11.5 11.5 11.05 11.5 10.5V2ZM12.5 2V10.5C12.5 11.05 12.95 11.5 13.5 11.5H22V4C22 3.45 21.55 3 21 3H13.5C12.95 3 12.5 2.55 12.5 2ZM11.5 12.5V21C11.5 21.55 11.05 22 10.5 22H2V13.5C2 12.95 2.45 12.5 3 12.5H11.5ZM13.5 12.5C12.95 12.5 12.5 12.95 12.5 13.5V22H21C21.55 22 22 21.55 22 21V13.5C22 12.95 21.55 12.5 21 12.5H13.5Z" />
             </svg>
           </div>
           <span className="text-xl font-bold tracking-tight text-foreground/90 group-aria-selected:text-primary">Jira</span>
        </div>

        {/* Mega Menus */}
        <nav className="hidden xl:flex items-center gap-1 ml-2">
          
          <DropdownMenu>
             <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-[32px] px-3 font-bold text-[14px] text-muted-foreground/90 hover:text-foreground hover:bg-secondary/60 rounded-[3px] group outline-none">
                   Your work <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="start" className="w-[300px] border border-border shadow-xl rounded-[4px] mt-1 p-0">
                <div className="p-4">
                   <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-2 mb-2 block">Recent Projects</span>
                   <div className="flex items-center gap-3 p-2 hover:bg-secondary/40 rounded-[3px] cursor-pointer group/item">
                       <div className="h-6 w-6 bg-orange-500 rounded-[3px] flex items-center justify-center text-[10px] text-white font-bold shadow-sm group-hover/item:scale-110 transition-transform">M</div>
                       <div className="flex flex-col">
                           <span className="text-[13px] font-bold text-foreground">My Software Team</span>
                           <span className="text-[11px] font-semibold text-muted-foreground">Classic Software Project</span>
                       </div>
                   </div>
                </div>
                <DropdownMenuSeparator />
                <div className="p-2">
                   <DropdownMenuItem className="text-sm font-semibold cursor-pointer">Go to your work page</DropdownMenuItem>
                </div>
             </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
             <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-[32px] px-3 font-bold text-[14px] text-muted-foreground/90 hover:text-foreground hover:bg-secondary/60 rounded-[3px] group outline-none">
                   Projects <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="start" className="w-[300px] border border-border shadow-xl rounded-[4px] mt-1 p-0">
                <div className="p-4">
                   <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-2 mb-2 block">Recent</span>
                   <div className="flex items-center gap-3 p-2 hover:bg-secondary/40 rounded-[3px] cursor-pointer group/item">
                       <div className="h-6 w-6 bg-orange-500 rounded-[3px] flex items-center justify-center text-[10px] text-white font-bold shadow-sm group-hover/item:scale-110 transition-transform">M</div>
                       <div className="flex flex-col">
                           <span className="text-[13px] font-bold text-foreground">My Software Team</span>
                           <span className="text-[11px] font-semibold text-muted-foreground">Classic Software Project</span>
                       </div>
                   </div>
                   <div className="flex items-center gap-3 p-2 hover:bg-secondary/40 rounded-[3px] cursor-pointer group/item mt-1">
                       <div className="h-6 w-6 bg-blue-500 rounded-[3px] flex items-center justify-center text-[10px] text-white font-bold shadow-sm group-hover/item:scale-110 transition-transform">A</div>
                       <div className="flex flex-col">
                           <span className="text-[13px] font-bold text-foreground">Agile Development</span>
                           <span className="text-[11px] font-semibold text-muted-foreground">Team-managed Software</span>
                       </div>
                   </div>
                </div>
                <DropdownMenuSeparator />
                <div className="p-2">
                   <DropdownMenuItem className="text-sm font-semibold cursor-pointer" onClick={() => navigate('/projects')}>View all projects</DropdownMenuItem>
                   <DropdownMenuItem className="text-sm font-semibold cursor-pointer" onClick={() => navigate('/projects')}>Create project</DropdownMenuItem>
                </div>
             </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" className="h-[32px] px-3 font-bold text-[14px] text-muted-foreground/90 hover:text-foreground hover:bg-secondary/60 rounded-[3px] outline-none">
             Filters
          </Button>
          <Button variant="ghost" className="h-[32px] px-3 font-bold text-[14px] text-muted-foreground/90 hover:text-foreground hover:bg-secondary/60 rounded-[3px] outline-none">
             Dashboards
          </Button>
          <Button variant="ghost" className="h-[32px] px-3 font-bold text-[14px] text-muted-foreground/90 hover:text-foreground hover:bg-secondary/60 rounded-[3px] outline-none">
             Teams
          </Button>
          <Button variant="ghost" className="h-[32px] px-3 font-bold text-[14px] text-muted-foreground/90 hover:text-foreground hover:bg-secondary/60 rounded-[3px] outline-none">
             Apps
          </Button>

          <Button
            className="ml-2 h-[32px] rounded-[3px] bg-[#0c66e4] hover:bg-[#0055cc] px-4 text-[14px] font-bold text-white shadow-lg shadow-[#0c66e4]/20 active:scale-95 transition-all outline-none"
            onClick={onCreateClick}
          >
            Create
          </Button>
        </nav>
      </div>

      <div className="flex items-center flex-1 justify-end gap-2">
        {/* Global Search */}
        <div className="relative group w-full max-w-[340px] ml-4">
           <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
           <input
             type="text"
             placeholder="Search"
             onClick={onSearchClick}
             className="h-[32px] w-full rounded-[3px] border border-border/60 bg-input pl-10 pr-4 text-sm text-foreground transition-all duration-200 hover:border-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none font-medium placeholder:font-normal"
           />
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-1.5 ml-2">
           <button
             type="button"
             onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
             className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-all outline-none"
           >
             {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
           </button>

           <div className="flex h-8 items-center gap-1 text-muted-foreground">
              <button 
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-secondary relative transition-colors outline-none"
                onClick={() => navigate("/notifications")}
              >
                 <Bell className="h-[18px] w-[18px]" />
                 {unreadCount > 0 && <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive border-[1.5px] border-background shadow-sm" />}
              </button>
              <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors outline-none">
                 <CircleHelp className="h-[18px] w-[18px]" />
              </button>
              <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors outline-none">
                 <Settings className="h-[18px] w-[18px]" />
              </button>
           </div>

           {/* User Profile */}
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="ml-1 group bg-transparent border-none outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full">
                  <Avatar className="h-[30px] w-[30px] ring-2 ring-background transition-all group-hover:ring-primary/40 shadow-sm border border-border/10 cursor-pointer">
                    {user ? (
                      <>
                        <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} />
                        <AvatarFallback className="bg-orange-600 text-[10px] font-bold text-white uppercase">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback className="bg-secondary text-[10px] font-bold text-muted-foreground uppercase">
                        ?
                      </AvatarFallback>
                    )}
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[280px] p-0 rounded-[4px] border border-border shadow-2xl animate-in slide-in-from-top-2 duration-200 mt-1">
                {user ? (
                  <>
                    <div className="p-4 bg-secondary/10 flex items-center gap-4">
                       <Avatar className="h-12 w-12 rounded-[3px]">
                         <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} />
                         <AvatarFallback className="bg-orange-600 text-lg font-bold text-white rounded-[3px]">{getInitials(user.full_name)}</AvatarFallback>
                       </Avatar>
                       <div className="min-w-0">
                          <p className="text-base font-bold text-foreground truncate block">{user.full_name}</p>
                          <p className="text-[13px] font-medium text-muted-foreground truncate block">{user.email}</p>
                       </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="px-4 py-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary/10">Atlassian</DropdownMenuLabel>
                    <DropdownMenuGroup className="py-1">
                       <DropdownMenuItem className="px-4 py-2.5 text-sm font-semibold focus:bg-secondary cursor-pointer" onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
                       <DropdownMenuItem className="px-4 py-2.5 text-sm font-semibold focus:bg-secondary cursor-pointer">Account settings</DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup className="py-1">
                       <DropdownMenuItem className="px-4 py-2.5 text-sm font-semibold focus:bg-secondary cursor-pointer flex justify-between items-center group">
                          Theme
                          <div className="flex items-center gap-2 opacity-60">
                             <span className="text-[11px] uppercase tracking-widest">{theme}</span>
                             <ChevronDown className="h-3.5 w-3.5 -rotate-90 group-hover:opacity-100" />
                          </div>
                       </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup className="py-1">
                       <DropdownMenuItem 
                          className="px-4 py-2.5 text-sm font-bold text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer flex items-center justify-between"
                          onClick={() => logout()}
                       >
                          Log out
                          <LogOut className="h-4 w-4 opacity-50" />
                       </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </>
                ) : (
                  <div className="p-4 flex flex-col items-center">
                    <p className="text-sm font-medium mb-3 text-center">You are currently in offline mode.</p>
                    <Button onClick={() => login("admin@example.com", "password")} className="w-full bg-[#0c66e4] hover:bg-[#0055cc] font-bold shadow-md shadow-[#0c66e4]/20">
                       Log in to Demo Account
                    </Button>
                  </div>
                )}
              </DropdownMenuContent>
           </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
