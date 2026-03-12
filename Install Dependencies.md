# ATSEN Dependency Installation Commands

## 1) Install Everything (Recommended)

Run from project root:

```powershell
npm run install:all
```

This runs:

```powershell
npm install
cd backend
npm install
cd ../frontend
npm install
```

## 2) Fresh Install (Delete lock + node_modules first)

Run from project root:

```powershell
Remove-Item -Recurse -Force node_modules, backend/node_modules, frontend/node_modules -ErrorAction SilentlyContinue
npm install
cd backend
npm install
cd ../frontend
npm install
cd ..
```

## 3) Explicit Root Dependencies

Run from project root:

```powershell
npm install axios bcryptjs cheerio jsonwebtoken lodash.debounce slugify vite
```

## 4) Explicit Backend Dependencies

Run from project root:

```powershell
cd backend
npm install @aws-sdk/client-s3 @upstash/ratelimit @upstash/redis axios bcryptjs cheerio cors dotenv express jsonwebtoken mongoose multer multer-s3 react-router slugify
npm install -D concurrently nodemon open-cli wait-on
cd ..
```

## 5) Explicit Frontend Dependencies

Run from project root:

```powershell
cd frontend
npm install @vitejs/plugin-react axios lucide-react react react-dom react-hot-toast react-icons react-router react-router-dom recharts vite
npm install -D @eslint/js @types/react @types/react-dom autoprefixer daisyui eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals postcss tailwindcss
cd ..
```

## 6) Verify Installation

```powershell
npm -v
node -v
npm ls --depth=0
cd backend; npm ls --depth=0; cd ..
cd frontend; npm ls --depth=0; cd ..
```

## 7) Run Project

From root (backend + frontend together):

```powershell
npm run dev
```

Or separately:

```powershell
cd backend
npm run dev
```

```powershell
cd frontend
npm run dev
```
