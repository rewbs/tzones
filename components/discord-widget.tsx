"use client"

import { useState, useEffect } from "react"
import { useTime } from "@/components/time-provider"
import { Button } from "@/components/ui/button"
import { Textarea } from "./ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Copy } from "lucide-react"
import { format, getUnixTime } from "date-fns"
import { toZonedTime } from "date-fns-tz"

export function DiscordWidget() {
    const { cities, currentTime, use24Hour, offsetMinutes } = useTime()
    const [snippet, setSnippet] = useState("")
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        const unixTime = getUnixTime(currentTime || new Date())

        // Calculate precise relative time
        let relativeTime = "now"
        if (Math.abs(offsetMinutes) >= 1) {
            const absMinutes = Math.abs(offsetMinutes)
            const days = Math.floor(absMinutes / (24 * 60))
            const hours = Math.floor((absMinutes % (24 * 60)) / 60)
            const minutes = absMinutes % 60

            const parts = []
            if (days > 0) parts.push(`${days}d`)
            if (hours > 0) parts.push(`${hours}h`)
            if (minutes > 0) parts.push(`${minutes}m`)

            relativeTime = offsetMinutes > 0 ? `in ${parts.join(" ")}` : `${parts.join(" ")} ago`
        }

        let text = `Proposed time: <t:${unixTime}:F> / ${relativeTime}\n\n`

        text += "```\n"

        cities.forEach(city => {
            try {
                const localTime = toZonedTime(currentTime, city.timezone)
                const dateStr = format(localTime, "EEE, MMM d")
                const timeStr = format(localTime, use24Hour ? "HH:mm" : "h:mm a")
                text += `${city.name}: ${dateStr} ${timeStr}\n`
            } catch (e) {
                text += `${city.name}: Invalid Timezone\n`
            }
        })

        text += "```"
        setSnippet(text)
    }, [cities, currentTime, use24Hour, offsetMinutes])

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(snippet)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy:", err)
        }
    }

    return (
        <Card className="bg-slate-900/50 backdrop-blur-md border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Discord Snippet</CardTitle>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 border-indigo-500/50"
                >
                    {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? "Copied!" : "Copy to Clipboard"}
                </Button>
            </CardHeader>
            <CardContent>
                <Textarea
                    value={snippet}
                    readOnly
                    className="font-mono text-sm h-[200px] bg-slate-950/50 border-slate-700 resize-none focus-visible:ring-indigo-500/50"
                />
            </CardContent>
        </Card>
    )
}
