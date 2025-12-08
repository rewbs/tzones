"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export interface City {
    id: string
    name: string
    timezone: string
}

interface TimeContextType {
    cities: City[]
    addCity: (city: City) => void
    removeCity: (id: string) => void
    updateCity: (id: string, city: City) => void

    offsetMinutes: number
    setOffsetMinutes: (minutes: number) => void

    use24Hour: boolean
    setUse24Hour: (use24: boolean) => void

    userTimezone: string
    setUserTimezone: (tz: string) => void

    currentTime: Date // The "Now" + offset
    realTime: Date // The actual "Now"

    reorderCities: (fromIndex: number, toIndex: number) => void
}

const TimeContext = createContext<TimeContextType | undefined>(undefined)

const DEFAULT_CITIES: City[] = [
    { id: "1", name: "Sydney", timezone: "Australia/Sydney" },
    { id: "2", name: "San Francisco", timezone: "America/Los_Angeles" },
    { id: "3", name: "New York", timezone: "America/New_York" },
    { id: "4", name: "London", timezone: "Europe/London" },
]

export function TimeProvider({ children }: { children: React.ReactNode }) {
    const [cities, setCities] = useState<City[]>(DEFAULT_CITIES)
    const [offsetMinutes, setOffsetMinutes] = useState(0)
    const [use24Hour, setUse24Hour] = useState(false)
    const [userTimezone, setUserTimezone] = useState("UTC")
    const [realTime, setRealTime] = useState(new Date())

    // Initialize user timezone and load state
    useEffect(() => {
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
            setUserTimezone(tz)
        } catch (e) {
            console.warn("Could not detect timezone", e)
        }

        // Check URL params first
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search)
            const tParam = params.get("t")
            const cParam = params.get("c")

            if (tParam || cParam) {
                // Load from URL
                if (cParam) {
                    try {
                        const citiesMin = JSON.parse(cParam)
                        const loadedCities = citiesMin.map((c: any, i: number) => ({
                            id: String(i + 1),
                            name: c.n,
                            timezone: c.z
                        }))
                        setCities(loadedCities)
                    } catch (e) {
                        console.error("Failed to parse cities from URL", e)
                    }
                }

                if (tParam) {
                    try {
                        const targetTime = parseInt(tParam)
                        const now = new Date().getTime()
                        const diffMinutes = Math.round((targetTime - now) / 60000)
                        setOffsetMinutes(diffMinutes)
                    } catch (e) {
                        console.error("Failed to parse time from URL", e)
                    }
                }
                return // Skip localStorage if URL params exist
            }
        }

        // Load state from localStorage
        const saved = localStorage.getItem("tzones-state")
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                if (parsed.cities) setCities(parsed.cities)
                if (parsed.use24Hour !== undefined) setUse24Hour(parsed.use24Hour)
                if (parsed.userTimezone) setUserTimezone(parsed.userTimezone)
            } catch (e) {
                console.error("Failed to load state", e)
            }
        }
    }, [])

    // Save state
    useEffect(() => {
        localStorage.setItem("tzones-state", JSON.stringify({
            cities,
            use24Hour,
            userTimezone
        }))
    }, [cities, use24Hour, userTimezone])

    // Update real time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setRealTime(new Date())
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const currentTime = new Date(realTime.getTime() + offsetMinutes * 60 * 1000)

    const addCity = (city: City) => setCities(prev => [...prev, city])
    const removeCity = (id: string) => setCities(prev => prev.filter(c => c.id !== id))
    const updateCity = (id: string, updates: City) => {
        setCities(prev => prev.map(c => c.id === id ? updates : c))
    }

    const reorderCities = (fromIndex: number, toIndex: number) => {
        setCities(prev => {
            const result = Array.from(prev)
            const [removed] = result.splice(fromIndex, 1)
            result.splice(toIndex, 0, removed)
            return result
        })
    }

    return (
        <TimeContext.Provider value={{
            cities, addCity, removeCity, updateCity, reorderCities,
            offsetMinutes, setOffsetMinutes,
            use24Hour, setUse24Hour,
            userTimezone, setUserTimezone,
            currentTime, realTime
        }}>
            {children}
        </TimeContext.Provider>
    )
}

export function useTime() {
    const context = useContext(TimeContext)
    if (!context) throw new Error("useTime must be used within a TimeProvider")
    return context
}
