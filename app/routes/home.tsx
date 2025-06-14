import { useLoaderData } from 'react-router'
import { caller } from '@/utils/trpc/server'
import type { Route } from './+types/home'

export const loader = async (args: Route.LoaderArgs) => {
  const trpc = await caller(args)
  const hello = await trpc.greeting.hello()
  return { hello }
}

export default function Home() {
  const { hello } = useLoaderData<typeof loader>()

  return (
    <div className='flex flex-col items-center justify-center min-h-screen min-w-screen'>
      {hello}
    </div>
  )
}
