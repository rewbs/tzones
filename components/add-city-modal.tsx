"use client"

import { useState, useEffect } from "react"
import { useTime } from "@/components/time-provider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TimezoneCombobox } from "./timezone-combobox"

interface AddCityModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editingId: string | null
}

export function AddCityModal({ open, onOpenChange, editingId }: AddCityModalProps) {
    const { addCity, updateCity, cities } = useTime()
    const [name, setName] = useState("")
    const [timezone, setTimezone] = useState("")

    useEffect(() => {
        if (open) {
            if (editingId) {
                const city = cities.find(c => c.id === editingId)
                if (city) {
                    setName(city.name)
                    setTimezone(city.timezone)
                }
            } else {
                setName("")
                setTimezone("")
            }
        }
    }, [open, editingId, cities])

    const handleSave = () => {
        if (!timezone) return

        // Default name to timezone (e.g. "Europe/London" -> "London" or just the full string)
        // Let's try to be smart: pick the last part of the timezone "Europe/London" -> "London"
        let finalName = name.trim()
        if (!finalName) {
            const parts = timezone.split("/")
            finalName = parts[parts.length - 1].replace(/_/g, " ")
        }

        if (editingId) {
            updateCity(editingId, { id: editingId, name: finalName, timezone })
        } else {
            addCity({
                id: Date.now().toString(),
                name: finalName,
                timezone
            })
        }
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{editingId ? "Edit City" : "Add City"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Timezone First */}
                    <div className="grid gap-2">
                        <Label>Timezone</Label>
                        <TimezoneCombobox
                            value={timezone}
                            onValueChange={setTimezone}
                            className="w-full"
                        />
                    </div>

                    {/* Name Second (Optional) */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Display Name <span className="text-slate-500 font-normal">(Optional)</span></Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder={timezone ? timezone.split("/").pop()?.replace(/_/g, " ") : "e.g. Home"}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} disabled={!timezone}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
