"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { toZonedTime } from "date-fns-tz"
import { CheckCircle2, XCircle } from "lucide-react"

interface MeetingTimeDetailsProps {
    selectedTime: Date
    participants: any[]
    viewerTimezone?: string
    is24Hour?: boolean
}

export function MeetingTimeDetails({ selectedTime, participants, viewerTimezone, is24Hour = false }: MeetingTimeDetailsProps) {
    // Use viewer's timezone for the header, or default to local
    let displayDate = selectedTime
    let timezoneName = "Local"

    if (viewerTimezone) {
        displayDate = toZonedTime(selectedTime, viewerTimezone)
        timezoneName = viewerTimezone.split("/")[1]?.replace("_", " ") || viewerTimezone
    }

    // Format Header
    const headerFormat = is24Hour ? "EEE, MMM d, HH:mm" : "EEE, MMM d, h:mm a"

    const availableParticipants = participants.filter(p => {
        return p.availability?.some((range: any) => {
            const start = new Date(range.startTime).getTime()
            const end = new Date(range.endTime).getTime()
            const time = selectedTime.getTime()
            return time >= start && time < end
        })
    })

    const unavailableParticipants = participants.filter(p => !availableParticipants.includes(p))

    return (
        <Card className="bg-card/50 backdrop-blur-md border-border h-full">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Selected Time</CardTitle>
                    <div className="text-right">
                        <div className="text-sm font-medium text-foreground">
                            {format(displayDate, headerFormat)}
                        </div>
                        <div className="text-xs text-muted-foreground">{timezoneName}</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="text-sm font-medium mb-2 text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Available ({availableParticipants.length})
                        </h4>
                        <ScrollArea className="h-[200px]">
                            <div className="space-y-2">
                                {availableParticipants.map(p => (
                                    <div key={p.id} className="text-sm flex flex-col p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                                        <span className="font-medium">{p.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {format(toZonedTime(selectedTime, p.timezone), is24Hour ? "HH:mm" : "h:mm a")}
                                        </span>
                                    </div>
                                ))}
                                {availableParticipants.length === 0 && (
                                    <div className="text-sm text-muted-foreground italic">No one available</div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium mb-2 text-destructive flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Unavailable ({unavailableParticipants.length})
                        </h4>
                        <ScrollArea className="h-[200px]">
                            <div className="space-y-2">
                                {unavailableParticipants.map(p => (
                                    <div key={p.id} className="text-sm flex flex-col p-2 rounded bg-destructive/10 border border-destructive/20">
                                        <span className="font-medium">{p.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {format(toZonedTime(selectedTime, p.timezone), is24Hour ? "HH:mm" : "h:mm a")}
                                        </span>
                                    </div>
                                ))}
                                {unavailableParticipants.length === 0 && (
                                    <div className="text-sm text-muted-foreground italic">Everyone is free!</div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
