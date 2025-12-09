"use client"

import { useState, useEffect, useRef, Fragment } from "react"
import { addDays, format, startOfDay, addMinutes, isSameMinute, startOfMinute } from "date-fns"
import { fromZonedTime, toZonedTime } from "date-fns-tz"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AvailabilityGridProps {
    participantId: string
    initialAvailability?: { startTime: Date; endTime: Date }[]
    onSave: (ranges: { startTime: Date; endTime: Date }[]) => Promise<void>
    selectedTime?: Date
    participants?: { id: string; availability: { startTime: Date; endTime: Date }[] }[]
    onTimeChange?: (time: Date) => void
    timezone?: string
    is24Hour?: boolean
}

// Helper to check set equality
function areSetsEqual(a: Set<string>, b: Set<string>) {
    if (a.size !== b.size) return false
    for (const item of a) {
        if (!b.has(item)) return false
    }
    return true
}

interface Coordinate {
    dayIndex: number
    timeIndex: number
}

export function AvailabilityGrid({ participantId, initialAvailability = [], onSave, selectedTime, participants = [], onTimeChange, timezone = Intl.DateTimeFormat().resolvedOptions().timeZone, is24Hour = false }: AvailabilityGridProps) {
    const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set())
    const selectedSlotsRef = useRef(selectedSlots) // Track latest slots in Ref

    const [heatmap, setHeatmap] = useState<Record<string, number>>({})
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")

    // Drag State
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState<Coordinate | null>(null)
    const [dragCurrent, setDragCurrent] = useState<Coordinate | null>(null)
    const [dragMode, setDragMode] = useState<"add" | "remove">("add")

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    // Sync Ref
    useEffect(() => {
        selectedSlotsRef.current = selectedSlots
    }, [selectedSlots])

    // Initialize state from props - Logic Refined to avoid Flash
    useEffect(() => {
        // If we have unsaved changes, we NEVER overwrite local state with props *unless* 
        // the props have caught up to our local state (which we handle in the other effect).
        // This prevents the "flash" where props are momentarily stale after a save.
        if (hasUnsavedChanges) return

        const initial = new Set<string>()
        if (initialAvailability) {
            initialAvailability.forEach(range => {
                const start = new Date(range.startTime)
                const end = new Date(range.endTime)
                let current = start
                // Iterate in 30-minute chunks
                while (current < end) {
                    initial.add(current.toISOString())
                    current = addMinutes(current, 30)
                }
            })
        }

        // Only update if actually different
        if (!areSetsEqual(initial, selectedSlots)) {
            setSelectedSlots(initial)
        }
    }, [initialAvailability, hasUnsavedChanges])

    // NEW: Clears 'hasUnsavedChanges' ONLY when prop data matches local data.
    // This "unlocks" the component to receive future updates from the server.
    useEffect(() => {
        const initial = new Set<string>()
        if (initialAvailability) {
            initialAvailability.forEach(range => {
                const start = new Date(range.startTime)
                const end = new Date(range.endTime)
                let current = start
                while (current < end) {
                    initial.add(current.toISOString())
                    current = addMinutes(current, 30)
                }
            })
        }

        if (areSetsEqual(initial, selectedSlots)) {
            setHasUnsavedChanges(false)
        }
    }, [initialAvailability, selectedSlots])

    // Calculate Heatmap
    useEffect(() => {
        const newHeatmap: Record<string, number> = {}
        const otherParticipants = participants.filter(p => p.id !== participantId)

        otherParticipants.forEach(p => {
            p.availability.forEach(range => {
                let current = new Date(range.startTime)
                const end = new Date(range.endTime)
                // align to 30 min just in case
                if (current.getMinutes() % 30 !== 0) {
                    current.setMinutes(current.getMinutes() < 30 ? 0 : 30, 0, 0)
                }

                while (current < end) {
                    const key = current.toISOString()
                    newHeatmap[key] = (newHeatmap[key] || 0) + 1
                    current = addMinutes(current, 30)
                }
            })
        })
        setHeatmap(newHeatmap)
    }, [participants, participantId])

    // Auto-save logic
    useEffect(() => {
        if (!hasUnsavedChanges || isDragging) return

        const timer = setTimeout(async () => {
            setSaveStatus("saving")

            const slotsToSave = new Set(selectedSlotsRef.current)
            await handleSave(slotsToSave)

            setSaveStatus("saved")

            // WE DO NOT CLEAR 'hasUnsavedChanges' HERE ANYMORE.
            // We wait for the prop to catch up in the effect above.

            setTimeout(() => setSaveStatus("idle"), 2000)
        }, 1000) // Debounce 1s

        return () => clearTimeout(timer)
    }, [selectedSlots, hasUnsavedChanges, isDragging])

    // Calculate Heatmap
    useEffect(() => {
        const newHeatmap: Record<string, number> = {}
        const otherParticipants = participants.filter(p => p.id !== participantId)

        otherParticipants.forEach(p => {
            p.availability.forEach(range => {
                let current = new Date(range.startTime)
                const end = new Date(range.endTime)
                // align to 30 min just in case
                if (current.getMinutes() % 30 !== 0) {
                    current.setMinutes(current.getMinutes() < 30 ? 0 : 30, 0, 0)
                }

                while (current < end) {
                    const key = current.toISOString()
                    newHeatmap[key] = (newHeatmap[key] || 0) + 1
                    current = addMinutes(current, 30)
                }
            })
        })
        setHeatmap(newHeatmap)
    }, [participants, participantId])

    // Helper to get time for coordinates
    const getTimeForCoord = (dayIdx: number, timeIdx: number) => {
        // Calculate the "Visual Start of Day" in the target timezone
        const now = new Date()
        const zonedNow = toZonedTime(now, timezone)
        const zonedTodayStr = format(zonedNow, "yyyy-MM-dd")

        // This gives us the Absolute Time (UTC) that represents 00:00 in the target timezone for "Today"
        const absoluteStartOfToday = fromZonedTime(`${zonedTodayStr} 00:00`, timezone)

        const day = addDays(absoluteStartOfToday, dayIdx)
        return addMinutes(day, timeIdx * 30)
    }

    // Track if drag actually moved across slots
    const hasMoved = useRef(false)

    const handleMouseDown = (dayIndex: number, timeIndex: number) => {
        setIsDragging(true)
        setDragStart({ dayIndex, timeIndex })
        setDragCurrent({ dayIndex, timeIndex })
        hasMoved.current = false // Reset move tracker

        const time = getTimeForCoord(dayIndex, timeIndex)
        // Determine mode based on initial click
        if (selectedSlots.has(time.toISOString())) {
            setDragMode("remove")
        } else {
            setDragMode("add")
        }
    }

    const handleMouseEnter = (dayIndex: number, timeIndex: number) => {
        if (!isDragging) return
        setDragCurrent({ dayIndex, timeIndex })
        hasMoved.current = true // Mark as moved
    }

    const handleMouseUp = () => {
        if (!isDragging || !dragStart || !dragCurrent) {
            setIsDragging(false)
            return
        }

        // Check for static click (no movement across cells)
        if (!hasMoved.current && dragStart.dayIndex === dragCurrent.dayIndex && dragStart.timeIndex === dragCurrent.timeIndex) {
            // It was a click!
            if (onTimeChange) {
                const time = getTimeForCoord(dragStart.dayIndex, dragStart.timeIndex)
                onTimeChange(time)
            }

            // Abort save/edit
            setIsDragging(false)
            setDragStart(null)
            setDragCurrent(null)
            return
        }

        // Commit the pending selection
        const newSlots = new Set(selectedSlots)
        const minDay = Math.min(dragStart.dayIndex, dragCurrent.dayIndex)
        const maxDay = Math.max(dragStart.dayIndex, dragCurrent.dayIndex)
        const minTime = Math.min(dragStart.timeIndex, dragCurrent.timeIndex)
        const maxTime = Math.max(dragStart.timeIndex, dragCurrent.timeIndex)

        for (let d = minDay; d <= maxDay; d++) {
            for (let t = minTime; t <= maxTime; t++) {
                const time = getTimeForCoord(d, t)
                const key = time.toISOString()
                if (dragMode === "add") {
                    newSlots.add(key)
                } else {
                    newSlots.delete(key)
                }
            }
        }

        setSelectedSlots(newSlots)
        setHasUnsavedChanges(true)
        setIsDragging(false)
        setDragStart(null)
        setDragCurrent(null)
        setSaveStatus("idle")
    }

    const handleSave = async (slots: Set<string>) => {
        const ranges: { startTime: Date; endTime: Date }[] = []

        // Convert slots back to ranges
        const sortedSlots = Array.from(slots).sort()
        if (sortedSlots.length > 0) {
            let currentStart = new Date(sortedSlots[0])
            let currentEnd = addMinutes(currentStart, 30)

            for (let i = 1; i < sortedSlots.length; i++) {
                const slotTime = new Date(sortedSlots[i])
                if (slotTime.getTime() === currentEnd.getTime()) {
                    // Contiguous
                    currentEnd = addMinutes(slotTime, 30)
                } else {
                    // Break
                    ranges.push({ startTime: currentStart, endTime: currentEnd })
                    currentStart = slotTime
                    currentEnd = addMinutes(slotTime, 30)
                }
            }
            ranges.push({ startTime: currentStart, endTime: currentEnd })
        }

        await onSave(ranges)
    }

    // Helper to check if a slot is in the pending drag area
    const isSlotInPendingDrag = (dayIndex: number, timeIndex: number) => {
        if (!isDragging || !dragStart || !dragCurrent) return false

        const minDay = Math.min(dragStart.dayIndex, dragCurrent.dayIndex)
        const maxDay = Math.max(dragStart.dayIndex, dragCurrent.dayIndex)
        const minTime = Math.min(dragStart.timeIndex, dragCurrent.timeIndex)
        const maxTime = Math.max(dragStart.timeIndex, dragCurrent.timeIndex)

        return (
            dayIndex >= minDay &&
            dayIndex <= maxDay &&
            timeIndex >= minTime &&
            timeIndex <= maxTime
        )
    }

    // Prepare Grid Data
    // We need to calculate 'days' based on the timezone, so headers are correct
    const now = new Date()
    const zonedNow = toZonedTime(now, timezone)
    const zonedTodayStr = format(zonedNow, "yyyy-MM-dd")
    const absoluteStartOfToday = fromZonedTime(`${zonedTodayStr} 00:00`, timezone)

    const days = Array.from({ length: 7 }, (_, i) => addDays(absoluteStartOfToday, i))
    const slots = Array.from({ length: 48 }, (_, i) => i) // 0..47 for 30m slots

    // Helper to calculate ranges for a specific day for rendering overlay (Visual ONLY)
    // Now we merge pending state into this visualization on the fly
    const getRangesForDay = (day: Date, dayIndex: number) => {
        const ranges: { startSlot: number, endSlot: number, startTime: Date, endTime: Date }[] = []
        let currentRange: { startSlot: number, endSlot: number, startTime: Date, endTime: Date } | null = null

        slots.forEach(i => {
            const time = addMinutes(day, i * 30)
            const key = time.toISOString()
            const isPersisted = selectedSlots.has(key)
            const isPending = isSlotInPendingDrag(dayIndex, i)

            // Determine effective state for this slot
            let isEffectiveSelected = isPersisted
            if (isPending) {
                isEffectiveSelected = dragMode === "add" ? true : false
            }

            if (isEffectiveSelected) {
                if (!currentRange) {
                    currentRange = { startSlot: i, endSlot: i + 1, startTime: time, endTime: addMinutes(time, 30) }
                } else {
                    currentRange.endSlot = i + 1
                    currentRange.endTime = addMinutes(time, 30)
                }
            } else {
                if (currentRange) {
                    ranges.push(currentRange)
                    currentRange = null
                }
            }
        })
        if (currentRange) ranges.push(currentRange)
        return ranges
    }

    return (
        <div className="space-y-4 select-none" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium h-3 flex items-center">
                        {saveStatus === "saving" && <span className="text-muted-foreground">Saving...</span>}
                        {saveStatus === "saved" && <span className="text-emerald-500">Saved</span>}
                        {hasUnsavedChanges && saveStatus === "idle" && <span className="text-amber-500">Unsaved changes...</span>}
                    </div>
                </div>
            </div>

            <div className="relative overflow-x-auto border border-border rounded-lg bg-card/50">
                <div className="grid grid-cols-[100px_repeat(48,minmax(20px,1fr))] min-w-[1200px]">
                    {/* Header Row (Row 1) */}
                    <div className="p-2 border-b border-r border-border bg-muted/50 font-medium text-sm sticky left-0 z-20 col-span-1" style={{ gridRow: 1 }}>
                        Date / Time
                    </div>
                    {Array.from({ length: 24 }).map((_, h) => {
                        let label = h.toString()
                        if (!is24Hour) {
                            const date = new Date()
                            date.setHours(h, 0, 0, 0)
                            label = format(date, "h a")
                        }
                        return (
                            <div key={h} className="col-span-2 p-2 border-b border-border bg-muted/50 text-xs text-center text-muted-foreground border-r last:border-r-0" style={{ gridRow: 1 }}>
                                {label}
                            </div>
                        )
                    })}

                    {days.map((day, dayIdx) => {
                        const rowIdx = dayIdx + 2

                        // Render Overlay Ranges first (so they are "behind" pointer events of cells if necessary, but we put them on top with pointer-events-none)
                        const ranges = getRangesForDay(day, dayIdx)

                        return (
                            <Fragment key={day.toISOString()}>
                                {/* Row Header */}
                                <div
                                    className="p-2 border-r border-border bg-card font-medium text-xs sticky left-0 z-10 flex flex-col justify-center border-b h-12"
                                    style={{ gridRow: rowIdx, gridColumn: 1 }}
                                >
                                    <span>{format(day, "EEE")}</span>
                                    <span className="text-muted-foreground">{format(day, "MMM d")}</span>
                                </div>

                                {/* Interaction Cells */}
                                {slots.map(i => {
                                    const time = addMinutes(day, i * 30)
                                    const isHourStart = i % 2 === 0
                                    const isCurrentSelected = selectedTime && (
                                        time.getTime() <= selectedTime.getTime() &&
                                        addMinutes(time, 30).getTime() > selectedTime.getTime()
                                    )

                                    // Visual state calculation for this cell specifically for rendering classes (e.g. hover)
                                    // Note: Actual coloring is handled by 'ranges' overlay, but we need this for heatmap text color logic
                                    const isPersisted = selectedSlots.has(time.toISOString())
                                    const isPending = isSlotInPendingDrag(dayIdx, i)
                                    let isEffectiveSelected = isPersisted
                                    if (isPending) {
                                        isEffectiveSelected = dragMode === "add" ? true : false
                                    }

                                    const isWeekend = day.getDay() === 0 || day.getDay() === 6

                                    return (
                                        <div
                                            key={time.toISOString()}
                                            onMouseDown={() => handleMouseDown(dayIdx, i)}
                                            onMouseEnter={() => handleMouseEnter(dayIdx, i)}
                                            className={cn(
                                                "border-b border-border/30 h-12 cursor-pointer transition-colors relative",
                                                isHourStart ? "border-r border-border/50" : "border-r border-border/30 border-dashed",
                                                // Hover effect
                                                !isEffectiveSelected && "hover:bg-emerald-500/10",
                                                // Weekend Highlight: Slightly darker/warmer background if not selected
                                                !isEffectiveSelected && isWeekend && "bg-orange-50/30 dark:bg-orange-900/10"
                                            )}
                                            style={{
                                                gridRow: rowIdx,
                                                gridColumn: i + 2,
                                                // Heatmap background (only if not selected)
                                                backgroundColor: !isEffectiveSelected && heatmap[time.toISOString()]
                                                    ? `rgba(99, 102, 241, ${Math.min(heatmap[time.toISOString()] * 0.15, 0.6)})` // Indigo with varying opacity
                                                    : undefined
                                            }}
                                        >
                                            {/* Heatmap Count Indicator (optional, keep it subtle) */}
                                            {(() => {
                                                const othersCount = heatmap[time.toISOString()] || 0
                                                const totalCount = othersCount + (isEffectiveSelected ? 1 : 0)

                                                if (totalCount === 0) return null

                                                return (
                                                    <div className="absolute bottom-0 right-1 pointer-events-none z-20">
                                                        <span className={cn(
                                                            "text-[10px] font-medium transition-colors",
                                                            isEffectiveSelected
                                                                ? "text-white/90"
                                                                : "text-indigo-900/40 dark:text-indigo-100/40"
                                                        )}>
                                                            {totalCount}
                                                        </span>
                                                    </div>
                                                )
                                            })()}

                                            {/* Highlight for Selected Meeting Time */}
                                            {isCurrentSelected && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 animate-pulse z-30" />
                                            )}
                                        </div>
                                    )
                                })}

                                {/* Overlay Ranges (Visuals) */}
                                {ranges.map((range, rIdx) => (
                                    <div
                                        key={`range-${rIdx}`}
                                        className={cn(
                                            "text-white text-[10px] flex items-center px-1 font-medium overflow-hidden whitespace-nowrap rounded-sm h-10 mt-1 pointer-events-none z-10 shadow-sm mx-px",
                                            // During drag, make the "pending" ranges slightly distinct?
                                            isDragging ? "bg-emerald-500/90" : "bg-emerald-500"
                                        )}
                                        style={{
                                            gridColumnStart: range.startSlot + 2,
                                            gridColumnEnd: range.endSlot + 2,
                                            gridRowStart: rowIdx,
                                            gridRowEnd: rowIdx + 1
                                        }}
                                    >
                                        {range.endSlot - range.startSlot > 2 ? (
                                            <>{format(range.startTime, "h:mm a")} - {format(range.endTime, "h:mm a")}</>
                                        ) : (
                                            range.endSlot - range.startSlot > 1 ? format(range.startTime, "h:mm") : ""
                                        )}
                                    </div>
                                ))}
                            </Fragment>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
