"use client"

import { useState, useEffect, useRef, Fragment } from "react"
import { addDays, format, startOfDay, addMinutes, isSameMinute, startOfMinute } from "date-fns"
import { fromZonedTime, toZonedTime } from "date-fns-tz"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Hand, MousePointer2, Pen } from "lucide-react"

interface AvailabilityGridProps {
    participantId: string
    initialAvailability?: { startTime: Date; endTime: Date }[]
    onSave: (ranges: { startTime: Date; endTime: Date }[]) => Promise<void>
    selectedTime?: Date
    participants?: { id: string; availability: { startTime: Date; endTime: Date }[] }[]
    onTimeChange?: (time: Date) => void
    timezone?: string
    is24Hour?: boolean
    onBroadcast?: (slots: string[]) => void
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

export function AvailabilityGrid({ participantId, initialAvailability = [], onSave, selectedTime, participants = [], onTimeChange, timezone = Intl.DateTimeFormat().resolvedOptions().timeZone, is24Hour = false, onBroadcast }: AvailabilityGridProps) {
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

    // Selection Mode (Toggle): False = View/TimeSet, True = Edit/Availability
    const [isSelectionMode, setIsSelectionMode] = useState(false)

    // Sync Ref
    useEffect(() => {
        selectedSlotsRef.current = selectedSlots
    }, [selectedSlots])

    // Initialize state from props - Logic Refined to avoid Flash
    useEffect(() => {
        if (hasUnsavedChanges) return

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

        if (!areSetsEqual(initial, selectedSlots)) {
            setSelectedSlots(initial)
        }
    }, [initialAvailability, hasUnsavedChanges])

    // Clear unsaved changes when consistent
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

            if (onBroadcast) {
                onBroadcast(Array.from(slotsToSave))
            }

            setSaveStatus("saved")
            setTimeout(() => setSaveStatus("idle"), 2000)
        }, 1000)

        return () => clearTimeout(timer)
    }, [selectedSlots, hasUnsavedChanges, isDragging, onBroadcast])

    // Helper to get time for coordinates
    const getTimeForCoord = (dayIdx: number, timeIdx: number) => {
        const now = new Date()
        const zonedNow = toZonedTime(now, timezone)
        const zonedTodayStr = format(zonedNow, "yyyy-MM-dd")
        const absoluteStartOfToday = fromZonedTime(`${zonedTodayStr} 00:00`, timezone)

        const day = addDays(absoluteStartOfToday, dayIdx)
        return addMinutes(day, timeIdx * 30)
    }

    // Track if drag actually moved across slots
    const hasMoved = useRef(false)

    const handleMouseDown = (dayIndex: number, timeIndex: number) => {
        if (isSelectionMode) {
            startDrag(dayIndex, timeIndex)
        }
    }

    const handleClick = (dayIndex: number, timeIndex: number) => {
        // Only set time if we are NOT in edit/selection mode
        if (!isSelectionMode && onTimeChange) {
            const time = getTimeForCoord(dayIndex, timeIndex)
            onTimeChange(time)
        }
    }

    const startDrag = (dayIndex: number, timeIndex: number) => {
        setIsDragging(true)
        setDragStart({ dayIndex, timeIndex })
        setDragCurrent({ dayIndex, timeIndex })
        hasMoved.current = false

        const time = getTimeForCoord(dayIndex, timeIndex)
        if (selectedSlots.has(time.toISOString())) {
            setDragMode("remove")
        } else {
            setDragMode("add")
        }
    }

    // Touch handlers for mobile
    const handleTouchStart = (e: React.TouchEvent, dayIndex: number, timeIndex: number) => {
        if (!isSelectionMode) return // Allow scroll / tap to set time
        e.preventDefault() // Prevent scroll since we are selecting
        startDrag(dayIndex, timeIndex)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        // Only stop propagation/default if we are NOT on a header in selection mode
        if (isSelectionMode) {
            const target = e.target as HTMLElement;
            // Check if touch started on a header cell
            const isHeader = target.closest('.grid-header-cell');
            if (!isHeader) {
                e.preventDefault()
            }
        }

        if (!isDragging) return

        // If we are dragging, we already prevented default above or it was a valid drag start
        // e.preventDefault() 

        const touch = e.touches[0]
        const element = document.elementFromPoint(touch.clientX, touch.clientY)
        const dayAttr = element?.getAttribute('data-day')
        const timeAttr = element?.getAttribute('data-time')

        if (dayAttr && timeAttr) {
            const dayIdx = parseInt(dayAttr, 10)
            const timeIdx = parseInt(timeAttr, 10)
            if (!isNaN(dayIdx) && !isNaN(timeIdx)) {
                handleMouseEnter(dayIdx, timeIdx)
            }
        }
    }

    const handleTouchEnd = () => {
        handleMouseUp()
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
            // Static click in Edit Mode: Toggle the single slot
            const time = getTimeForCoord(dragStart.dayIndex, dragStart.timeIndex)
            const key = time.toISOString()
            const newSlots = new Set(selectedSlots)

            if (newSlots.has(key)) {
                newSlots.delete(key)
            } else {
                newSlots.add(key)
            }

            setSelectedSlots(newSlots)
            setHasUnsavedChanges(true)

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

        const sortedSlots = Array.from(slots).sort()
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

        await onSave(ranges)
    }

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

    const now = new Date()
    const zonedNow = toZonedTime(now, timezone)
    const zonedTodayStr = format(zonedNow, "yyyy-MM-dd")
    const absoluteStartOfToday = fromZonedTime(`${zonedTodayStr} 00:00`, timezone)

    const days = Array.from({ length: 7 }, (_, i) => addDays(absoluteStartOfToday, i))
    const slots = Array.from({ length: 48 }, (_, i) => i)

    const getRangesForDay = (day: Date, dayIndex: number) => {
        const ranges: { startSlot: number, endSlot: number, startTime: Date, endTime: Date }[] = []
        let currentRange: { startSlot: number, endSlot: number, startTime: Date, endTime: Date } | null = null

        slots.forEach(i => {
            const time = addMinutes(day, i * 30)
            const key = time.toISOString()
            const isPersisted = selectedSlots.has(key)
            const isPending = isSlotInPendingDrag(dayIndex, i)

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
        <div
            className="space-y-4 select-none"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium h-3 flex items-center">
                        {saveStatus === "saving" && <span className="text-muted-foreground">Saving...</span>}
                        {saveStatus === "saved" && <span className="text-emerald-500">Saved</span>}
                        {hasUnsavedChanges && saveStatus === "idle" && <span className="text-amber-500">Unsaved changes...</span>}
                    </div>
                </div>

                {/* Edit Mode Toggle */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground mr-1 hidden sm:inline">
                        {isSelectionMode ? "Tap/Drag to Edit" : "Tap to Set Time"}
                    </span>
                    <Button
                        size="sm"
                        variant={isSelectionMode ? "default" : "outline"}
                        onClick={() => setIsSelectionMode(!isSelectionMode)}
                        className="h-8 gap-2"
                    >
                        {isSelectionMode ? <Pen className="h-3 w-3" /> : <Hand className="h-3 w-3" />}
                        {isSelectionMode ? "Editing" : "Viewing"}
                    </Button>
                </div>
            </div>

            <div
                className="relative overflow-x-auto border border-border rounded-lg bg-card/50"
            >
                <div className="grid grid-cols-[80px_repeat(48,minmax(16px,1fr))] md:grid-cols-[100px_repeat(48,minmax(20px,1fr))] min-w-[900px] md:min-w-[1200px] cursor-default">
                    {/* Header Row */}
                    <div className="grid-header-cell p-2 border-b border-r border-border bg-muted/50 font-medium text-sm sticky left-0 z-50 col-span-1" style={{ gridRow: 1 }}>
                        Date / Time
                    </div>
                    {Array.from({ length: 24 }).map((_, h) => {
                        let hourLabel = h.toString()
                        let periodLabel = ''
                        if (!is24Hour) {
                            const date = new Date()
                            date.setHours(h, 0, 0, 0)
                            hourLabel = format(date, "h")
                            periodLabel = format(date, "a")
                        }
                        return (
                            <div key={h} className="grid-header-cell col-span-2 p-2 border-b border-border bg-muted/50 text-xs text-center text-muted-foreground border-r last:border-r-0 flex flex-col items-center justify-center" style={{ gridRow: 1 }}>
                                <span>{hourLabel}</span>
                                {!is24Hour && <span className="text-[10px]">{periodLabel}</span>}
                            </div>
                        )
                    })}

                    {days.map((day, dayIdx) => {
                        const rowIdx = dayIdx + 2
                        const ranges = getRangesForDay(day, dayIdx)

                        return (
                            <Fragment key={day.toISOString()}>
                                {/* Row Header */}
                                <div
                                    className="grid-header-cell p-1 md:p-2 border-r border-border bg-card font-medium text-xs sticky left-0 z-40 flex flex-col justify-center border-b h-10 md:h-12"
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
                                            data-day={dayIdx}
                                            data-time={i}
                                            onMouseDown={() => handleMouseDown(dayIdx, i)}
                                            onClick={() => handleClick(dayIdx, i)}
                                            onMouseEnter={() => handleMouseEnter(dayIdx, i)}
                                            onTouchStart={(e) => handleTouchStart(e, dayIdx, i)}
                                            className={cn(
                                                "border-b border-border/30 h-10 md:h-12 transition-colors relative",
                                                isSelectionMode ? "cursor-crosshair touch-none" : "cursor-pointer",
                                                isHourStart ? "border-r border-border/50" : "border-r border-border/30 border-dashed",
                                                !isEffectiveSelected && "hover:bg-emerald-500/10",
                                                !isEffectiveSelected && isWeekend && "bg-orange-50/30 dark:bg-orange-900/10"
                                            )}
                                            style={{
                                                gridRow: rowIdx,
                                                gridColumn: i + 2,
                                                backgroundColor: !isEffectiveSelected && heatmap[time.toISOString()]
                                                    ? `rgba(99, 102, 241, ${Math.min(heatmap[time.toISOString()] * 0.15, 0.6)})`
                                                    : undefined
                                            }}
                                        >
                                            {/* Heatmap Count */}
                                            {(() => {
                                                const othersCount = heatmap[time.toISOString()] || 0
                                                const totalCount = othersCount + (isEffectiveSelected ? 1 : 0)
                                                if (totalCount === 0) return null
                                                return (
                                                    <div className="absolute bottom-0 right-1 pointer-events-none z-20">
                                                        <span className={cn(
                                                            "text-[10px] font-medium transition-colors",
                                                            isEffectiveSelected ? "text-white/90" : "text-indigo-900/40 dark:text-indigo-100/40"
                                                        )}>
                                                            {totalCount}
                                                        </span>
                                                    </div>
                                                )
                                            })()}

                                            {/* Highlight for Selected Meeting Time */}
                                            {isCurrentSelected && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-700 animate-pulse z-30" />
                                            )}
                                            {/* Now marker */}
                                            {(() => {
                                                const now = new Date()
                                                const timeStart = time.getTime()
                                                const timeEnd = addMinutes(time, 30).getTime()
                                                if (now.getTime() >= timeStart && now.getTime() < timeEnd) {
                                                    const fractionIn = (now.getTime() - timeStart) / (timeEnd - timeStart)
                                                    return (
                                                        <div
                                                            className="absolute top-0 bottom-0 w-0.5 bg-blue-400/60 z-25"
                                                            style={{ left: `${fractionIn * 100}%` }}
                                                        />
                                                    )
                                                }
                                                return null
                                            })()}
                                        </div>
                                    )
                                })}

                                {/* Overlay Ranges */}
                                {/* Overlay Ranges: Layer 1 - Backgrounds (Behind Heatmap) */}
                                {ranges.map((range, rIdx) => (
                                    <div
                                        key={`range-bg-${rIdx}`}
                                        className={cn(
                                            "rounded-sm h-10 mt-1 pointer-events-none z-10 shadow-sm mx-px",
                                            isDragging ? "bg-emerald-500/90" : "bg-emerald-500"
                                        )}
                                        style={{
                                            gridColumnStart: range.startSlot + 2,
                                            gridColumnEnd: range.endSlot + 2,
                                            gridRowStart: rowIdx,
                                            gridRowEnd: rowIdx + 1
                                        }}
                                    />
                                ))}

                                {/* Overlay Ranges: Layer 2 - Text Labels (On Top of Everything) */}
                                {ranges.map((range, rIdx) => (
                                    <div
                                        key={`range-lbl-${rIdx}`}
                                        className="flex items-center px-1 overflow-hidden whitespace-nowrap h-10 mt-1 pointer-events-none z-30 mx-px bg-transparent"
                                        style={{
                                            gridColumnStart: range.startSlot + 2,
                                            gridColumnEnd: range.endSlot + 2,
                                            gridRowStart: rowIdx,
                                            gridRowEnd: rowIdx + 1
                                        }}
                                    >
                                        {(() => {
                                            const durationSlots = range.endSlot - range.startSlot
                                            let text = ""
                                            if (durationSlots > 2) {
                                                text = `${format(range.startTime, "h:mm a")} - ${format(range.endTime, "h:mm a")}`
                                            } else if (durationSlots > 1) {
                                                text = format(range.startTime, "h:mm")
                                            }

                                            if (!text) return null

                                            return (
                                                <span className="text-white text-[10px] font-medium bg-black/40 px-1.5 py-0.5 rounded shadow-sm">
                                                    {text}
                                                </span>
                                            )
                                        })()}
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
