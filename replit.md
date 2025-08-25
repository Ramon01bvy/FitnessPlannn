# Marcodonato Fitness Platform

## Overview

A comprehensive fitness tracking platform built with React and Express.js that provides workout management, nutrition tracking, and progress monitoring. The application features a subscription-based model with multiple tiers and integrates with Mollie for payment processing. Users can track workouts, log meals, monitor progress through photos and measurements, and access a library of exercises and recipes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for a black and gold theme
- **Forms**: React Hook Form with Zod validation
- **Authentication Flow**: Replit OAuth integration with session-based authentication

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit OAuth with OpenID Connect (OIDC)
- **Session Management**: Express sessions stored in PostgreSQL using connect-pg-simple
- **API Design**: RESTful endpoints with consistent error handling and logging middleware

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless connection
- **Schema Management**: Drizzle migrations with schema defined in shared folder
- **Database Tables**: Users, workout sessions, exercise sets, recipes, meal entries, progress photos, personal records, and workout programs
- **Session Storage**: PostgreSQL table for secure session persistence

### Authentication and Authorization
- **Provider**: Replit OAuth using OpenID Connect protocol
- **Session Strategy**: Server-side sessions with secure HTTP-only cookies
- **Middleware**: Custom authentication middleware protecting API routes
- **User Management**: Automatic user creation/update on successful authentication
- **Security**: CSRF protection through session-based authentication

### Subscription System
- **Tiers**: Three subscription levels (Start, Pro, Jaar) with different feature access
- **Payment Processing**: Mollie integration for European payment methods
- **Customer Management**: Mollie customer ID tracking for recurring payments
- **Access Control**: Subscription-based feature gating throughout the application

## External Dependencies

### Payment Integration
- **Mollie API**: European payment processor for subscription billing
- **Webhooks**: Payment status updates and subscription management
- **Supported Methods**: iDEAL, credit cards, SEPA, and other European payment methods

### Database Services
- **Neon Database**: Serverless PostgreSQL with connection pooling
- **WebSocket Support**: Real-time database connections using ws library
- **Environment Configuration**: Database URL configuration for different environments

### Authentication Services
- **Replit Identity**: OAuth provider with OIDC discovery
- **OpenID Client**: Industry-standard authentication protocol implementation
- **Session Security**: Secure session configuration with proper expiration handling

### Development Tools
- **Replit Integration**: Development environment with hot reloading and error overlays
- **Build Tools**: Vite for frontend bundling, esbuild for backend compilation
- **Code Quality**: TypeScript strict mode with comprehensive type checking
- **Asset Management**: Static file serving with proper caching headers