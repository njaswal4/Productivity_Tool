# README

Welcome to [RedwoodJS](https://redwoodjs.com)!

> **Prerequisites**
>
> - Redwood requires [Node.js](https:/# 🚀 2Creative Productivity Tool

A comprehensive enterprise productivity management system built with RedwoodJS, designed to streamline employee workflows, resource management, and project tracking for modern organizations.

[![RedwoodJS](https://img.shields.io/badge/RedwoodJS-8.6.1-red)](https://redwoodjs.com)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)](https://postgresql.org)

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Development](#development)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [External Libraries](#external-libraries)
- [Authentication](#authentication)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Support](#support)

## 🎯 Overview

The 2Creative Productivity Tool is a full-stack web application designed to manage various aspects of organizational productivity including:

- **Employee Management**: User profiles, roles, and department assignments
- **Asset Tracking**: Company assets, assignments, and maintenance tracking
- **Project Management**: Project allocation, budget tracking, and daily updates
- **Office Supplies**: Inventory management and request system
- **Time & Attendance**: Employee attendance tracking and vacation management
- **Authentication**: Secure login with role-based access control

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  React Frontend (netlify)                                      │
│  ├── Pages (Dashboard, Assets, Projects, etc.)                 │
│  ├── Components (Header, Modals, Forms)                        │
│  ├── Layouts (MainLayout, AuthLayout)                          │
│  └── Authentication (Supabase/DbAuth)                          │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ GraphQL API
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  RedwoodJS API (Port 8911)                                     │
│  ├── GraphQL Services                                          │
│  ├── Authentication Functions                                  │
│  ├── Business Logic                                            │
│  └── Data Validation                                           │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ Prisma ORM
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL Database                                            │
│  ├── User Management (Users, Roles, Departments)               │
│  ├── Asset Management (Assets, Requests)                       │
│  ├── Project Management (Projects, Allocations, Budgets)       │
│  ├── Office Supplies (Supplies, Requests)                      │
│  └── Attendance & Vacation Tracking                            │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
Frontend React App
        │
        ├── User Authentication ──────► DB Auth
        │
        ├── GraphQL Queries/Mutations ──────► RedwoodJS API
        │                                           │
        │                                           ├── Services Layer
        │                                           │
        │                                           ├── Prisma ORM
        │                                           │
        │                                           └── PostgreSQL DB
        │
        └── Static Assets ──────► Public Directory
```

## ✨ Features

### 🔐 Authentication & Authorization
- **Secure Login**: Multi-provider authentication (Supabase, DbAuth)
- **Role-Based Access**: Admin, Manager, Team Lead, User roles
- **Profile Management**: User can update personal information

### 👥 Employee Management
- **User Profiles**: Complete employee information management
- **Department Assignment**: Engineering, Design, Marketing, Sales, HR, Finance
- **Designation Tracking**: Job titles and role hierarchies
- **Contact Information**: Email, phone, and address management

### 💼 Asset Management
- **Asset Tracking**: Complete inventory of company assets
- **Assignment System**: Track who has what equipment
- **Request Management**: Employees can request new assets
- **Maintenance Records**: Track asset condition and maintenance
- **Department-wise Allocation**: Assets organized by department

### 📊 Project Management
- **Project Creation**: Set up projects with budgets and timelines
- **Daily Allocations**: Track how employees spend their time
- **Budget Tracking**: Monitor project expenses and budget utilization
- **Progress Reporting**: Real-time project status updates
- **Team Allocation**: Assign team members to projects

### 📦 Office Supplies Management
- **Inventory System**: Track office supplies and stock levels
- **Request System**: Employees can request supplies
- **Approval Workflow**: Manager approval for supply requests
- **Stock Alerts**: Low stock notifications
- **Usage Tracking**: Monitor supply consumption patterns

### 📅 Time & Attendance
- **Attendance Tracking**: Daily check-in/check-out system
- **Vacation Requests**: Submit and approve vacation requests
- **Leave Balance**: Track available vacation days
- **Calendar Integration**: Visual calendar for scheduling

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18.3.1
- **Routing**: RedwoodJS Router
- **Styling**: Tailwind CSS + Custom CSS
- **State Management**: React Hooks + Context
- **Form Handling**: RedwoodJS Forms
- **Icons**: React Icons + RemixIcon
- **Animations**: Framer Motion, GSAP
- **Calendar**: React Big Calendar
- **Date Handling**: Moment.js

### Backend
- **Framework**: RedwoodJS 8.6.1
- **API**: GraphQL with Apollo Server
- **Database ORM**: Prisma
- **Authentication**: Supabase Auth + DbAuth
- **Email**: Nodemailer
- **JWT**: JSON Web Tokens
- **File Processing**: Papa Parse (CSV)
- **PDF Generation**: jsPDF + jsPDF AutoTable

### Database
- **Primary Database**: PostgreSQL
- **Development Database**: SQLite (optional)
- **Migrations**: Prisma Migrate
- **Seeding**: Custom seed scripts

### Development & Deployment
- **Package Manager**: Yarn 4.6.0
- **Build Tool**: Vite + ESBuild
- **Testing**: Jest
- **Linting**: ESLint
- **Code Formatting**: Prettier
- **Deployment**: Netlify (recommended)
- **CI/CD**: GitHub Actions compatible

## 📋 Prerequisites

Before installing this project, ensure you have the following installed:

- **Node.js**: Version 20.x (exactly, as specified in engines)
- **Yarn**: Latest version (4.6.0+)
- **PostgreSQL**: Version 12+ (for production)
- **Git**: For version control

### System Requirements
- **OS**: Windows, macOS, or Linux
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Storage**: 2GB free space for development dependencies

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/njaswal4/productivity-tool.git
cd productivity-tool
```

### 2. Install Dependencies
```bash
# Install all dependencies for both web and api workspaces
yarn install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/productivity_db"


# Email Configuration (Optional)
SMTP_HOST="your-smtp-server"
SMTP_PORT="587"
SMTP_USER="your-email@domain.com"
SMTP_PASS="your-email-password"
```

## 🗄️ Database Setup

### 1. Create PostgreSQL Database

### 2. Run Migrations
```bash
# Generate Prisma client and run migrations
yarn rw prisma migrate dev
```

### 3. Seed Database (Optional)
```bash
# Populate with sample data
yarn rw prisma db seed
```

### 4. Generate Prisma Client
```bash
# Generate the Prisma client
yarn rw prisma generate
```

## 💻 Development

### Start Development Server
```bash
# Start both web and api servers
yarn rw dev
```

This will start:
- **Web server**: http://localhost:8910
- **API server**: http://localhost:8911
- **GraphQL Playground**: http://localhost:8911/graphql

### Development Commands
```bash
# Run tests
yarn rw test

# Check code quality
yarn rw check

# Build for production
yarn rw build

# Database operations
yarn rw prisma studio          # Open Prisma Studio
yarn rw prisma migrate dev     # Create and apply new migration
yarn rw prisma db seed         # Run seed script
```

### Hot Reloading
The development server supports hot reloading for both frontend and backend changes.

## 🚀 Deployment

### Netlify Deployment (Recommended)

1. **Build Settings**:
   - **Build Command**: `yarn rw deploy netlify`
   - **Publish Directory**: `web/dist`
   - **Functions Directory**: `api/dist/functions`

2. **Environment Variables**:
   Set all environment variables in Netlify dashboard

3. **Deploy**:
```bash
# Deploy to Netlify
yarn rw deploy netlify
```

### Other Deployment Options
- **Vercel**: Full-stack deployment
- **Railway**: PostgreSQL + hosting
- **Render**: Database + web service
- **AWS**: Using Serverless Framework or SST

## 📁 Project Structure

```
Productivity_Tool/
├── api/                          # Backend API
│   ├── db/
│   │   ├── migrations/           # Database migrations
│   │   └── schema.prisma         # Database schema
│   └── src/
│       ├── functions/            # Serverless functions
│       ├── graphql/              # GraphQL schemas
│       ├── lib/                  # Utility functions
│       └── services/             # Business logic
├── web/                          # Frontend React app
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   ├── layouts/              # Page layouts
│   │   ├── pages/                # Route components
│   │   └── lib/                  # Client utilities
├── scripts/                      # Database seeds & utilities
├── docs/                         # Documentation
├── package.json                  # Root dependencies
├── redwood.toml                  # RedwoodJS configuration
├── netlify.toml                  # Netlify deployment config
└── README.md                     # This file
```

## 📚 External Libraries

### Core Dependencies
```json
{
  "@redwoodjs/core": "8.6.1",           // Full-stack framework
  "react": "18.3.1",                     // UI library
  "prisma": "latest",                     // Database ORM
  "@supabase/supabase-js": "^2.52.0",   // Authentication
  "graphql": "latest",                    // API query language
  "tailwindcss": "latest"                 // CSS framework
}
```

### UI & Animation Libraries
```json
{
  "framer-motion": "^12.6.0",           // Advanced animations
  "gsap": "^3.13.0",                    // High-performance animations
  "@heroicons/react": "^2.2.0",        // SVG icons
  "react-icons": "^5.5.0",             // Icon library
  "react-big-calendar": "^1.19.4",     // Calendar component
  "react-calendar": "^6.0.0"           // Date picker
}
```

### Utility Libraries
```json
{
  "moment": "^2.30.1",                  // Date manipulation
  "jsonwebtoken": "^9.0.2",            // JWT handling
  "papaparse": "^5.5.3",               // CSV processing
  "jspdf": "^3.0.1",                   // PDF generation
  "jspdf-autotable": "^5.0.2",         // PDF tables
  "nodemailer": "^7.0.4",              // Email sending
  "semver": "^7.7.2"                   // Version handling
}
```

### Microsoft Integration
```json
{
  "@azure/msal-browser": "^4.15.0",     // Azure AD browser auth
  "@azure/msal-node": "^3.6.3",        // Azure AD server auth
  "jwks-rsa": "^3.2.0"                 // JWT key verification
}
```

### Mobile & Desktop
```json
{
  "@capacitor/core": "^7.4.0",         // Cross-platform runtime
  "@capacitor/cli": "^7.4.0",          // Capacitor CLI
  "@capacitor/ios": "^7.4.0"           // iOS platform
}
```

## 🔐 Authentication

### Supported Auth Providers
1. **Supabase Auth**: Email/password + OAuth providers
2. **DbAuth**: Self-hosted authentication
3. **Microsoft Azure AD**: Enterprise SSO

### User Roles
- **USER**: Basic employee access
- **TEAM_LEAD**: Team management permissions
- **MANAGER**: Department-level access
- **ADMIN**: Full system access

### Protected Routes
```javascript
// Example protected route
<PrivateSet unauthenticated="login">
  <Route path="/dashboard" page={DashboardPage} name="dashboard" />
  <Route path="/admin" page={AdminPage} name="admin" roles="ADMIN" />
</PrivateSet>
```

## 📖 API Documentation

### GraphQL Endpoints
- **Development**: http://localhost:8911/graphql
- **Production**: https://your-app.netlify.app/.redwood/functions/graphql

### Key Operations
```graphql
# User Management
query GetUsers { users { id name email role } }
mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id } }

# Asset Management
query GetAssets { assets { id name assignedTo department } }
mutation RequestAsset($input: CreateAssetRequestInput!) { createAssetRequest(input: $input) { id } }

# Project Management
query GetProjects { projects { id name budget allocatedHours } }
mutation UpdateProject($id: Int!, $input: UpdateProjectInput!) { updateProject(id: $id, input: $input) { id } }
```


### Code Standards
- **ESLint**: Follow the configured ESLint rules
- **Prettier**: Code formatting is automated
- **TypeScript**: Use TypeScript for better type safety
- **Testing**: Write tests for new features

### Pull Request Guidelines
- Provide clear description of changes
- Include relevant tests
- Update documentation if needed
- Ensure all CI checks pass

## 📞 Support

### Getting Help
- **Documentation**: [RedwoodJS Docs](https://redwoodjs.com/docs)
- **Community**: [RedwoodJS Discord](https://discord.gg/redwoodjs)
- **Issues**: Create an issue in this repository

### Common Issues
1. **Database Connection**: Verify PostgreSQL is running and DATABASE_URL is correct
2. **Port Conflicts**: Ensure ports 8910 and 8911 are available
3. **Node Version**: Use exactly Node.js 20.x
4. **Yarn Version**: Use Yarn 4.6.0+

### Performance Tips
- Enable caching for GraphQL queries
- Use database indexes for frequently queried fields
- Optimize images in the public directory
- Enable compression in production

---

Start by installing dependencies:

```
yarn install
```

Then start the development server:

```
yarn redwood dev
```

Your browser should automatically open to [http://localhost:8910](http://localhost:8910) where you'll see the Welcome Page, which links out to many great resources.

> **The Redwood CLI**
>
> Congratulations on running your first Redwood CLI command! From dev to deploy, the CLI is with you the whole way. And there's quite a few commands at your disposal:
>
> ```
> yarn redwood --help
> ```
>
> For all the details, see the [CLI reference](https://redwoodjs.com/docs/cli-commands).

## Prisma and the database

Redwood wouldn't be a full-stack framework without a database. It all starts with the schema. Open the [`schema.prisma`](api/db/schema.prisma) file in `api/db` and replace the `UserExample` model with the following `Post` model:

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  body      String
  createdAt DateTime @default(now())
}
```

Redwood uses [Prisma](https://www.prisma.io/), a next-gen Node.js and TypeScript ORM, to talk to the database. Prisma's schema offers a declarative way of defining your app's data models. And Prisma [Migrate](https://www.prisma.io/migrate) uses that schema to make database migrations hassle-free:

```
yarn rw prisma migrate dev

# ...

? Enter a name for the new migration: › create posts
```

> `rw` is short for `redwood`

You'll be prompted for the name of your migration. `create posts` will do.

Now let's generate everything we need to perform all the CRUD (Create, Retrieve, Update, Delete) actions on our `Post` model:

```
yarn redwood generate scaffold post
```

Navigate to [http://localhost:8910/posts/new](http://localhost:8910/posts/new), fill in the title and body, and click "Save".

Did we just create a post in the database? Yup! With `yarn rw generate scaffold <model>`, Redwood created all the pages, components, and services necessary to perform all CRUD actions on our posts table.

## Frontend first with Storybook

Don't know what your data models look like? That's more than ok—Redwood integrates Storybook so that you can work on design without worrying about data. Mockup, build, and verify your React components, even in complete isolation from the backend:

```
yarn rw storybook
```

Seeing "Couldn't find any stories"? That's because you need a `*.stories.{tsx,jsx}` file. The Redwood CLI makes getting one easy enough—try generating a [Cell](https://redwoodjs.com/docs/cells), Redwood's data-fetching abstraction:

```
yarn rw generate cell examplePosts
```

The Storybook server should hot reload and now you'll have four stories to work with. They'll probably look a little bland since there's no styling. See if the Redwood CLI's `setup ui` command has your favorite styling library:

```
yarn rw setup ui --help
```

## Testing with Jest

It'd be hard to scale from side project to startup without a few tests. Redwood fully integrates Jest with both the front- and back-ends, and makes it easy to keep your whole app covered by generating test files with all your components and services:

```
yarn rw test
```

To make the integration even more seamless, Redwood augments Jest with database [scenarios](https://redwoodjs.com/docs/testing#scenarios) and [GraphQL mocking](https://redwoodjs.com/docs/testing#mocking-graphql-calls).

## Ship it

Redwood is designed for both serverless deploy targets like Netlify and Vercel and serverful deploy targets like Render and AWS:

```
yarn rw setup deploy --help
```

Don't go live without auth! Lock down your app with Redwood's built-in, database-backed authentication system ([dbAuth](https://redwoodjs.com/docs/authentication#self-hosted-auth-installation-and-setup)), or integrate with nearly a dozen third-party auth providers:

```
yarn rw setup auth --help
```

## Next Steps

The best way to learn Redwood is by going through the comprehensive [tutorial](https://redwoodjs.com/docs/tutorial/foreword) and joining the community (via the [Discourse forum](https://community.redwoodjs.com) or the [Discord server](https://discord.gg/redwoodjs)).

## Quick Links

- Stay updated: read [Forum announcements](https://community.redwoodjs.com/c/announcements/5), follow us on [Twitter](https://twitter.com/redwoodjs), and subscribe to the [newsletter](https://redwoodjs.com/newsletter)
- [Learn how to contribute](https://redwoodjs.com/docs/contributing)
