import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  route('/api/auth/*', 'routes/api/auth.ts'),
  route('/api/trpc/*', 'routes/api/trpc.ts'),

  index('routes/home.tsx'),
  route('/user', 'routes/user.tsx'),
  route('/signin', 'routes/signin.tsx'),
  route('/landing-page', 'routes/landing-page.tsx'),
  route('/transactions', 'routes/transactions.tsx')
] satisfies RouteConfig
