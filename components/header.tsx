"use client"

import { Button } from "@/components/ui/button"
import { createMeeting } from "@/app/actions"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Loader2, Plus, Clock, ChevronDown } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { useTime } from "@/components/time-provider"
import { getRecentMeetings, addRecentMeeting, RecentMeeting } from "@/lib/recent-meetings"
import { getRandomMeetingName } from "@/lib/random-nouns"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export function Header() {
    const router = useRouter()
    const [isCreating, setIsCreating] = useState(false)
    const { cities } = useTime()
    const [recentMeetings, setRecentMeetings] = useState<RecentMeeting[]>([])

    useEffect(() => {
        setRecentMeetings(getRecentMeetings())
    }, [])

    const handleCreateMeeting = async () => {
        setIsCreating(true)
        try {
            // Pre-populate meeting with timezones from the main comparison page
            const initialTimezones = cities.map(city => ({
                name: city.name,
                timezone: city.timezone,
            }))

            const meetingName = getRandomMeetingName()
            const id = await createMeeting(meetingName, initialTimezones)
            addRecentMeeting(id, meetingName)
            router.push(`/meet/${id}`)
        } catch (error) {
            console.error("Failed to create meeting", error)
            setIsCreating(false)
        }
    }

    const formatLastVisited = (timestamp: number) => {
        const diff = Date.now() - timestamp
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)
        if (minutes < 1) return "just now"
        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        return `${days}d ago`
    }

    return (
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                Global Time Zone Comparison
            </h1>
            <div className="flex items-center gap-2">
                <ModeToggle />

                {/* Recent Meetings Dropdown */}
                {recentMeetings.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1">
                                <Clock className="h-4 w-4" />
                                <span className="inline">Recent Meetings</span>
                                <ChevronDown className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 bg-card/95 backdrop-blur-md">
                            {recentMeetings.map(meeting => (
                                <DropdownMenuItem
                                    key={meeting.id}
                                    onClick={() => router.push(`/meet/${meeting.id}`)}
                                    className="flex justify-between items-center cursor-pointer"
                                >
                                    <span className="truncate mr-2">{meeting.title}</span>
                                    <span className="text-xs text-muted-foreground shrink-0">
                                        {formatLastVisited(meeting.lastVisited)}
                                    </span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                <Button
                    onClick={handleCreateMeeting}
                    disabled={isCreating}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    size="sm"
                >
                    {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    <span className="inline ml-2">New Meeting</span>
                </Button>
            </div>
        </header>
    )
}
