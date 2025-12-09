"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea" // Ensure this exists or use standard textarea
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Copy } from "lucide-react"
import { format, getUnixTime } from "date-fns"
import { toZonedTime } from "date-fns-tz"

interface MeetingDiscordWidgetProps {
    selectedTime: Date
    participants: any[]
}

export function MeetingDiscordWidget({ selectedTime, participants }: MeetingDiscordWidgetProps) {
    const [snippet, setSnippet] = useState("")
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        const unixTime = getUnixTime(selectedTime)
        let text = `Proposed time: <t:${unixTime}:F> (<t:${unixTime}:R>)\n\n`
        text += "```\n"

        // Get unique timezones to avoid spam
        const uniqueTimezones = Array.from(new Set(participants.map(p => p.timezone)))

        uniqueTimezones.forEach(tz => {
            try {
                const localTime = toZonedTime(selectedTime, tz)
                const dateStr = format(localTime, "EEE, MMM d")
                const timeStr = format(localTime, "h:mm a") // Default to 12h for now
                // Find participants in this timezone
                const people = participants.filter(p => p.timezone === tz).map(p => p.name).join(", ")

                text += `${tz} (${people}): ${dateStr} ${timeStr}\n`
            } catch (e) {
                // ignore invalid TZs
            }
        })

        text += "```"
        setSnippet(text)
    }, [selectedTime, participants])

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
        <Card className="bg-card/50 backdrop-blur-md border-border h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Discord Snippet</CardTitle>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 border-indigo-500/50"
                >
                    {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? "Copied!" : "Copy"}
                </Button>
            </CardHeader>
            <CardContent>
                <textarea
                    value={snippet}
                    readOnly
                    className="w-full font-mono text-sm h-[200px] bg-muted/50 border border-input rounded-md p-2 resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
            </CardContent>
        </Card>
    )
}
