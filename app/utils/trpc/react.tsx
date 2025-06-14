import SuperJSON from 'superjson'
import { useState, createContext, useContext } from 'react'
import { createTRPCClient, httpBatchLink, loggerLink } from '@trpc/client'

import type { AppRouter } from '@/server/main'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return window.location.origin
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}

const links = [
  loggerLink({
    enabled: (op) =>
      process.env.NODE_ENV === 'development' ||
      (op.direction === 'down' && op.result instanceof Error)
  }),
  httpBatchLink({
    transformer: SuperJSON,
    url: getBaseUrl() + '/api/trpc',
    headers() {
      const headers = new Headers()
      headers.set('x-trpc-source', 'react')
      return headers
    }
  })
]

const TRPCContext = createContext<ReturnType<typeof createTRPCClient<AppRouter>> | null>(null)

export function useTRPC() {
  const client = useContext(TRPCContext)
  if (!client) {
    throw new Error('useTRPC must be used within TRPCReactProvider')
  }
  return client
}

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links
    })
  )

  return (
    <TRPCContext.Provider value={trpcClient}>
      {children}
    </TRPCContext.Provider>
  )
}

export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>
