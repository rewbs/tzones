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
    PointerSensor,
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

function SortableTimelineRow({ city, currentTime, use24Hour, hoursToRender }: any) {
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
        position: 'relative' as const,
    };

    let localTime: Date
    try {
        localTime = toZonedTime(currentTime, city.timezone)
    } catch (e) { localTime = currentTime }

    const currentMinute = localTime.getMinutes()
    const minuteOffsetPx = (currentMinute / 60) * HOUR_WIDTH

    return (
        <div ref={setNodeRef} style={style} className="flex border-b border-slate-800/50 h-16 bg-slate-900/50">
            {/* Sidebar with Drag Handle */}
            <div className="w-48 shrink-0 bg-slate-900/95 backdrop-blur z-10 border-r border-slate-800 p-2 flex items-center gap-2 relative">
                <button className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400" {...attributes} {...listeners}>
                    <GripVertical className="h-4 w-4" />
                </button>
                <div className="flex flex-col justify-center overflow-hidden">
                    <div className="font-medium text-sm truncate">{city.name}</div>
                    <div className="text-xs text-slate-400">
                        {format(localTime, use24Hour ? "HH:mm" : "h:mm a")}
                    </div>
                    <div className="text-xs text-slate-500">
                        {format(localTime, "EEE, MMM d")}
                    </div>
                </div>
            </div>

            {/* Track */}
            <div
                className="flex absolute left-48 right-0 top-0 bottom-0 overflow-hidden"
            >
                <div
                    className="flex absolute left-1/2 h-full transition-transform duration-75 ease-out will-change-transform"
                    style={{
                        transform: `translateX(calc(-${minuteOffsetPx}px - ${12 * HOUR_WIDTH}px))`
                    }}
                >
                    {hoursToRender.map((i: number) => {
                        const blockTime = addHours(startOfHour(localTime), i)
                        const h = blockTime.getHours()

                        let bgClass = "bg-slate-950/50" // Night
                        if (h >= 6 && h < 18) bgClass = "bg-emerald-900/20" // Day
                        if (h >= 9 && h < 17) bgClass = "bg-emerald-900/40" // Business

                        const isMidnight = h === 0

                        return (
                            <div
                                key={i}
                                className={`w-[60px] h-full border-r border-slate-800/30 flex items-center justify-center text-xs text-slate-500 relative ${bgClass}`}
                            >
                                {isMidnight ? (
                                    <span className="font-bold text-slate-300">{format(blockTime, "EEE")}</span>
                                ) : (
                                    <span>{use24Hour ? h : format(blockTime, "h a")}</span>
                                )}

                                {isMidnight && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-yellow-500/50" />}
                            </div>
                        )
                    })}
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

    const sensors = useSensors(
        useSensor(PointerSensor),
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
        // Only trigger if clicking on the track area, not the sidebar
        // But since sidebar is on top, this might be fine.
        // Let's ensure we don't conflict with dnd-kit.
        // dnd-kit uses the handle we added.
        setIsDraggingTime(true)
        setStartX(e.clientX)
        setStartOffset(offsetMinutes)
    }

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingTime) return
            const deltaX = startX - e.clientX
            const deltaMinutes = Math.round(deltaX * (60 / HOUR_WIDTH))
            setOffsetMinutes(startOffset + deltaMinutes)
        }

        const handleMouseUp = () => {
            setIsDraggingTime(false)
        }

        if (isDraggingTime) {
            window.addEventListener("mousemove", handleMouseMove)
            window.addEventListener("mouseup", handleMouseUp)
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("mouseup", handleMouseUp)
        }
    }, [isDraggingTime, startX, startOffset, setOffsetMinutes])

    const hoursToRender = Array.from({ length: 25 }, (_, i) => i - 12)

    return (
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl overflow-hidden shadow-xl select-none">
            <div className="p-4 border-b border-slate-800 font-medium text-slate-400 text-sm flex justify-between">
                <span>Timeline (Drag track to scroll, drag handle to reorder)</span>
                <div className="w-0.5 h-4 bg-emerald-500 mx-auto absolute left-1/2 top-12 z-20" />
            </div>

            <div
                ref={containerRef}
                className="relative overflow-hidden cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
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
                        {cities.map(city => (
                            <SortableTimelineRow
                                key={city.id}
                                city={city}
                                currentTime={currentTime}
                                use24Hour={use24Hour}
                                hoursToRender={hoursToRender}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                {/* Center Line Overlay */}
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-emerald-500 z-20 pointer-events-none shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </div>
        </div>
    )
}
