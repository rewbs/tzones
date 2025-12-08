"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Copy, Link as LinkIcon } from "lucide-react"
import { getUnixTime } from "date-fns"
import { City } from "./time-provider"

interface SharePopoverProps {
    date: Date
    cities: City[]
}

export function SharePopover({ date, cities }: SharePopoverProps) {
    const unixTime = getUnixTime(date)

    // Discord timestamp formats
    const fullTimestamp = `<t:${unixTime}:F>`
    const relativeTimestamp = `<t:${unixTime}:R>`

    const [copiedFull, setCopiedFull] = useState(false)
    const [copiedRelative, setCopiedRelative] = useState(false)
    const [copiedLink, setCopiedLink] = useState(false)
    const [shareUrl, setShareUrl] = useState("")

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams()

            // Encode time
            params.set("t", date.getTime().toString())

            // Encode cities (minified)
            const citiesMin = cities.map(c => ({
                n: c.name,
                z: c.timezone
            }))
            params.set("c", JSON.stringify(citiesMin))

            const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`
            setShareUrl(url)
        }
    }, [date, cities])

    const copyToClipboard = async (text: string, setCopied: (val: boolean) => void) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy:", err)
        }
    }

    return (
        <div className="grid gap-4">
            <div className="space-y-2">
                <h4 className="font-medium leading-none">Share</h4>
                <p className="text-sm text-muted-foreground">
                    Share this configuration or copy Discord timestamps.
                </p>
            </div>

            <div className="grid gap-2">
                <div className="grid gap-1">
                    <Label htmlFor="share-link" className="text-xs">Share Link</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id="share-link"
                            value={shareUrl}
                            readOnly
                            className="font-mono text-xs h-8 bg-slate-950/50"
                        />
                        <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 shrink-0"
                            onClick={() => copyToClipboard(shareUrl, setCopiedLink)}
                        >
                            {copiedLink ? <Check className="h-3 w-3 text-emerald-500" /> : <LinkIcon className="h-3 w-3" />}
                            <span className="sr-only">Copy link</span>
                        </Button>
                    </div>
                </div>

                <div className="border-t border-slate-800 my-1" />

                <div className="grid gap-1">
                    <Label htmlFor="full-timestamp" className="text-xs">Discord: Full Date & Time</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id="full-timestamp"
                            value={fullTimestamp}
                            readOnly
                            className="font-mono text-xs h-8 bg-slate-950/50"
                        />
                        <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 shrink-0"
                            onClick={() => copyToClipboard(fullTimestamp, setCopiedFull)}
                        >
                            {copiedFull ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                            <span className="sr-only">Copy full timestamp</span>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-1">
                    <Label htmlFor="relative-timestamp" className="text-xs">Discord: Relative Time</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id="relative-timestamp"
                            value={relativeTimestamp}
                            readOnly
                            className="font-mono text-xs h-8 bg-slate-950/50"
                        />
                        <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 shrink-0"
                            onClick={() => copyToClipboard(relativeTimestamp, setCopiedRelative)}
                        >
                            {copiedRelative ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                            <span className="sr-only">Copy relative timestamp</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
