"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import { useAbly } from '@/components/ably-provider'
import type Ably from 'ably'

interface PresenceMember {
    clientId: string
    data?: {
        participantId?: string
        name?: string
    }
}

interface UseMeetingChannelOptions {
    meetingId: string
    participantId?: string
    participantName?: string
    onAvailabilityUpdate?: (participantId: string, slots: string[]) => void
    onParticipantJoined?: (participant: { id: string; name: string; timezone: string }) => void
    onTimezoneUpdate?: (participantId: string, timezone: string) => void
    onPresenceUpdate?: (members: PresenceMember[]) => void
}

export function useMeetingChannel({
    meetingId,
    participantId,
    participantName,
    onAvailabilityUpdate,
    onParticipantJoined,
    onTimezoneUpdate,
    onPresenceUpdate,
}: UseMeetingChannelOptions) {
    const { client, isConnected } = useAbly()
    const [channel, setChannel] = useState<Ably.RealtimeChannel | null>(null)
    const [presenceMembers, setPresenceMembers] = useState<PresenceMember[]>([])

    // Use refs to avoid stale closures in callbacks
    const callbacksRef = useRef({ onAvailabilityUpdate, onParticipantJoined, onTimezoneUpdate, onPresenceUpdate })
    callbacksRef.current = { onAvailabilityUpdate, onParticipantJoined, onTimezoneUpdate, onPresenceUpdate }

    useEffect(() => {
        if (!client || !isConnected || !meetingId) return

        const channelName = `meeting:${meetingId}`
        const ch = client.channels.get(channelName)
        setChannel(ch)

        // Subscribe to messages
        const handleMessage = (message: Ably.Message) => {
            const data = message.data

            switch (data.type) {
                case 'availability_update':
                    if (callbacksRef.current.onAvailabilityUpdate) {
                        callbacksRef.current.onAvailabilityUpdate(data.participantId, data.slots)
                    }
                    break
                case 'participant_joined':
                    if (callbacksRef.current.onParticipantJoined) {
                        callbacksRef.current.onParticipantJoined(data.participant)
                    }
                    break
                case 'timezone_update':
                    if (callbacksRef.current.onTimezoneUpdate) {
                        callbacksRef.current.onTimezoneUpdate(data.participantId, data.timezone)
                    }
                    break
            }
        }

        ch.subscribe(handleMessage)

        // Handle presence
        const updatePresence = async () => {
            try {
                const members = await ch.presence.get()
                const mapped = members.map(m => ({
                    clientId: m.clientId,
                    data: m.data as PresenceMember['data']
                }))
                setPresenceMembers(mapped)
                if (callbacksRef.current.onPresenceUpdate) {
                    callbacksRef.current.onPresenceUpdate(mapped)
                }
            } catch (e) {
                console.error('[Ably] Failed to get presence:', e)
            }
        }

        ch.presence.subscribe('enter', updatePresence)
        ch.presence.subscribe('leave', updatePresence)
        ch.presence.subscribe('update', updatePresence)

        // Enter presence if we have participant info
        if (participantId) {
            ch.presence.enter({
                participantId,
                name: participantName || 'Anonymous',
            })
        }

        // Get initial presence
        updatePresence()

        return () => {
            ch.unsubscribe()
            ch.presence.unsubscribe()
            if (participantId) {
                ch.presence.leave()
            }
        }
    }, [client, isConnected, meetingId, participantId, participantName])

    // Broadcast availability update
    const broadcastAvailability = useCallback((slots: string[]) => {
        if (!channel || !participantId) return

        channel.publish('update', {
            type: 'availability_update',
            participantId,
            slots,
        })
    }, [channel, participantId])

    // Broadcast new participant
    const broadcastParticipantJoined = useCallback((participant: { id: string; name: string; timezone: string }) => {
        if (!channel) return

        channel.publish('update', {
            type: 'participant_joined',
            participant,
        })
    }, [channel])

    // Broadcast timezone update
    const broadcastTimezone = useCallback((timezone: string) => {
        if (!channel || !participantId) return

        channel.publish('update', {
            type: 'timezone_update',
            participantId,
            timezone,
        })
    }, [channel, participantId])

    return {
        channel,
        isConnected,
        presenceMembers,
        broadcastAvailability,
        broadcastParticipantJoined,
        broadcastTimezone,
    }
}
