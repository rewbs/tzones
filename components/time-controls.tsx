"use client"

import { useTime } from "@/components/time-provider"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { format, addMinutes, differenceInMinutes, startOfDay } from "date-fns"
import { CalendarIcon, RotateCcw, Share2 } from "lucide-react"
import { useState, useEffect } from "react"
import { TimezoneCombobox } from "./timezone-combobox"
import { SharePopover } from "./share-popover"

export function TimeControls() {
    const {
        cities,
        offsetMinutes, setOffsetMinutes,
        currentTime, realTime,
        use24Hour, setUse24Hour,
        userTimezone, setUserTimezone
    } = useTime()

    // Dynamic range logic
    const MAX_RANGE = 7 * 24 * 60 // 7 days
    const [rangeLimit, setRangeLimit] = useState(48 * 60) // +/- 48 hours

    useEffect(() => {
        const absOffset = Math.abs(offsetMinutes)
        if (absOffset > rangeLimit * 0.8 && rangeLimit < MAX_RANGE) {
            setRangeLimit(Math.min(MAX_RANGE, Math.max(48 * 60, absOffset * 1.5)))
        }
    }, [offsetMinutes, rangeLimit])

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return
        const now = new Date()
        const target = new Date(date)
        // Preserve current time selection
        const currentTarget = currentTime || now
        target.setHours(currentTarget.getHours(), currentTarget.getMinutes(), currentTarget.getSeconds())

        const diff = differenceInMinutes(target, now)
        setOffsetMinutes(diff)
    }

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const timeStr = e.target.value
        if (!timeStr) return

        const [hours, minutes] = timeStr.split(':').map(Number)
        const now = new Date()
        const target = new Date(currentTime || now)
        target.setHours(hours, minutes)

        const diff = differenceInMinutes(target, now)
        setOffsetMinutes(diff)
    }

    const handleSliderChange = (vals: number[]) => {
        setOffsetMinutes(vals[0])
    }

    const resetTime = () => setOffsetMinutes(0)

    // Format relative time
    const getRelativeTime = () => {
        if (Math.abs(offsetMinutes) < 1) return "Now"

        const diffMs = offsetMinutes * 60 * 1000
        const prefix = diffMs >= 0 ? "in " : ""
        const suffix = diffMs < 0 ? " ago" : ""

        const absMinutes = Math.abs(offsetMinutes)
        const days = Math.floor(absMinutes / (24 * 60))
        const hours = Math.floor((absMinutes % (24 * 60)) / 60)
        const minutes = absMinutes % 60

        let parts = []
        if (days > 0) parts.push(`${days}d`)
        if (hours > 0) parts.push(`${hours}h`)
        if (minutes > 0) parts.push(`${minutes}m`)

        return `${prefix}${parts.join(" ")}${suffix}`
    }

    // Generate tickmarks
    const tickmarks = []
    const tickStep = 6 * 60 // Every 6 hours
    for (let i = -rangeLimit; i <= rangeLimit; i += tickStep) {
        if (i === 0) continue // Skip center (handled separately)
        const percent = ((i + rangeLimit) / (rangeLimit * 2)) * 100
        tickmarks.push(
            <div
                key={i}
                className="absolute top-2 w-0.5 h-2 bg-border"
                style={{ left: `${percent}%` }}
            />
        )
    }

    return (
        <div className="bg-card/50 backdrop-blur-md border border-border rounded-xl p-6 shadow-xl">
            <div className="flex flex-col gap-6">
                {/* Top Row: Date, Reset, Timezone, Format */}
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-2 items-center">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[240px] justify-start text-left font-normal bg-background/50 border-input",
                                        !currentTime && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {currentTime ? format(currentTime, "PPP HH:mm") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={currentTime}
                                    onSelect={handleDateSelect}
                                    initialFocus
                                />
                                <div className="p-3 border-t border-border bg-muted/50">
                                    <Label className="text-xs mb-2 block">Time</Label>
                                    <input
                                        type="time"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        value={currentTime ? format(currentTime, "HH:mm") : ""}
                                        onChange={handleTimeChange}
                                    />
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Button variant="outline" size="icon" onClick={resetTime} disabled={offsetMinutes === 0} title="Reset to Now">
                            <RotateCcw className="h-4 w-4" />
                        </Button>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="icon" title="Share">
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80" align="start">
                                <SharePopover date={currentTime || new Date()} cities={cities} />
                            </PopoverContent>
                        </Popover>

                        <div className="flex items-center gap-2 ml-2">
                            <Label className="text-xs text-muted-foreground hidden md:block">Your Location:</Label>
                            <TimezoneCombobox
                                value={userTimezone}
                                onValueChange={setUserTimezone}
                                className="w-[200px] bg-background/50 border-input"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch id="24h-mode" checked={use24Hour} onCheckedChange={setUse24Hour} />
                        <Label htmlFor="24h-mode">24-Hour</Label>
                    </div>
                </div>

                {/* Slider Section */}
                <div className="space-y-4">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{getRelativeTime()}</span>
                        <span className="font-mono text-emerald-500 dark:text-emerald-400">
                            {format(currentTime, use24Hour ? "HH:mm" : "h:mm a")}
                        </span>
                    </div>

                    <div className="relative pt-6 pb-2">
                        {/* Tickmarks */}
                        {tickmarks}

                        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-mono">Now</div>

                        <Slider
                            defaultValue={[0]}
                            value={[offsetMinutes]}
                            min={-rangeLimit}
                            max={rangeLimit}
                            step={15}
                            onValueChange={handleSliderChange}
                            className="cursor-pointer relative z-10"
                        />

                        {/* Center Marker */}
                        <div className="absolute top-4 bottom-0 left-1/2 w-0.5 bg-emerald-500/50 pointer-events-none h-4" />
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground font-mono">
                        <span>-{Math.round(rangeLimit / 60)}h</span>
                        <span>+{Math.round(rangeLimit / 60)}h</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
