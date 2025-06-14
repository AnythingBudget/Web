import { useState } from 'react'
import { useLoaderData } from 'react-router'
import { caller } from '@/utils/trpc/server'
import { authClient } from '@/utils/auth/client'
import type { Route } from './+types/transactions'

export const loader = async (args: Route.LoaderArgs) => {
  const trpc = await caller(args)
  
  try {
    const [transactionsData, categories] = await Promise.all([
      trpc.transactions.getAll(),
      trpc.categories.getAll(),
    ])
    
    return { 
      transactionsData, 
      categories,
      hasCategories: categories.length > 0 
    }
  } catch (error) {
    return { 
      transactionsData: { transactions: {}, total: 0 }, 
      categories: [],
      hasCategories: false 
    }
  }
}

export default function Transactions() {
  const { transactionsData, categories, hasCategories } = useLoaderData<typeof loader>()
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = '/signin'
        },
      },
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatMonthHeader = (monthKey: string) => {
    const [year, month] = monthKey.split('-')
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    })
  }

  const getMonthTotal = (transactions: any[]) => {
    return transactions.reduce((sum, t) => sum + Number(t.amount), 0)
  }

  const sortedMonths = Object.keys(transactionsData.transactions).sort().reverse()

  if (!hasCategories) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <button
              onClick={signOut}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Sign Out
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to AnythingBudget!</h2>
            <p className="text-gray-600 mb-6">
              To start tracking your transactions, you'll need to set up some expense categories first.
            </p>
            <button
              onClick={() => window.location.href = '/categories'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Create Categories
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <div className="flex items-center space-x-4">
            <a
              href="/add-transaction"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Add Transaction
            </a>
            <button
              onClick={signOut}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-500">Total Transactions</h3>
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(transactionsData.transactions).flat().length}
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(transactionsData.total)}
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-500">Categories</h3>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>

        {/* Transactions by Month */}
        {sortedMonths.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-600 mb-4">Start tracking your expenses by adding your first transaction.</p>
            <a
              href="/add-transaction"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Add Your First Transaction
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedMonths.map((monthKey) => {
              const monthTransactions = transactionsData.transactions[monthKey]
              const monthTotal = getMonthTotal(monthTransactions)
              const isExpanded = selectedMonth === monthKey || selectedMonth === null

              return (
                <div key={monthKey} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div
                    className="bg-gray-50 px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setSelectedMonth(isExpanded && selectedMonth === monthKey ? null : monthKey)}
                  >
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {formatMonthHeader(monthKey)}
                      </h2>
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-medium text-gray-700">
                          {formatCurrency(monthTotal)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {monthTransactions.length} transactions
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="divide-y divide-gray-200">
                      {monthTransactions.map((transaction) => (
                        <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: transaction.category?.color || '#6B7280' }}
                                ></div>
                                <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                              </div>
                              <div className="mt-1 text-sm text-gray-500">
                                <span>{transaction.category?.name}</span>
                                <span className="mx-2">•</span>
                                <span>{formatDate(transaction.date)}</span>
                              </div>
                            </div>
                            <div className="text-lg font-semibold text-gray-900">
                              {formatCurrency(Number(transaction.amount))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}