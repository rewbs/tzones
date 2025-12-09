"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import Ably from 'ably'

interface AblyContextType {
    client: Ably.Realtime | null
    isConnected: boolean
}

const AblyContext = createContext<AblyContextType>({
    client: null,
    isConnected: false
})

export function useAbly() {
    return useContext(AblyContext)
}

interface AblyProviderProps {
    children: ReactNode
    clientId: string
}

export function AblyProvider({ children, clientId }: AblyProviderProps) {
    const [client, setClient] = useState<Ably.Realtime | null>(null)
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        // Create Ably client with token auth
        const ablyClient = new Ably.Realtime({
            authUrl: `/api/ably-token?clientId=${encodeURIComponent(clientId)}`,
            authMethod: 'GET',
        })

        ablyClient.connection.on('connected', () => {
            console.log('[Ably] Connected')
            setIsConnected(true)
        })

        ablyClient.connection.on('disconnected', () => {
            console.log('[Ably] Disconnected')
            setIsConnected(false)
        })

        ablyClient.connection.on('failed', (err) => {
            console.error('[Ably] Connection failed:', err)
            setIsConnected(false)
        })

        setClient(ablyClient)

        return () => {
            ablyClient.close()
        }
    }, [clientId])

    return (
        <AblyContext.Provider value={{ client, isConnected }}>
            {children}
        </AblyContext.Provider>
    )
}
