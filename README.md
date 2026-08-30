# LMS Frontend Client

This is the Next.js frontend for the Learning Management System (LMS) web application.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19, TailwindCSS v4
- **Media Uploads:** Cloudinary direct client-side unsigned upload
- **API Integration:** Fetch integration with Strapi v5 REST API

---

## 🚀 Getting Started

### 1. Install Dependencies

From the `client` directory:

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the `client` root directory:

```env
# Strapi Backend API Base URL (must include /api)
NEXT_PUBLIC_BACKEND_URL=http://localhost:1337/api

# Cloudinary Unsigned Upload Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

> **Note:** Never commit `.env.local` to version control. Refer to `.env.example` for details.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📜 Available Scripts

- `npm run dev`: Run the local development server at `http://localhost:3000`
- `npm run build`: Build the production application
- `npm run start`: Start the production server
- `npm run lint`: Run ESLint checks

---

## 📁 Folder Structure

```text
client/
├── src/
│   ├── app/           # App Router pages (courses, blogs, dashboard, auth)
│   ├── components/    # Reusable UI components (Public, Dashboard, Layout)
│   ├── config/        # API configuration (API_BASE_URL resolution)
│   ├── context/       # React Context (Auth context, etc.)
│   ├── lib/           # Utility functions & Cloudinary direct upload handler
│   └── services/      # Strapi API services (courses, blogs, auth)
├── public/            # Static assets
└── README.md
```
