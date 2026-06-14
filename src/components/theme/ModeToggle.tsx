"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sun, Moon, Monitor } from "lucide-react"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="w-[104px] h-8 rounded-xl bg-muted/10 animate-pulse border border-border/50" />
        )
    }

    return (
        <div className="flex items-center gap-0.5 bg-muted/20 border border-border/50 p-0.5 rounded-xl">
            <button
                type="button"
                onClick={() => setTheme("light")}
                className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                    theme === "light"
                        ? "bg-background shadow-sm text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                }`}
                title="Light Mode"
            >
                <Sun className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                    theme === "dark"
                        ? "bg-background shadow-sm text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                }`}
                title="Dark Mode"
            >
                <Moon className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                onClick={() => setTheme("system")}
                className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                    theme === "system"
                        ? "bg-background shadow-sm text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                }`}
                title="System Preference"
            >
                <Monitor className="h-3.5 w-3.5" />
            </button>
        </div>
    )
}
