import { Rocket } from "lucide-react"
import { useLocation } from "react-router-dom"

export default function PlaceholderPage() {
  const location = useLocation()
  const pathName = location.pathname.split("/").filter(Boolean).pop() || "Page"
  const title = pathName.charAt(0).toUpperCase() + pathName.slice(1)

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-6 shadow-inner border border-primary/20">
        <Rocket className="h-10 w-10 text-primary animate-bounce-slow" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-3">{title}</h1>
      <p className="text-muted-foreground max-w-md text-sm font-medium leading-relaxed">
        We're working hard to bring you the new <strong className="text-foreground">{title}</strong> experience. 
        This module is scheduled for development in our upcoming roadmap phases. Check back soon!
      </p>
    </div>
  )
}
