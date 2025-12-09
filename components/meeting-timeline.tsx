"use client"

import { useRef, useState, useEffect } from "react"
import { toZonedTime } from "date-fns-tz"
import { addHours, format, startOfHour } from "date-fns"
import { Input } from "@/components/ui/input"
import { Pencil, Check, X } from "lucide-react"
import { updateParticipantName } from "@/app/actions"
import { cn } from "@/lib/utils"

const HOUR_WIDTH = 40 // px per hour block
const SIDEBAR_WIDTH = 224 // w-56 = 14rem = 224px
const HOURS_VISIBLE_EACH_SIDE = 24

interface MeetingTimelineProps {
    participants: any[]
    selectedTime: Date
    onTimeChange: (time: Date) => void
    is24Hour?: boolean
    onParticipantUpdate?: (participantId: string, updates: { name?: string; timezone?: string }) => void
    viewerId?: string
}

function ParticipantRow({
    participant,
    selectedTime,
    hoursToRender,
    is24Hour,
    onNameUpdate,
    isFirstRow,
    isViewer
}: {
    participant: any
    selectedTime: Date
    hoursToRender: number[]
    is24Hour: boolean
    onNameUpdate?: (name: string) => void
    isFirstRow?: boolean
    isViewer?: boolean
}) {
    // ... existing hooks
    const [isEditingName, setIsEditingName] = useState(false)
    const [editedName, setEditedName] = useState(participant.name)
    const [isSaving, setIsSaving] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleSaveName = async () => {
        if (!editedName.trim() || editedName === participant.name) {
            setIsEditingName(false)
            setEditedName(participant.name)
            return
        }
        setIsSaving(true)
        try {
            await updateParticipantName(participant.id, editedName)
            onNameUpdate?.(editedName)
            setIsEditingName(false)
        } catch (error) {
            console.error('Failed to update name', error)
            setEditedName(participant.name)
        } finally {
            setIsSaving(false)
        }
    }

    const getInitials = (name: string) =>
        name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

    // The anchor is the start of the hour containing selectedTime
    const anchorHour = startOfHour(selectedTime)
    const minuteOffset = selectedTime.getMinutes()
    const minuteOffsetPx = (minuteOffset / 60) * HOUR_WIDTH
    const centerBlockOffset = HOURS_VISIBLE_EACH_SIDE * HOUR_WIDTH

    return (
        <div className={cn(
            "relative flex border bg-card/50 rounded-lg overflow-hidden h-20 mb-3 shadow-sm hover:shadow-md transition-shadow",
            isViewer ? "border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/20" : "border-border"
        )}>
            {/* Sidebar - Fixed on left */}
            <div className={cn(
                "w-56 shrink-0 z-10 border-r p-3 flex items-center gap-3",
                isViewer ? "bg-emerald-500/10 border-emerald-500/20 backdrop-blur" : "bg-card/95 border-border backdrop-blur"
            )}>
                <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm border",
                    isViewer ? "bg-emerald-500 text-white border-emerald-600" : "bg-primary/10 text-primary border-primary/20"
                )}>
                    {getInitials(participant.name)}
                </div>
                <div className="flex flex-col justify-center overflow-hidden flex-1">
                    {/* ... (rest of sidebar content same as before) */}
                    {isEditingName ? (
                        <div className="flex items-center gap-1">
                            <Input
                                ref={inputRef}
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="h-6 text-sm py-0 px-1"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveName()
                                    if (e.key === 'Escape') {
                                        setIsEditingName(false)
                                        setEditedName(participant.name)
                                    }
                                }}
                                autoFocus
                            />
                            <button
                                onClick={handleSaveName}
                                disabled={isSaving}
                                className="text-emerald-500 hover:text-emerald-400 p-0.5"
                            >
                                <Check className="w-3 h-3" />
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditingName(false)
                                    setEditedName(participant.name)
                                }}
                                className="text-red-500 hover:text-red-400 p-0.5"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ) : (
                        <div
                            className="font-medium text-sm truncate cursor-pointer hover:text-primary flex items-center gap-1 group"
                            onClick={() => setIsEditingName(true)}
                        >
                            {participant.name}
                            <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                        </div>
                    )}
                    <div className="text-xs text-muted-foreground truncate">
                        {participant.timezone}
                        {isViewer && <span className="ml-1 text-emerald-500 font-medium">(You)</span>}
                    </div>
                </div>
            </div>

            {/* Timeline Track Container - Takes remaining space */}
            <div className="flex-1 relative overflow-hidden">
                <div
                    className="flex absolute h-full transition-transform duration-75 ease-out will-change-transform"
                    style={{
                        left: '50%',
                        transform: `translateX(-${centerBlockOffset + minuteOffsetPx}px)`
                    }}
                >
                    {hoursToRender.map((hourOffset) => {
                        // Absolute time for this block
                        const blockTime = addHours(anchorHour, hourOffset)
                        const blockTimestamp = blockTime.getTime()

                        // Convert to participant's local timezone for display
                        let localTime: Date
                        try {
                            localTime = toZonedTime(blockTime, participant.timezone)
                        } catch {
                            localTime = blockTime
                        }
                        const hour = localTime.getHours()
                        const dayOfWeek = localTime.getDay()
                        const isMidnight = hour === 0
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                        const blockEnd = blockTimestamp + 60 * 60 * 1000
                        const isAvailable = participant.availability?.some((range: any) => {
                            const start = new Date(range.startTime).getTime()
                            const end = new Date(range.endTime).getTime()
                            return Math.max(blockTimestamp, start) < Math.min(blockEnd, end)
                        })

                        let bgClass = "bg-slate-100/50 dark:bg-slate-900/50" // Night default
                        if (isWeekend) {
                            bgClass = "bg-red-50/50 dark:bg-red-900/10"
                        }
                        if (hour >= 6 && hour < 9) {
                            bgClass = isWeekend
                                ? "bg-red-100/50 dark:bg-red-900/20"
                                : "bg-blue-100/50 dark:bg-blue-900/20"
                        } else if (hour >= 9 && hour < 17) {
                            bgClass = isWeekend
                                ? "bg-red-200/50 dark:bg-red-900/30"
                                : "bg-yellow-100/50 dark:bg-yellow-900/20"
                        } else if (hour >= 17 && hour < 22) {
                            bgClass = isWeekend
                                ? "bg-red-100/50 dark:bg-red-900/20"
                                : "bg-orange-100/50 dark:bg-orange-900/20"
                        }
                        if (isAvailable) {
                            bgClass = "bg-emerald-500 dark:bg-emerald-600 text-white border-emerald-600"
                        }

                        const label = isMidnight
                            ? format(localTime, "EEE")
                            : format(localTime, is24Hour ? "HH" : "ha")

                        return (
                            <div
                                key={hourOffset}
                                className={`w-[40px] h-full border-r border-border/30 flex items-center justify-center text-[10px] relative ${bgClass} ${isAvailable ? 'font-medium' : 'text-muted-foreground'}`}
                            >
                                <span className={isMidnight ? "font-bold text-foreground" : ""}>
                                    {label}
                                </span>
                                {(() => {
                                    const now = Date.now()
                                    if (now >= blockTimestamp && now < blockEnd) {
                                        const fractionInBlock = (now - blockTimestamp) / (60 * 60 * 1000)
                                        const positionPx = fractionInBlock * HOUR_WIDTH
                                        return (
                                            <div
                                                className="absolute top-0 bottom-0 w-0.5 bg-blue-400/70 z-10"
                                                style={{ left: `${positionPx}px` }}
                                            >
                                                {isFirstRow && <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[8px] text-blue-200 font-medium whitespace-nowrap bg-blue-900/80 px-1 rounded">now</span>}
                                            </div>
                                        )
                                    }
                                    return null
                                })()}
                                {isMidnight && (
                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-yellow-500/50" />
                                )}
                            </div>
                        )
                    })}
                </div>

                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-emerald-500 z-20 pointer-events-none shadow-[0_0_10px_rgba(16,185,129,0.5)] -translate-x-1/2">
                    {isFirstRow && <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] text-emerald-300 font-medium whitespace-nowrap bg-emerald-900/80 px-1 rounded">proposed</span>}
                </div>
            </div>
        </div>
    )
}

