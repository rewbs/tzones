"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
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

export function TimezoneCombobox({ value, onValueChange, placeholder = "Select timezone...", className, disabled }: TimezoneComboboxProps) {
    const [open, setOpen] = React.useState(false)

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
                    <span className="truncate">{value || placeholder}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder="Search timezone..." />
                    <CommandList>
                        <CommandEmpty>No timezone found.</CommandEmpty>
                        <CommandGroup>
                            {ALL_TIMEZONES.map((tz) => (
                                <CommandItem
                                    key={tz}
                                    value={tz}
                                    onSelect={(currentValue) => {
                                        onValueChange(currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === tz ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {tz}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
