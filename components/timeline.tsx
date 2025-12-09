"use client"

import { useTime } from "@/components/time-provider"
import { useRef, useState, useEffect } from "react"
import { toZonedTime } from "date-fns-tz"
import { addHours, format, startOfHour } from "date-fns"
import { GripVertical } from "lucide-react"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const HOUR_WIDTH = 60 // px

function SortableTimelineRow({ city, currentTime, use24Hour, hoursToRender, hoursEachSide, isFirstRow, offsetMinutes }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: city.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
        opacity: isDragging ? 0.5 : 1,
    };

    // localTime is for sidebar display only
    let localTime: Date
    try {
        localTime = toZonedTime(currentTime, city.timezone)
    } catch (e) { localTime = currentTime }

    // EXACTLY MATCHING MEETING-TIMELINE POSITIONING LOGIC:
    // The anchor is the start of the hour containing currentTime
    const anchorHour = startOfHour(currentTime)

    // Minutes into the current hour (0-59) - for sub-hour precision
    const minuteOffset = currentTime.getMinutes()
    const minuteOffsetPx = (minuteOffset / 60) * HOUR_WIDTH

    // centerBlockOffset = where block i=0 starts in the track
    const centerBlockOffset = hoursEachSide * HOUR_WIDTH

    return (
        <div ref={setNodeRef} style={style} className="relative flex border border-border bg-card/50 rounded-lg overflow-hidden h-16 mb-1 shadow-sm">
            {/* Sidebar with Drag Handle */}
            <div className="w-48 shrink-0 bg-card/95 backdrop-blur z-10 border-r border-border p-2 flex items-center gap-1">
                <button
                    className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none p-2 -ml-2"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="h-4 w-4" />
                </button>
                <div className="flex flex-col justify-center overflow-hidden">
                    <div className="font-medium text-sm truncate">{city.name}</div>
                    <div className="text-xs text-muted-foreground">
                        {format(localTime, use24Hour ? "HH:mm" : "h:mm a")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {format(localTime, "EEE, MMM d")}
                    </div>
                </div>
            </div>

            {/* Track Container - Takes remaining space (like meeting-timeline) */}
            <div className="flex-1 relative overflow-hidden">
                {/* ... rendered content ... */}
                <div
                    className="flex absolute h-full transition-transform duration-75 ease-out will-change-transform"
                    style={{
                        left: '50%',
                        transform: `translateX(-${centerBlockOffset + minuteOffsetPx}px)`
                    }}
                >
                    {hoursToRender.map((hourOffset: number) => {
                        // Absolute time for this block
                        const blockTime = addHours(anchorHour, hourOffset)

                        // Convert to city's timezone for display
                        let displayTime: Date
                        try {
                            displayTime = toZonedTime(blockTime, city.timezone)
                        } catch (e) { displayTime = blockTime }

                        const h = displayTime.getHours()
                        const isMidnight = h === 0

                        // Background color based on time of day
                        let bgClass = "bg-background/80" // Night
                        if (h >= 6 && h < 18) bgClass = "bg-yellow-500/10 dark:bg-emerald-900/20" // Day
                        if (h >= 9 && h < 17) bgClass = "bg-yellow-500/20 dark:bg-emerald-900/40" // Business

                        return (
                            <div
                                key={hourOffset}
                                className={`w-[${HOUR_WIDTH}px] shrink-0 h-full border-r border-border/30 flex items-center justify-center text-xs text-muted-foreground relative ${bgClass}`}
                                style={{ width: HOUR_WIDTH }}
                            >
                                {isMidnight ? (
                                    <span className="font-bold text-foreground">{format(displayTime, "EEE")}</span>
                                ) : (
                                    <span>{use24Hour ? h : format(displayTime, "h a")}</span>
                                )}

                                {isMidnight && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-yellow-500/50" />}
                            </div>
                        )
                    })}
                </div>

                {/* Green "selected" line - at center of track */}
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-emerald-500 z-20 pointer-events-none shadow-[0_0_10px_rgba(16,185,129,0.5)] -translate-x-1/2">
                    {isFirstRow && <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[8px] text-emerald-200 font-medium whitespace-nowrap bg-emerald-900/80 px-1 rounded">selected</span>}
                </div>

                {/* Blue "now" line - offset from center based on offsetMinutes */}
                <div
                    className="absolute top-0 bottom-0 w-0.5 bg-blue-400/70 z-15 pointer-events-none -translate-x-1/2"
                    style={{ left: `calc(50% - ${(offsetMinutes / 60) * HOUR_WIDTH}px)` }}
                >
                    {isFirstRow && <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[8px] text-blue-200 font-medium whitespace-nowrap bg-blue-900/80 px-1 rounded">now</span>}
                </div>
            </div>
        </div>
    )
}

export function Timeline() {
    const { cities, offsetMinutes, setOffsetMinutes, currentTime, use24Hour, reorderCities } = useTime()
    const containerRef = useRef<HTMLDivElement>(null)
    const [isDraggingTime, setIsDraggingTime] = useState(false)
    const [startX, setStartX] = useState(0)
    const [startOffset, setStartOffset] = useState(0)
    const [hoursEachSide, setHoursEachSide] = useState(18)

    // Responsive hours - more on wider screens
    useEffect(() => {
        const updateHours = () => {
            const width = window.innerWidth
            if (width >= 1536) { // 2xl
                setHoursEachSide(36)
            } else if (width >= 1280) { // xl
                setHoursEachSide(28)
            } else if (width >= 1024) { // lg
                setHoursEachSide(22)
            } else {
                setHoursEachSide(18)
            }
        }
        updateHours()
        window.addEventListener('resize', updateHours)
        return () => window.removeEventListener('resize', updateHours)
    }, [])

    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor), // No constraints for handle-based drag
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = cities.findIndex((c) => c.id === active.id);
            const newIndex = cities.findIndex((c) => c.id === over.id);
            reorderCities(oldIndex, newIndex);
        }
    };

    // Handle Time Drag (Horizontal)
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDraggingTime(true)
        setStartX(e.clientX)
        setStartOffset(offsetMinutes)
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDraggingTime(true)
        setStartX(e.touches[0].clientX)
        setStartOffset(offsetMinutes)
    }

    useEffect(() => {
        const handleVerboseMouseMove = (currentX: number) => {
            if (!isDraggingTime) return
            const deltaX = startX - currentX
            const deltaMinutes = Math.round(deltaX * (60 / HOUR_WIDTH))
            setOffsetMinutes(startOffset + deltaMinutes)
        }

        const handleMouseMove = (e: MouseEvent) => handleVerboseMouseMove(e.clientX)
        const handleTouchMove = (e: TouchEvent) => handleVerboseMouseMove(e.touches[0].clientX)

        const handleMouseUp = () => {
            setIsDraggingTime(false)
        }

        if (isDraggingTime) {
            window.addEventListener("mousemove", handleMouseMove)
            window.addEventListener("mouseup", handleMouseUp)
            window.addEventListener("touchmove", handleTouchMove)
            window.addEventListener("touchend", handleMouseUp)
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("mouseup", handleMouseUp)
            window.removeEventListener("touchmove", handleTouchMove)
            window.removeEventListener("touchend", handleMouseUp)
        }
    }, [isDraggingTime, startX, startOffset, setOffsetMinutes])

    const hoursToRender = Array.from({ length: hoursEachSide * 2 + 1 }, (_, i) => i - hoursEachSide)

    return (
        <div className="bg-card/50 backdrop-blur-md border border-border rounded-xl overflow-hidden shadow-xl select-none">
            <div className="p-4 border-b border-border font-medium text-muted-foreground text-sm flex justify-between">
                <span>Timeline (Drag track to scroll, drag handle to reorder)</span>
            </div>

            <div
                ref={containerRef}
                className="relative overflow-hidden cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={cities.map(c => c.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {cities.map((city, idx) => (
                            <SortableTimelineRow
                                key={city.id}
                                city={city}
                                currentTime={currentTime}
                                use24Hour={use24Hour}
                                hoursToRender={hoursToRender}
                                hoursEachSide={hoursEachSide}
                                isFirstRow={idx === 0}
                                offsetMinutes={offsetMinutes}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

            </div>
        </div>
    )
}
