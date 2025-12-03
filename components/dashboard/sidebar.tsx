"use client"

import Link from "next/link"
import Image from "next/image";
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Settings, FileText, TrendingUp, UserCheck, DollarSign } from "lucide-react"

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Adquisición & Funnel", href: "/dashboard/acquisition", icon: TrendingUp },
  { name: "Retención & Salud", href: "/dashboard/retention", icon: UserCheck },
  { name: "Unit Economics", href: "/dashboard/unit-economics", icon: DollarSign },
  { name: "Configuración", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Sidebar para desktop */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-sidebar hidden lg:block">
        <div className="flex h-full flex-col">
          
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-sidebar-border px-6">
            <Link href="https://jobbi.me/landing/jobber" className="flex items-center gap-2">
          {/* Contenedor del logo */}
         <div className="relative h-8 w-8 overflow-hidden rounded-lg">
          <Image
    src="/jobbi_png.png"
    alt="Jobbi Logo"
    fill
    sizes="32px"
    className="object-cover"
  />
          </div>
    {/* Texto */}
    <span className="text-lg font-semibold text-sidebar-foreground">
      Jobbi Analytics
    </span>
            </Link>
          </div>
          {/* Navegación */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Footer del sidebar */}
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              
              {/* Avatar / Iniciales */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent">
                <span className="text-sm font-semibold text-sidebar-accent-foreground">JB</span>
              </div>

              {/* Nombre + Email */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  JOBBI LLC
                </p>

                <a
                  href="mailto:info@jobbi.me"
                  className="text-xs text-muted-foreground truncate underline hover:text-sidebar-foreground"
                >
                  info@jobbi.com
                </a>
              </div>

            </div>
          </div>

        </div>
      </aside>
    </>
  )
}
