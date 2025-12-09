
import { getMeeting } from "@/app/actions"
import { MeetingView } from "@/components/meeting-view"
import { notFound } from "next/navigation"

export default async function MeetingPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const meeting = await getMeeting(id)

    if (!meeting) {
        return notFound()
    }

    return <MeetingView meeting={meeting} />
}
