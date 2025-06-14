import type { TRPCRouterRecord } from '@trpc/server'
import { z } from 'zod'

import { protectedProcedure } from '@/server/trpc'

export const categoriesRouter = {
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.category.findMany({
      where: {
        userId: ctx.user.id,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return categories
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const category = await ctx.db.category.create({
        data: {
          name: input.name,
          color: input.color,
          userId: ctx.user.id,
        },
      })

      return category
    }),

  createDefaultCategories: protectedProcedure.mutation(async ({ ctx }) => {
    const defaultCategories = [
      { name: 'Food & Dining', color: '#FF6B6B' },
      { name: 'Transportation', color: '#4ECDC4' },
      { name: 'Shopping', color: '#45B7D1' },
      { name: 'Entertainment', color: '#96CEB4' },
      { name: 'Bills & Utilities', color: '#FFEAA7' },
      { name: 'Healthcare', color: '#DDA0DD' },
      { name: 'Education', color: '#98D8C8' },
      { name: 'Travel', color: '#6C5CE7' },
    ]

    const createdCategories = await Promise.all(
      defaultCategories.map((category) =>
        ctx.db.category.create({
          data: {
            ...category,
            userId: ctx.user.id,
          },
        })
      )
    )

    return createdCategories
  }),
} satisfies TRPCRouterRecord