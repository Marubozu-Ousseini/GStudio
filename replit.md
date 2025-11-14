# Fashion & Fragrance E-Commerce Platform

## Overview

This is a full-stack e-commerce platform specializing in fashion, fragrances, and accessories, built with a focus on luxury presentation and user experience. The application features a product catalog with shopping cart functionality, user authentication, order management, and an admin panel for product management. The design emphasizes editorial elegance with magazine-style layouts, generous whitespace, and image-first presentation inspired by luxury e-commerce leaders like Net-a-Porter and Aesop.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design system

**Design System:**
- Custom color palette with CSS variables for theming (light/dark modes)
- Typography hierarchy using Inter (sans-serif) and Lora (serif) from Google Fonts
- Consistent spacing primitives (4, 6, 8, 12, 16, 20, 24px units)
- Responsive grid layouts (3-column desktop, 2-column tablet, 1-column mobile)
- Component-based architecture with reusable UI primitives

**Key Frontend Patterns:**
- Context API for authentication state management (AuthContext)
- Custom hooks for mobile detection and toast notifications
- Optimistic UI updates with React Query mutations
- Form handling with react-hook-form and Zod validation
- Client-side route protection based on user roles (admin vs regular user)

**Admin Panel:**
- Full product management interface at `/admin` route
- Protected by both frontend (useEffect redirect) and backend (adminMiddleware) guards
- Features:
  - Product listing table with edit/delete actions
  - Add new products with image upload
  - Edit existing products (update name, description, prices, category, materials, care instructions)
  - Delete products with confirmation
  - Image upload with preview and validation
  - Real-time cache invalidation via React Query
- Admin navigation link visible only to users with isAdmin flag
- Default admin credentials: email: `admin@luxe.com`, password: `admin123`

### Backend Architecture

**Technology Stack:**
- Node.js with Express framework
- TypeScript for type safety across the full stack
- Drizzle ORM for database operations
- Neon serverless PostgreSQL with WebSocket connections
- JWT-based stateless authentication (avoiding session storage for scalability)

**API Design:**
- RESTful API endpoints under `/api` prefix
- Token-based authentication with Bearer tokens in Authorization headers
- Middleware chain: logging → authentication → authorization → route handlers
- Rate limiting on sensitive endpoints (5 login attempts per 15 minutes)
- Request/response logging with duration tracking

**Authentication & Authorization:**
- bcrypt for password hashing (10 rounds)
- JWT tokens with 7-day expiration
- Middleware-based auth checks (authMiddleware for authenticated routes, adminMiddleware for admin-only routes)
- Stateless design - no server-side sessions, tokens stored in localStorage on client
- User roles: regular users and administrators (isAdmin flag)

**File Upload System:**
- Multer middleware for handling multipart/form-data
- Local file storage in `server/uploads/` directory served via Express static middleware at `/uploads`
- File type validation (JPEG, PNG, WebP only)
- 5MB file size limit
- Unique filename generation with timestamp and random suffix
- Upload endpoint at POST `/api/upload` (admin-only)
- Uploaded images referenced by relative path in product records

### Database Schema

**Core Entities:**

1. **users** - User accounts with authentication
   - Unique username and email
   - Hashed passwords
   - Admin flag for role-based access
   - UUID primary keys

2. **products** - Product catalog
   - Name, description, pricing (regular and sale)
   - Category classification (clothes, perfumes, accessories)
   - Image URL, materials, care instructions
   - Timestamps for sorting by newest

3. **cartItems** - Shopping cart persistence
   - User-product relationship with quantity
   - Cascade deletion when user or product is deleted
   - Supports authenticated users only

4. **orders** - Order records
   - Total amount and shipping cost calculation
   - Order status tracking (pending, processing, shipped, delivered)
   - Complete shipping information (name, email, address, city, phone)
   - Foreign key to users table

5. **orderItems** - Line items for orders
   - Product snapshot at time of purchase (price, quantity)
   - Foreign keys to orders and products

**Database Operations:**
- Drizzle ORM provides type-safe query building
- Parameterized queries prevent SQL injection
- Relational queries with joins for cart items with product details
- Cascade deletes for referential integrity

### External Dependencies

**Database:**
- Neon serverless PostgreSQL (compatible with AWS RDS Free Tier alternative)
- WebSocket connections via @neondatabase/serverless package
- Connection pooling for efficient resource usage
- DATABASE_URL environment variable for connection string

**Third-Party Libraries:**
- **Radix UI**: Accessible, unstyled component primitives (accordion, dialog, dropdown, etc.)
- **shadcn/ui**: Pre-built components combining Radix UI with Tailwind styling
- **React Hook Form**: Performant form state management with validation
- **Zod**: Schema validation for forms and API inputs
- **Drizzle Kit**: Database migration tooling
- **jsonwebtoken**: JWT generation and verification
- **express-rate-limit**: API rate limiting middleware

**Asset Management:**
- Static file serving via Express for uploaded product images
- Vite handles client-side asset bundling and optimization
- Local assets stored in `attached_assets/` directory for generated images

**Development Tools:**
- TypeScript compiler for type checking
- ESBuild for production server bundling
- tsx for TypeScript execution in development
- Replit-specific plugins for development experience (cartographer, dev banner, runtime error overlay)

**Production Considerations:**
- Environment variable configuration (DATABASE_URL, SESSION_SECRET)
- Structured logging (currently console-based, ready for CloudWatch integration)
- Health check endpoint at `/api/health`
- CORS-ready configuration
- Separate build processes for client (Vite) and server (ESBuild)