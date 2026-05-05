# LMS - Laundry Management System

A modern, high-performance web application built with **Next.js 15+** designed to streamline laundry operations management. This project features a robust security architecture with **Role-Based Access Control (RBAC)** and **Permission-Based Access Control (PBAC)**.

## 🚀 Features

- **Advanced Authentication**: Secure login system using JWT with Access and Refresh token rotation.
- **RBAC & PBAC**: Flexible security model allowing permissions to be assigned to roles or directly to users.
- **Modern UI/UX**: Built with Tailwind CSS and Radix UI (via Shadcn UI) for a premium, responsive experience.
- **Database Management**: Prisma ORM with MySQL for efficient data handling and type-safety.
- **Modules**:
  - 📊 **Dashboard**: Overview of system activities.
  - 👥 **User Management**: Comprehensive control over user accounts.
  - 🛡️ **Role & Permission Management**: Granular control over system access.
  - 🌍 **Geography Management**: Manage States and Cities.
  - 👤 **Profile Management**: User-specific settings and profile updates.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, Turbopack)
- **Runtime**: [Bun](https://bun.sh/) (or Node.js 20+)
- **Database**: [MySQL](https://www.mysql.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

## 🏁 Getting Started

### Prerequisites

- **Bun** (recommended) or **Node.js** (>= 20.16.0)
- **MySQL** Server

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd LMS
   ```

2. **Install dependencies**:
   ```bash
   bun install
   # or
   npm install
   ```

3. **Environment Setup**:
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
   Generate JWT secrets:
   ```bash
   bun run gen:jwt-secret
   ```

4. **Database Setup**:
   Push the schema to the database and generate the Prisma client:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Seed the Database**:
   Populate the database with initial roles, permissions, and an admin user:
   ```bash
   bun run seed
   ```

6. **Run the Development Server**:
   ```bash
   bun run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```text
src/
├── app/          # Next.js App Router (pages, layouts, routes)
├── components/   # Reusable UI components
├── config/       # Global configuration (roles, permissions, etc.)
├── hooks/        # Custom React hooks
├── lib/          # Core logic, utilities, and Prisma client
├── providers/    # React context providers (Themes, Auth, etc.)
├── types/        # TypeScript interfaces and types
└── middleware.ts # Next.js middleware for auth/protection
```

## 📜 Available Scripts

- `bun run dev`: Starts the development server with Turbopack.
- `bun run build`: Builds the application for production.
- `bun run start`: Starts the production server.
- `bun run lint`: Runs ESLint for code quality checks.
- `bun run prisma:generate`: Generates the Prisma client.
- `npx prisma db push`: Pushes the schema to the database (without migrations).
- `bun run prisma:studio`: Opens Prisma Studio to view/edit data.
- `bun run seed`: Seeds the database with initial data.
- `bun run gen:jwt-secret`: Utility to generate secure JWT secrets.

## 📄 License

This project is private and confidential.
