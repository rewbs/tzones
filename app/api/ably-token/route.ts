import Ably from 'ably'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const clientId = request.nextUrl.searchParams.get('clientId') || `anon-${Date.now()}`

    if (!process.env.ABLY_API_KEY) {
        return NextResponse.json(
            { error: 'Ably API key not configured' },
            { status: 500 }
        )
    }

    const client = new Ably.Rest(process.env.ABLY_API_KEY)

    const tokenRequestData = await client.auth.createTokenRequest({
        clientId,
        capability: {
            'meeting:*': ['subscribe', 'publish', 'presence'],
        },
    })

    return NextResponse.json(tokenRequestData)
}
