"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { JoinMeetingDialog } from "./join-meeting-dialog"
import { AvailabilityGrid } from "./availability-grid"
import { TimezoneCombobox } from "./timezone-combobox"
import { updateAvailability, updateParticipantTimezone, updateMeetingTitle } from "@/app/actions"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MeetingTimeline } from "./meeting-timeline"
import { ModeToggle } from "./mode-toggle"
import { Loader2, Pencil, Check, X, Users, Wifi, WifiOff } from "lucide-react"
import { MeetingTimeDetails } from "./meeting-time-details"
import { MeetingDiscordWidget } from "./meeting-discord-widget"
import { toZonedTime } from "date-fns-tz"
import { format, addMinutes } from "date-fns"
import { Copy, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { AblyProvider } from "./ably-provider"
import { useMeetingChannel } from "@/hooks/use-meeting-channel"

interface Participant {
    id: string
    name: string
    timezone: string
    availability: { startTime: Date; endTime: Date }[]
}

interface Meeting {
    id: string
    title: string
    participants: Participant[]
}

// Inner component that uses Ably hooks
function MeetingViewInner({ meeting, initialMeeting }: { meeting: Meeting; initialMeeting: Meeting }) {
    const [localParticipants, setLocalParticipants] = useState<Participant[]>(meeting.participants)
    const [participant, setParticipant] = useState<Participant | null>(null)
    const [showJoinDialog, setShowJoinDialog] = useState(false)
    const [isUpdatingTimezone, setIsUpdatingTimezone] = useState(false)
    const [is24Hour, setIs24Hour] = useState(false)

    // Title Edit State
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [optimisticTitle, setOptimisticTitle] = useState(meeting.title)
    const [editedTitle, setEditedTitle] = useState(meeting.title)
    const [isSavingTitle, setIsSavingTitle] = useState(false)

    // Sync prop changes to local state
    useEffect(() => {
        setOptimisticTitle(meeting.title)
        setEditedTitle(meeting.title)
    }, [meeting.title])

    // Default to next hour
    const [selectedTime, setSelectedTime] = useState(new Date())

    useEffect(() => {
        const now = new Date()
        now.setMinutes(0, 0, 0)
        now.setHours(now.getHours() + 1)
        setSelectedTime(now)
    }, [])

    // Handle remote availability updates
    const handleRemoteAvailabilityUpdate = useCallback((remoteParticipantId: string, slots: string[]) => {
        // Don't update if it's our own change
        if (remoteParticipantId === participant?.id) return

        // Convert slots back to availability ranges for the participant
        const sortedSlots = slots.sort()
        const ranges: { startTime: Date; endTime: Date }[] = []

        if (sortedSlots.length > 0) {
            let currentStart = new Date(sortedSlots[0])
            let currentEnd = addMinutes(currentStart, 30)

            for (let i = 1; i < sortedSlots.length; i++) {
                const slotTime = new Date(sortedSlots[i])
                if (slotTime.getTime() === currentEnd.getTime()) {
                    currentEnd = addMinutes(slotTime, 30)
                } else {
                    ranges.push({ startTime: currentStart, endTime: currentEnd })
                    currentStart = slotTime
                    currentEnd = addMinutes(slotTime, 30)
                }
            }
            ranges.push({ startTime: currentStart, endTime: currentEnd })
        }

        // Update local participants state
        setLocalParticipants(prev => prev.map(p =>
            p.id === remoteParticipantId
                ? { ...p, availability: ranges }
                : p
        ))

        toast.info(`${localParticipants.find(p => p.id === remoteParticipantId)?.name || 'Someone'} updated their availability`)
    }, [participant?.id, localParticipants])

    // Handle remote participant joined
    const handleRemoteParticipantJoined = useCallback((newParticipant: { id: string; name: string; timezone: string }) => {
        // Add to local list if not already there
        setLocalParticipants(prev => {
            if (prev.some(p => p.id === newParticipant.id)) return prev
            return [...prev, { ...newParticipant, availability: [] }]
        })
        toast.info(`${newParticipant.name} joined the meeting`)
    }, [])

    // Handle remote timezone update
    const handleRemoteTimezoneUpdate = useCallback((remoteParticipantId: string, newTimezone: string) => {
        // Don't update if it's our own change
        if (remoteParticipantId === participant?.id) return

        // Update local participants state
        setLocalParticipants(prev => prev.map(p =>
            p.id === remoteParticipantId
                ? { ...p, timezone: newTimezone }
                : p
        ))

        const participantName = localParticipants.find(p => p.id === remoteParticipantId)?.name || 'Someone'
        toast.info(`${participantName} changed timezone to ${newTimezone.split('/')[1]?.replace('_', ' ') || newTimezone}`)
    }, [participant?.id, localParticipants])

    // Ably real-time channel
    const {
        isConnected,
        presenceMembers,
        broadcastAvailability,
        broadcastParticipantJoined,
        broadcastTimezone
    } = useMeetingChannel({
        meetingId: meeting.id,
        participantId: participant?.id,
        participantName: participant?.name,
        onAvailabilityUpdate: handleRemoteAvailabilityUpdate,
        onParticipantJoined: handleRemoteParticipantJoined,
        onTimezoneUpdate: handleRemoteTimezoneUpdate,
    })

    useEffect(() => {
        // Check local storage for existing participant ID for this meeting
        const storedId = localStorage.getItem(`meeting_participant_${meeting.id}`)
        // Also check URL search params for shared link impersonation/context
        const params = new URLSearchParams(window.location.search)
        const paramId = params.get('participantId')

        const targetId = paramId || storedId

        if (targetId) {
            const existing = meeting.participants.find((p: any) => p.id === targetId)
            if (existing) {
                setParticipant(existing as Participant)
                // If it came from URL, sync to local storage
                if (paramId) {
                    localStorage.setItem(`meeting_participant_${meeting.id}`, paramId)
                    // Clean URL
                    window.history.replaceState({}, '', window.location.pathname)
                }
            } else {
                if (!paramId) setShowJoinDialog(true) // Only show dialog if stored ID was invalid, not if URL param was invalid (silent fail safest?)
            }
        } else {
            setShowJoinDialog(true)
        }
    }, [meeting.id, localParticipants])

    const handleJoined = (newParticipant: any) => {
        // Persist to local storage
        localStorage.setItem(`meeting_participant_${meeting.id}`, newParticipant.id)
        setParticipant(newParticipant as Participant)
        setShowJoinDialog(false)

        // Broadcast to other clients
        broadcastParticipantJoined({
            id: newParticipant.id,
            name: newParticipant.name,
            timezone: newParticipant.timezone,
        })

        // Add to local list
        setLocalParticipants(prev => {
            if (prev.some(p => p.id === newParticipant.id)) return prev
            return [...prev, { ...newParticipant, availability: [] }]
        })
    }

    const handleSaveAvailability = async (ranges: { startTime: Date; endTime: Date }[]) => {
        if (!participant) return
        await updateAvailability(participant.id, ranges)
    }

    const handleTitleSave = async () => {
        if (!editedTitle.trim()) return

        // Optimistic update
        const previousTitle = optimisticTitle
        setOptimisticTitle(editedTitle)
        setIsEditingTitle(false)
        setIsSavingTitle(true)

        try {
            await updateMeetingTitle(meeting.id, editedTitle)
            toast.success("Meeting title updated")
        } catch (e) {
            setOptimisticTitle(previousTitle) // Revert on failure
            toast.error("Failed to update title")
        } finally {
            setIsSavingTitle(false)
        }
    }

    // ... (handleSaveAvailability, handleTimezoneChange remain same)

    const handleTimezoneChange = async (newTimezone: string) => {
        if (!participant) return

        // Optimistic update
        setParticipant({ ...participant, timezone: newTimezone })

        // Also update localParticipants so Group Timeline reflects the change
        setLocalParticipants(prev => prev.map(p =>
            p.id === participant.id
                ? { ...p, timezone: newTimezone }
                : p
        ))

        setIsUpdatingTimezone(true)
        try {
            await updateParticipantTimezone(participant.id, newTimezone)

            // Broadcast to other clients
            broadcastTimezone(newTimezone)
        } catch (e) {
            // Revert on failure (optional, but good practice)
            toast.error("Failed to update timezone")
            // Ideally we'd revert to previous state here if we tracked it
        } finally {
            setIsUpdatingTimezone(false)
        }
    }

    const handleCopyAiPrompt = () => {
        // ... existing implementation
        const lines = [
            "I need to find the best meeting time for a group of people across different timezones.",
            "Please analyze the following availability data and suggest the top 3 items that work for the most people.",
            "Prioritize times where everyone is available.",
            "",
            "## Participants & Timezones:",
            ...localParticipants.map(p => `- ${p.name}: ${p.timezone}`),
            "",
            "## Availability (in UTC):",
            ...localParticipants.map(p => {
                const ranges = p.availability.map(r =>
                    `${format(new Date(r.startTime), "yyyy-MM-dd HH:mm")} to ${format(new Date(r.endTime), "HH:mm")}`
                ).join(", ")
                return `- ${p.name}: ${ranges || "No availability set"}`
            }),
            "",
            "Please provide the suggestions in my local timezone (tell me what it is based on the data if possible, or assume UTC and ask me to convert).",
            "For each suggestion, list who can attend and who cannot."
        ]

        const prompt = lines.join("\n")
        navigator.clipboard.writeText(prompt)
        toast.success("AI Prompt copied to clipboard!")
    }

    const uniqueTimezones = Array.from(new Set(localParticipants.map(p => p.timezone)))
    if (participant && !uniqueTimezones.includes(participant.timezone)) {
        uniqueTimezones.push(participant.timezone)
    }

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-[1400px] space-y-8">
            {/* Header */}
            <div className="flex flex-row justify-between items-center gap-2">
                <div className="flex flex-col gap-2">
                    {isEditingTitle ? (
                        <div className="flex items-center gap-2 flex-wrap">
                            <Input
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                className="text-xl md:text-2xl font-bold h-10 w-full md:w-[300px]"
                            />
                            <Button size="icon" variant="ghost" onClick={handleTitleSave} disabled={isSavingTitle}>
                                <Check className="w-5 h-5 text-emerald-500" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => {
                                setIsEditingTitle(false)
                                setEditedTitle(optimisticTitle)
                            }}>
                                <X className="w-5 h-5 text-red-500" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 group">
                            <h1 className="text-2xl md:text-3xl font-bold">{optimisticTitle}</h1>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setIsEditingTitle(true)}
                            >
                                <Pencil className="w-4 h-4 text-muted-foreground" />
                            </Button>
                        </div>
                    )}
                    <p className="text-muted-foreground text-sm truncate">{meeting.id}</p>
                </div>
                <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                    {/* Connection Status */}
                    <div className="flex items-center gap-1.5" title={isConnected ? 'Real-time sync active' : 'Connecting...'}>
                        {isConnected ? (
                            <Wifi className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <WifiOff className="w-4 h-4 text-muted-foreground animate-pulse" />
                        )}
                        {presenceMembers.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                                <Users className="w-3 h-3 mr-1" />
                                {presenceMembers.length} online
                            </Badge>
                        )}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCopyAiPrompt} className="hidden md:flex gap-2">
                        <Sparkles className="w-4 h-4" />
                        Copy AI Prompt
                    </Button>
                    <div className="flex items-center space-x-2">
                        <Switch id="airline-mode" checked={is24Hour} onCheckedChange={setIs24Hour} />
                        <Label htmlFor="airline-mode">24h</Label>
                    </div>
                    <ModeToggle />
                </div>
            </div>

            <div className="space-y-8">
                {/* 1. Group Timeline (Main Controller) */}
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <h2 className="text-xl md:text-2xl font-semibold">Group Timeline</h2>
                        <p className="text-sm text-muted-foreground">
                            {participant ? (
                                <>
                                    {format(toZonedTime(selectedTime, participant.timezone), is24Hour ? "EEEE, MMMM d, HH:mm" : "EEEE, MMMM d, h:mm a")}
                                    <span className="ml-1 opacity-70">({participant.timezone.split("/")[1]?.replace("_", " ")})</span>
                                </>
                            ) : (
                                format(selectedTime, is24Hour ? "EEEE, MMMM d, HH:mm" : "EEEE, MMMM d, h:mm a")
                            )}
                        </p>
                    </div>

                    <MeetingTimeline
                        participants={localParticipants}
                        selectedTime={selectedTime}
                        onTimeChange={setSelectedTime}
                        is24Hour={is24Hour}
                    />
                    <p className="text-xs text-muted-foreground text-center">
                        Drag the timeline to change the selected time.
                    </p>

                    {/* Admin / Add Participant */}
                    <div className="flex justify-center">
                        <Button variant="link" size="sm" onClick={() => setShowJoinDialog(true)} className="text-muted-foreground h-auto p-0">
                            + Add another participant
                        </Button>
                    </div>
                </div>

                {/* 2. My Availability (Full Width) */}
                <div>
                    {participant ? (
                        <Card className="bg-card/50 backdrop-blur-md border-border w-full">
                            <CardHeader>
                                <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                                    <div>
                                        <CardTitle>My Availability</CardTitle>
                                        <CardDescription>
                                            Drag to select times you are free. The vertical markers correspond to the selected time above.
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {isUpdatingTimezone && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                        <TimezoneCombobox
                                            value={participant.timezone}
                                            onValueChange={handleTimezoneChange}
                                            className="w-full md:w-[200px]"
                                            disabled={isUpdatingTimezone}
                                        />

                                        {/* Identify / Impersonate Dropdown */}
                                        <div className="flex items-center gap-1 border border-input rounded-md px-2 h-10 bg-background">
                                            <span className="text-xs text-muted-foreground mr-1">View as:</span>
                                            <select
                                                className="bg-transparent text-sm font-medium focus:outline-none max-w-[120px]"
                                                value={participant.id}
                                                onChange={(e) => {
                                                    const newId = e.target.value
                                                    const p = meeting.participants.find(p => p.id === newId)
                                                    if (p) {
                                                        setParticipant(p as Participant)
                                                        localStorage.setItem(`meeting_participant_${meeting.id}`, p.id)
                                                    }
                                                }}
                                            >
                                                {meeting.participants.map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="icon"
                                            title="Copy personalized link"
                                            onClick={() => {
                                                const url = new URL(window.location.href)
                                                url.searchParams.set('participantId', participant.id)
                                                navigator.clipboard.writeText(url.toString())
                                                toast.success(`Link for ${participant.name} copied!`)
                                            }}
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <AvailabilityGrid
                                    participantId={participant.id}
                                    initialAvailability={participant.availability}
                                    onSave={handleSaveAvailability}
                                    selectedTime={selectedTime}
                                    participants={localParticipants}
                                    onTimeChange={setSelectedTime}
                                    timezone={participant.timezone}
                                    is24Hour={is24Hour}
                                    onBroadcast={broadcastAvailability}
                                />
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-card/50 backdrop-blur-md border-border flex flex-col justify-center items-center p-8">
                            <p className="text-muted-foreground mb-4">Join the meeting to set your availability.</p>
                            <Button onClick={() => setShowJoinDialog(true)}>Join Meeting</Button>
                        </Card>
                    )}
                </div>

                {/* Admin / Add Participant (only visible if we have no participant or implicit permission - actually anyone can add) */}



                {/* 3. Details Row (3 Columns) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Col 1: Meeting Details (Who is free/busy) */}
                    <div className="md:col-span-1 h-full">
                        <MeetingTimeDetails
                            selectedTime={selectedTime}
                            participants={meeting.participants}
                            viewerTimezone={participant?.timezone}
                            is24Hour={is24Hour}
                        />
                    </div>

                    {/* Col 2: Timezone Clocks */}
                    <div className="md:col-span-1 h-full">
                        <Card className="bg-card/50 backdrop-blur-md border-border h-full">
                            <CardHeader>
                                <CardTitle className="text-lg">Timezone Clocks</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {uniqueTimezones.sort().map(tz => {
                                    let timeStr = "--:--"
                                    let dateStr = ""
                                    try {
                                        const local = toZonedTime(selectedTime, tz)
                                        timeStr = format(local, is24Hour ? "HH:mm" : "h:mm a")
                                        dateStr = format(local, "EEE, MMM d")
                                    } catch (e) { }

                                    return (
                                        <div key={tz} className="flex justify-between items-center p-2 rounded bg-muted/30">
                                            <span className="text-sm font-medium truncate max-w-[120px]" title={tz}>{tz.split("/")[1]?.replace("_", " ") || tz}</span>
                                            <div className="text-right whitespace-nowrap">
                                                <div className="font-mono font-bold text-sm">{timeStr}</div>
                                                <div className="text-[10px] text-muted-foreground">{dateStr}</div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Col 3: Discord Snippet */}
                    <div className="md:col-span-1 h-full">
                        <MeetingDiscordWidget selectedTime={selectedTime} participants={localParticipants} />
                    </div>
                </div>
            </div>

            <JoinMeetingDialog
                meetingId={meeting.id}
                open={showJoinDialog}
                onOpenChange={setShowJoinDialog}
                onJoined={handleJoined}
            />
        </div>
    )
}

// Wrapper component that provides AblyProvider
export function MeetingView({ meeting }: { meeting: Meeting }) {
    // Generate a client ID - use stored participant ID if available, otherwise random
    const [clientId, setClientId] = useState<string>('')

    useEffect(() => {
        const storedId = localStorage.getItem(`meeting_participant_${meeting.id}`)
        setClientId(storedId || `anon-${Date.now()}`)
    }, [meeting.id])

    if (!clientId) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <AblyProvider clientId={clientId}>
            <MeetingViewInner meeting={meeting} initialMeeting={meeting} />
        </AblyProvider>
    )
}
