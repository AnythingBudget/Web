import { createTRPCRouter } from './trpc'

import { greetingRouter } from './routers/greeting'
import { transactionsRouter } from './routers/transactions'
import { categoriesRouter } from './routers/categories'

export const appRouter = createTRPCRouter({
  greeting: greetingRouter,
  transactions: transactionsRouter,
  categories: categoriesRouter,
})

export type AppRouter = typeof appRouter
