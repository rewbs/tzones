"use client"

import * as React from "react"
import { Check, ChevronsUpDown, MapPin, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { CITY_TIMEZONES, searchCities, formatCityEntry, type CityEntry } from "@/lib/city-timezones"

// Fallback timezones
const TIMEZONES = [
    "UTC", "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
    "Africa/Cairo", "Africa/Johannesburg", "Africa/Nairobi", "Asia/Dubai", "Asia/Karachi", "Asia/Kolkata",
    "Asia/Bangkok", "Asia/Shanghai", "Asia/Singapore", "Asia/Tokyo", "Asia/Seoul",
    "Australia/Perth", "Australia/Adelaide", "Australia/Sydney", "Australia/Brisbane",
    "Pacific/Auckland", "Pacific/Honolulu", "America/Anchorage", "America/Los_Angeles",
    "America/Denver", "America/Chicago", "America/New_York", "America/Toronto",
    "America/Sao_Paulo", "America/Argentina/Buenos_Aires"
]

let ALL_TIMEZONES = TIMEZONES
try {
    if (typeof Intl !== "undefined" && (Intl as any).supportedValuesOf) {
        ALL_TIMEZONES = (Intl as any).supportedValuesOf("timeZone")
    }
} catch (e) { }

interface TimezoneComboboxProps {
    value: string
    onValueChange: (value: string) => void
    placeholder?: string
    className?: string
    disabled?: boolean
}

// Find city entry that matches the timezone value
function findCityForTimezone(timezone: string): CityEntry | undefined {
    return CITY_TIMEZONES.find(entry => entry.timezone === timezone)
}

export function TimezoneCombobox({ value, onValueChange, placeholder = "Select timezone...", className, disabled }: TimezoneComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")

    // Get display value - show city name if we can find one
    const displayValue = React.useMemo(() => {
        if (!value) return ""
        const cityEntry = findCityForTimezone(value)
        if (cityEntry) {
            return `${cityEntry.city}, ${cityEntry.country}`
        }
        // Fallback to timezone name, formatted nicely
        return value.replace(/_/g, " ")
    }, [value])

    // Filter cities based on search
    const filteredCities = React.useMemo(() => {
        if (!search) return []
        return searchCities(search).slice(0, 10) // Limit to 10 results
    }, [search])

    // Filter timezones based on search
    const filteredTimezones = React.useMemo(() => {
        if (!search) return ALL_TIMEZONES.slice(0, 20) // Show first 20 when no search
        const normalizedSearch = search.toLowerCase()
        return ALL_TIMEZONES.filter(tz =>
            tz.toLowerCase().includes(normalizedSearch)
        ).slice(0, 15) // Limit to 15 results
    }, [search])

    const handleCitySelect = (entry: CityEntry) => {
        onValueChange(entry.timezone)
        setOpen(false)
        setSearch("")
    }

    const handleTimezoneSelect = (timezone: string) => {
        onValueChange(timezone)
        setOpen(false)
        setSearch("")
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("justify-between", className)}
                    disabled={disabled}
                >
                    <span className="truncate">{displayValue || placeholder}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search city or timezone..."
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>

                        {/* Cities section */}
                        {filteredCities.length > 0 && (
                            <CommandGroup heading="Cities">
                                {filteredCities.map((entry) => (
                                    <CommandItem
                                        key={`city-${entry.city}-${entry.country}`}
                                        value={`city-${entry.city}-${entry.country}`}
                                        onSelect={() => handleCitySelect(entry)}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Check
                                                className={cn(
                                                    "h-4 w-4",
                                                    value === entry.timezone ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <MapPin className="h-3 w-3 text-muted-foreground" />
                                            <span>{formatCityEntry(entry)}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {entry.timezone.split("/").pop()?.replace(/_/g, " ")}
                                        </span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {/* Timezones section */}
                        {filteredTimezones.length > 0 && (
                            <CommandGroup heading="Timezones">
                                {filteredTimezones.map((tz) => (
                                    <CommandItem
                                        key={`tz-${tz}`}
                                        value={`tz-${tz}`}
                                        onSelect={() => handleTimezoneSelect(tz)}
                                        className="flex items-center gap-2"
                                    >
                                        <Check
                                            className={cn(
                                                "h-4 w-4",
                                                value === tz ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                        <span>{tz}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
