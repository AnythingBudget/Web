import type { TRPCRouterRecord } from '@trpc/server'
import { z } from 'zod'

import { protectedProcedure } from '@/server/trpc'

export const transactionsRouter = {
  getByMonth: protectedProcedure
    .input(
      z.object({
        year: z.number().optional(),
        month: z.number().min(1).max(12).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { year, month } = input
      const currentDate = new Date()
      const targetYear = year ?? currentDate.getFullYear()
      const targetMonth = month ?? currentDate.getMonth() + 1

      const startDate = new Date(targetYear, targetMonth - 1, 1)
      const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999)

      const transactions = await ctx.db.transaction.findMany({
        where: {
          userId: ctx.user.id,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          category: true,
        },
        orderBy: {
          date: 'desc',
        },
      })

      const groupedTransactions = transactions.reduce((acc, transaction) => {
        const monthKey = transaction.date.toISOString().substring(0, 7) // YYYY-MM
        if (!acc[monthKey]) {
          acc[monthKey] = []
        }
        acc[monthKey].push(transaction)
        return acc
      }, {} as Record<string, typeof transactions>)

      return {
        transactions: groupedTransactions,
        currentMonth: `${targetYear}-${targetMonth.toString().padStart(2, '0')}`,
        total: transactions.reduce((sum, t) => sum + Number(t.amount), 0),
      }
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const transactions = await ctx.db.transaction.findMany({
      where: {
        userId: ctx.user.id,
      },
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    const groupedTransactions = transactions.reduce((acc, transaction) => {
      const monthKey = transaction.date.toISOString().substring(0, 7) // YYYY-MM
      if (!acc[monthKey]) {
        acc[monthKey] = []
      }
      acc[monthKey].push(transaction)
      return acc
    }, {} as Record<string, typeof transactions>)

    return {
      transactions: groupedTransactions,
      total: transactions.reduce((sum, t) => sum + Number(t.amount), 0),
    }
  }),

  create: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        description: z.string().min(1),
        date: z.date(),
        categoryId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const transaction = await ctx.db.transaction.create({
        data: {
          amount: input.amount,
          description: input.description,
          date: input.date,
          categoryId: input.categoryId,
          userId: ctx.user.id,
        },
        include: {
          category: true,
        },
      })

      return transaction
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const transaction = await ctx.db.transaction.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
      })

      if (!transaction) {
        throw new Error('Transaction not found')
      }

      await ctx.db.transaction.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
} satisfies TRPCRouterRecord