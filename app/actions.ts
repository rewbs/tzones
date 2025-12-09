'use server'

import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'

export async function createMeeting(title: string, initialTimezones?: { name: string; timezone: string }[]) {
    const id = nanoid(10)
    await prisma.meeting.create({
        data: {
            id,
            title,
            participants: initialTimezones ? {
                create: initialTimezones.map(tz => ({
                    id: nanoid(10),
                    name: tz.name,
                    timezone: tz.timezone,
                }))
            } : undefined,
        },
    })
    return id
}

export async function updateMeetingTitle(id: string, title: string) {
    await prisma.meeting.update({
        where: { id },
        data: { title },
    })
    revalidatePath(`/meet/${id}`)
}

export async function getMeeting(id: string) {
    return await prisma.meeting.findUnique({
        where: { id },
        include: {
            participants: {
                include: {
                    availability: true,
                },
            },
        },
    })
}

export async function joinMeeting(meetingId: string, name: string, timezone: string) {
    const participant = await prisma.participant.create({
        data: {
            meetingId,
            name,
            timezone,
        },
    })
    revalidatePath(`/meet/${meetingId}`)
    return participant
}

export async function updateAvailability(participantId: string, ranges: { startTime: Date; endTime: Date }[]) {
    // Transaction to replace availability
    await prisma.$transaction(async (tx) => {
        await tx.availability.deleteMany({
            where: { participantId },
        })

        if (ranges.length > 0) {
            await tx.availability.createMany({
                data: ranges.map((range) => ({
                    participantId,
                    startTime: range.startTime,
                    endTime: range.endTime,
                })),
            })
        }
    }, {
        maxWait: 5000, // 5s to wait for connection
        timeout: 10000 // 10s for transaction
    })

    // We need to know the meeting ID to revalidate
    const participant = await prisma.participant.findUnique({
        where: { id: participantId },
        select: { meetingId: true }
    })

    if (participant) {
        revalidatePath(`/meet/${participant.meetingId}`)
    }
}

export async function updateParticipantTimezone(participantId: string, timezone: string) {
    const participant = await prisma.participant.update({
        where: { id: participantId },
        data: { timezone },
    })
    revalidatePath(`/meet/${participant.meetingId}`)
    return participant
}

export async function updateParticipantName(participantId: string, name: string) {
    const participant = await prisma.participant.update({
        where: { id: participantId },
        data: { name },
    })
    revalidatePath(`/meet/${participant.meetingId}`)
    return participant
}
