"use client"

import { Button } from "@/components/ui/button"
import { createMeeting } from "@/app/actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, Plus } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export function Header() {
    const router = useRouter()
    const [isCreating, setIsCreating] = useState(false)

    const handleCreateMeeting = async () => {
        setIsCreating(true)
        try {
            const id = await createMeeting("New Meeting")
            router.push(`/meet/${id}`)
        } catch (error) {
            console.error("Failed to create meeting", error)
            setIsCreating(false)
        }
    }

    return (
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                Global Time Zone Comparison
            </h1>
            <div className="flex items-center gap-2">
                <ModeToggle />
                <Button
                    onClick={handleCreateMeeting}
                    disabled={isCreating}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    New Meeting
                </Button>
            </div>
        </header>
    )
}
