# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**AnythingBudget**, A full stack web application for Budget Tracking

## Integration

This project is integrated to several other tools.

- Linear:
  - Project Name: AnythingBudget
  - Id: 796f19c9-ec13-4636-988d-a90539e93623

## Software Development

### Architecture Overview

This app is a full-stack app using React-Router v7.

#### Tech-Stacks

- Framework: React-Router v7
- Authentication: Better-Auth
- API Layer: tRPC v 0.13
- Database: Postgresql
- Database Adapter: Prisma v6.9.0
- Styling Library: TailwindCSS
- UI Components Library: ShadCN/UI
- Type Safety: Typescript

#### Path Aliases

The project uses TypeScript path aliases for cleaner imports:

- `@/*` - Maps to `./app/*` (all app directory files)

Examples:

- `import { auth } from "@/utils/auth/server"`
- `import { caller } from "@/utils/trpc/server"`
- `import { db } from "@/server/db"`
