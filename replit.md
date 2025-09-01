# Overview

ConnectHub is a social networking application built with a modern full-stack architecture. It enables users to connect with others based on shared interests, send connection requests, exchange messages, and manage their profiles. The platform focuses on interest-based discovery and meaningful connections between users.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side is built with **React 18** and **TypeScript**, using a component-based architecture with modern React patterns:

- **Routing**: Uses Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Build Tool**: Vite for fast development and optimized builds

The frontend follows a page-based structure with reusable components, implementing authentication-aware routing and real-time UI updates through optimistic updates and cache invalidation.

## Backend Architecture

The server is built with **Express.js** and **TypeScript** in an ESM module structure:

- **API Design**: RESTful API with organized route handlers
- **Authentication**: OpenID Connect (OIDC) integration with Replit's auth system using Passport.js
- **Session Management**: Express-session with PostgreSQL session store
- **Middleware**: Custom logging, error handling, and authentication middleware
- **Development**: Hot reload via tsx for TypeScript execution

The backend implements a storage abstraction layer that separates business logic from data access, making the system more maintainable and testable.

## Database Design

Uses **PostgreSQL** with **Drizzle ORM** for type-safe database operations:

- **Schema Definition**: Centralized in shared directory with Zod validation schemas
- **Migrations**: Drizzle Kit for database schema management
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Tables**: Users, interests, user-interests (many-to-many), connections, messages, and sessions

The database design supports complex relationship queries for interest-based matching and efficient message threading between users.

## Authentication & Authorization

Implements **Replit OpenID Connect** authentication:

- **OAuth Flow**: Server-side authentication with session-based persistence
- **Session Storage**: PostgreSQL-backed sessions with automatic cleanup
- **Route Protection**: Middleware-based authentication checks on protected routes
- **User Management**: Automatic user creation/updates from OIDC claims

The authentication system provides seamless integration with Replit's ecosystem while maintaining security best practices.

## Real-time Features

While the current implementation uses REST APIs with optimistic updates, the architecture supports:

- **Connection Requests**: Real-time status updates through cache invalidation
- **Messaging**: Conversation threading with read status tracking
- **Interest Discovery**: Dynamic user matching based on shared interests

## API Structure

The REST API follows RESTful conventions with these main endpoints:

- **Authentication**: `/api/auth/*` - User authentication and session management
- **Users**: `/api/profile` - User profile management and updates  
- **Interests**: `/api/interests` - Interest CRUD operations and user associations
- **Connections**: `/api/connections` - Connection requests and relationship management
- **Discovery**: `/api/discover`, `/api/search-users` - User discovery and matching
- **Messaging**: `/api/conversations`, `/api/messages` - Message threading and chat functionality

Each endpoint implements proper error handling, input validation, and authentication checks where required.

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect

## Authentication Services  
- **Replit OpenID Connect**: OAuth 2.0 authentication provider integration
- **Passport.js**: Authentication middleware with OpenID Connect strategy

## UI Framework & Styling
- **Radix UI**: Headless UI components for accessibility and behavior
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Static type checking across the entire stack
- **ESBuild**: Fast JavaScript bundling for production builds
- **Replit Integration**: Development environment plugins and runtime error handling

## Frontend Libraries
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation for forms and API data
- **Wouter**: Lightweight client-side routing
- **Date-fns**: Date manipulation and formatting utilities

The application is designed to run seamlessly in Replit's environment while maintaining compatibility with standard Node.js deployments.