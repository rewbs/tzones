"use client"

import { Github } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t border-border bg-card/30 backdrop-blur-md mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <span className="text-xs">
                            🤠 Vibe coded with a range of AI models. Use at your own risk.
                        </span>
                    </div>
                    <a
                        href="https://github.com/rewbs/tzones"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                        <Github className="w-4 h-4" />
                        <span>View on GitHub</span>
                    </a>
                </div>
            </div>
        </footer>
    )
}
