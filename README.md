# Blog Platform

A modern, full-stack blogging platform built with Next.js 15, TypeScript, tRPC, and PostgreSQL. Features user authentication, category management, and a beautiful, responsive UI.

🔗 **Live Demo**: [https://blog-site-a-one.vercel.app/](https://blog-site-a-one.vercel.app/)

##  Features

### Core Functionality
- **User Authentication** - Custom JWT-based auth with bcrypt password hashing
- **Post Management** - Create, read, update, and delete blog posts with Markdown support
- **Category System** - Organize posts with multiple categories and tags
- **Draft System** - Save posts as drafts before publishing
- **Rich Text Editor** - Write posts in Markdown with live preview
- **Responsive Design** - Beautiful UI that works on all devices

### User Experience
- **Featured Posts** - Showcase the 3 most recent posts in a 2:1:1 layout
- **Category Filtering** - Filter posts by category on the homepage
- **Pagination** - Browse through posts with a 3×3 grid layout
- **User-Specific Dashboard** - Each user sees only their own posts
- **Session Persistence** - Stay logged in for 7 days
- **Author Display** - See who wrote each post

### Technical Features
- **Type-Safe API** - End-to-end type safety with tRPC
- **Server Components** - Optimized performance with React Server Components
- **Real-time Validation** - Form validation with Zod
- **Database ORM** - Type-safe database queries with Drizzle ORM
- **Auto-Slug Generation** - Automatically generate URL-friendly slugs from titles

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Markdown**: react-markdown with syntax highlighting
- **State Management**: TanStack Query (React Query)

### Backend
- **API**: tRPC v11 (Type-safe API layer)
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Authentication**: Custom JWT with jose & bcryptjs
- **Validation**: Zod

### DevOps
- **Hosting**: Vercel
- **Database Hosting**: Neon
- **Version Control**: Git & GitHub

##  Installation

### Prerequisites
- Node.js 20.9 or later
- npm or yarn
- PostgreSQL database (Neon recommended)

### Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd blog-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@host.neon.tech/dbname?sslmode=require"

# Authentication
JWT_SECRET="your-super-secret-key-at-least-32-characters-long"
```

4. **Set up the database**

```bash
# Push schema to database
npm run db:push

# Seed categories
npm run db:seed
```

5. **Run the development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your blog!

##  Project Structure

```
blog-platform/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── api/trpc/[trpc]/     # tRPC API endpoint
│   │   ├── dashboard/            # Dashboard pages (protected)
│   │   ├── posts/[slug]/        # Individual post pages
│   │   ├── login/               # Login page
│   │   ├── register/            # Registration page
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Homepage
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── post-form.tsx        # Post creation/editing form
│   │   └── logout-button.tsx   # Logout component
│   ├── db/                      # Database layer
│   │   ├── schema/              # Drizzle ORM schemas
│   │   │   ├── users.ts
│   │   │   ├── posts.ts
│   │   │   ├── categories.ts
│   │   │   └── postCategories.ts
│   │   ├── index.ts             # Database connection
│   │   ├── seed-categories.ts   # Category seeder
│   │   └── reset-db.ts          # Database reset script
│   ├── server/                  # Server-side code
│   │   ├── routers/             # tRPC routers
│   │   │   ├── _app.ts          # Root router
│   │   │   ├── auth.ts          # Authentication routes
│   │   │   ├── posts.ts         # Post routes
│   │   │   └── categories.ts    # Category routes
│   │   └── trpc.ts              # tRPC initialization
│   ├── trpc/                    # tRPC client setup
│   │   ├── client.tsx           # Client provider
│   │   ├── server.tsx           # Server utilities
│   │   └── query-client.ts      # React Query config
│   ├── lib/                     # Utility functions
│   │   ├── auth.ts              # Auth utilities
│   │   ├── slugify.ts           # Slug generation
│   │   └── utils.ts             # General utilities
│   └── middleware.ts            # Route protection middleware
├── public/                      # Static assets
├── drizzle.config.ts           # Drizzle ORM configuration
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

##  Available Scripts

```bash
# Development
npm run dev              # Start development server

# Building
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:push         # Push schema changes to database
npm run db:studio       # Open Drizzle Studio (visual DB editor)
npm run db:generate     # Generate migration files
npm run db:seed         # Seed categories
npm run db:reset        # Reset database (drop & recreate all tables)

# Code Quality
npm run lint            # Run ESLint
```

##  Usage Guide

### For Users

1. **Register an Account**
   - Visit `/register`
   - Create a username and password
   - You'll be automatically logged in

2. **Create a Post**
   - Go to Dashboard → "New Post"
   - Write your post in Markdown
   - Select categories
   - Choose to publish or save as draft
   - URL slug is auto-generated from title

3. **Manage Posts**
   - View all your posts in the Dashboard
   - Edit or delete your own posts
   - Toggle between draft and published status

4. **Browse Posts**
   - Homepage shows featured posts (3 most recent)
   - Filter posts by category
   - Navigate through paginated posts (9 per page)
   - Click "Read more" to view full post

### For Developers

**Adding a New tRPC Route**

```typescript
// src/server/routers/example.ts
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return { greeting: `Hello ${input.name}!` };
    }),
});
```

**Using the Route in Client**

```typescript
// In any client component
const { data } = trpc.example.hello.useQuery({ name: "World" });
```

##  Authentication

The platform uses a custom JWT-based authentication system:

- Passwords are hashed with bcrypt (salt rounds: 10)
- JWT tokens are valid for 7 days
- Tokens stored in httpOnly cookies
- Protected routes validated via middleware
- Session persists across browser restarts

## 🗄️ Database Schema

### Users
- `id` (serial, primary key)
- `username` (unique, varchar 50)
- `password` (hashed, varchar 255)
- `created_at` (timestamp)

### Posts
- `id` (serial, primary key)
- `title` (varchar 255)
- `content` (text)
- `slug` (unique, varchar 255)
- `published` (boolean)
- `user_id` (foreign key → users.id)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Categories
- `id` (serial, primary key)
- `name` (unique, varchar 100)
- `description` (text)
- `slug` (unique, varchar 100)
- `created_at` (timestamp)

### Post_Categories (Junction Table)
- `post_id` (foreign key → posts.id)
- `category_id` (foreign key → categories.id)
- Primary key: (post_id, category_id)

##  UI Components

Built with **shadcn/ui** for consistency and accessibility:

- Button
- Card
- Input & Textarea
- Label
- Badge
- Form
- Dialog & Alert Dialog
- Dropdown Menu
- Separator
- Tabs

##  Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com)
3. Add environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
4. Deploy!

Vercel will automatically:
- Detect Next.js
- Install dependencies
- Build your app
- Deploy to production
- Set up continuous deployment

##  Known Issues & Limitations

- No email verification for registration
- No password reset functionality
- No image upload support for posts
- Categories cannot be created from the UI (must use seed script)
- No comment system
- No search functionality

##  Future Enhancements

- [ ] Image upload and management
- [ ] Comment system with moderation
- [ ] User profiles and avatars
- [ ] Post likes/reactions
- [ ] Full-text search
- [ ] Email notifications
- [ ] Social media sharing
- [ ] Analytics dashboard
- [ ] Category management UI
- [ ] Post scheduling
- [ ] SEO optimization
- [ ] RSS feed


##  License

This project is open source and available under the [MIT License](LICENSE).

##  Author

Built as part of a full-stack development assessment.
- Developed by Adrian D Silva
- **Email**: adriansdsilva@gmail.com
- **GitHub**: [LeoSeeker526](https://github.com/LeoSeeker526)

##  Acknowledgments

- **Next.js** - The React framework for production
- **Vercel** - Hosting and deployment platform
- **Neon** - Serverless PostgreSQL
- **shadcn/ui** - Beautiful UI components
- **Drizzle ORM** - TypeScript ORM for SQL databases
- **tRPC** - End-to-end typesafe APIs

---

Made with  using Next.js and TypeScript
