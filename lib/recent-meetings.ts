"use client"

export interface RecentMeeting {
    id: string
    title: string
    lastVisited: number // timestamp
}

const STORAGE_KEY = 'recent_meetings'
const MAX_RECENT = 10

export function getRecentMeetings(): RecentMeeting[] {
    if (typeof window === 'undefined') return []
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) return []
        const meetings: RecentMeeting[] = JSON.parse(stored)
        // Sort by lastVisited descending
        return meetings.sort((a, b) => b.lastVisited - a.lastVisited).slice(0, MAX_RECENT)
    } catch {
        return []
    }
}

export function addRecentMeeting(id: string, title: string): void {
    if (typeof window === 'undefined') return
    try {
        const meetings = getRecentMeetings()
        // Remove existing entry for this meeting if present
        const filtered = meetings.filter(m => m.id !== id)
        // Add to front with current timestamp
        const updated = [
            { id, title, lastVisited: Date.now() },
            ...filtered
        ].slice(0, MAX_RECENT)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
        // Ignore storage errors
    }
}

export function updateRecentMeetingTitle(id: string, title: string): void {
    if (typeof window === 'undefined') return
    try {
        const meetings = getRecentMeetings()
        const updated = meetings.map(m =>
            m.id === id ? { ...m, title } : m
        )
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
        // Ignore storage errors
    }
}
