"use client"

import { City, useTime } from "@/components/time-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Edit2 } from "lucide-react"
import { format } from "date-fns"
import { toZonedTime } from "date-fns-tz"

interface CityCardProps {
    city: City
    onEdit: () => void
}

export function CityCard({ city, onEdit }: CityCardProps) {
    const { currentTime, use24Hour, removeCity } = useTime()

    let localTime: Date
    try {
        localTime = toZonedTime(currentTime, city.timezone)
    } catch (e) {
        localTime = currentTime
    }

    const hour = localTime.getHours()
    const isDay = hour >= 6 && hour < 18
    const isBusiness = hour >= 9 && hour < 17

    // Analog Clock SVG
    const hours = localTime.getHours() % 12
    const minutes = localTime.getMinutes()
    const seconds = localTime.getSeconds()
    const hourDeg = (hours * 30) + (minutes * 0.5)
    const minuteDeg = (minutes * 6) + (seconds * 0.1)
    const secondDeg = seconds * 6

    return (
        <Card className={`relative overflow-hidden border-border bg-card/40 backdrop-blur transition-all hover:border-sidebar-border group
      ${isDay ? "shadow-[0_0_30px_-10px_rgba(253,224,71,0.1)]" : "shadow-[0_0_30px_-10px_rgba(99,102,241,0.1)]"}
    `}>
            <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-medium leading-none">{city.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{city.timezone}</p>
                </div>
                <div className="text-2xl">
                    {isDay ? "☀️" : "🌙"}
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mt-4">
                    {/* Clock */}
                    <div className="w-16 h-16 relative opacity-80">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/50" />
                            <line x1="50" y1="50" x2="50" y2="25" stroke="currentColor" strokeWidth="4" strokeLinecap="round" transform={`rotate(${hourDeg} 50 50)`} className="text-foreground" />
                            <line x1="50" y1="50" x2="50" y2="15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" transform={`rotate(${minuteDeg} 50 50)`} className="text-muted-foreground" />
                            <line x1="50" y1="50" x2="50" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" transform={`rotate(${secondDeg} 50 50)`} className="text-red-500" />
                            <circle cx="50" cy="50" r="3" fill="currentColor" className="text-muted-foreground" />
                        </svg>
                    </div>

                    <div className="text-right">
                        <div className="text-3xl font-bold font-mono tracking-tight whitespace-nowrap">
                            {use24Hour ? (
                                format(localTime, "HH:mm")
                            ) : (
                                <>
                                    {format(localTime, "h:mm")}
                                    <span className={`text-xl ml-1 ${localTime.getHours() < 12 ? 'text-red-400/80' : 'text-blue-400/80'}`}>
                                        {format(localTime, "a")}
                                    </span>
                                </>
                            )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {format(localTime, "EEE, MMM d")}
                        </div>
                        <div className={`text-xs mt-1 font-medium ${isBusiness ? 'text-emerald-400' : 'invisible'}`}>
                            Business Hours
                        </div>
                    </div>
                </div>

                {/* Day Progress Bar */}
                <div className="mt-6 relative h-2 bg-muted rounded-full overflow-hidden w-full">
                    {/* Gradient Background */}
                    <div
                        className="absolute inset-0 w-full h-full opacity-80"
                        style={{
                            background: `linear-gradient(90deg, 
                                #0f172a 0%, 
                                #1e293b 20%, 
                                #60a5fa 25%, 
                                #10b981 37.5%, 
                                #10b981 70.8%, 
                                #f97316 80%, 
                                #0f172a 95%
                            )`
                        }}
                    />

                    {/* Current Time Indicator */}
                    <div
                        className="absolute top-0 bottom-0 w-1.5 bg-foreground shadow-[0_0_8px_rgba(255,255,255,0.8)] rounded-full z-10"
                        style={{
                            left: `${((localTime.getHours() * 60 + localTime.getMinutes()) / 1440) * 100}%`,
                            transform: 'translateX(-50%)'
                        }}
                    />
                </div>
            </CardContent>

            {/* Actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}>
                    <Edit2 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-red-400" onClick={() => removeCity(city.id)}>
                    <X className="h-3 w-3" />
                </Button>
            </div>
        </Card>
    )
}
