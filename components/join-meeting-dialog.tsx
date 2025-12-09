"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TimezoneCombobox } from "@/components/timezone-combobox"
import { joinMeeting } from "@/app/actions"

interface JoinMeetingDialogProps {
    meetingId: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onJoined: (participant: any) => void
}

export function JoinMeetingDialog({ meetingId, open, onOpenChange, onJoined }: JoinMeetingDialogProps) {
    const [name, setName] = useState("")
    const [timezone, setTimezone] = useState("")
    const [loading, setLoading] = useState(false)

    // Reset name when dialog opens
    useEffect(() => {
        if (open) {
            setName("")
        }
    }, [open])

    useEffect(() => {
        // Initialize with local timezone
        try {
            const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone
            setTimezone(localTz)
        } catch (e) {
            console.error("Failed to detect timezone", e)
            setTimezone("UTC")
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setLoading(true)
        try {
            const participant = await joinMeeting(meetingId, name, timezone)
            onJoined(participant)
        } catch (error) {
            console.error("Failed to join meeting:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Join Meeting</DialogTitle>
                    <DialogDescription>
                        Enter your name and confirm your timezone.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-3"
                                placeholder="Alice"
                                autoFocus
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="timezone" className="text-right">
                                Timezone
                            </Label>
                            <div className="col-span-3">
                                <TimezoneCombobox
                                    value={timezone}
                                    onValueChange={setTimezone}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading || !name.trim()}>
                            {loading ? "Joining..." : "Join"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