export function MeetingTimeline({
    participants,
    selectedTime,
    onTimeChange,
    is24Hour = false,
    onParticipantUpdate,
    viewerId
}: MeetingTimelineProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [dragStartX, setDragStartX] = useState(0)

    // ... existing handlers (handleDragStart, handleDragMove, handleDragEnd, mouse/touch handlers)

    const handleDragStart = (clientX: number) => {
        setIsDragging(true)
        setDragStartX(clientX)
    }
    const handleDragMove = (clientX: number) => {
        if (!isDragging) return
        const deltaX = dragStartX - clientX
        const deltaMinutes = Math.round(deltaX * (60 / HOUR_WIDTH))
        if (deltaMinutes !== 0) {
            const newTime = new Date(selectedTime.getTime() + deltaMinutes * 60 * 1000)
            onTimeChange(newTime)
            setDragStartX(clientX)
        }
    }
    const handleDragEnd = () => setIsDragging(false)
    const handleMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX)
    const handleTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX)
    const handleTouchMove = (e: React.TouchEvent) => {
        e.preventDefault()
        handleDragMove(e.touches[0].clientX)
    }
    const handleTouchEnd = () => handleDragEnd()

    useEffect(() => {
        if (!isDragging) return
        const handleMouseMove = (e: MouseEvent) => handleDragMove(e.clientX)
        const handleMouseUp = () => handleDragEnd()
        window.addEventListener("mousemove", handleMouseMove)
        window.addEventListener("mouseup", handleMouseUp)
        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("mouseup", handleMouseUp)
        }
    }, [isDragging, dragStartX, selectedTime, onTimeChange])

    const hoursToRender = Array.from(
        { length: HOURS_VISIBLE_EACH_SIDE * 2 },
        (_, i) => i - HOURS_VISIBLE_EACH_SIDE
    )

    return (
        <div className="bg-card/50 backdrop-blur-md border border-border rounded-xl overflow-hidden shadow-xl select-none">
            <div className="p-3 md:p-4 border-b border-border font-medium text-muted-foreground text-xs md:text-sm">
                Group Availability (Drag to view different times)
            </div>

            <div
                ref={containerRef}
                className="relative overflow-hidden cursor-grab active:cursor-grabbing touch-none"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {participants.map((p, idx) => (
                    <ParticipantRow
                        key={p.id}
                        participant={p}
                        selectedTime={selectedTime}
                        hoursToRender={hoursToRender}
                        is24Hour={is24Hour}
                        isFirstRow={idx === 0}
                        isViewer={p.id === viewerId}
                        onNameUpdate={(name) => onParticipantUpdate?.(p.id, { name })}
                    />
                ))}

                {participants.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                        No participants have joined yet.
                    </div>
                )}
            </div>
        </div>
    )
}
