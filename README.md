# Fitnexx Solutions — Backend Setup

## 1. Clone the project

```bash
git clone <YOUR_GITHUB_REPO_URL>
cd backend
git checkout Backend
```

## 2. Install dependencies

Open the terminal in VS Code using `Ctrl + J`, then run:

```bash
npm install
```

## 3. Create your `.env` file

In the backend folder, create a new file named:

```text
.env
```

Paste this template:

```env
PORT=5000

DATABASE_URL=postgresql://username:password@ep-xxxx-pooler.region.aws.neon.tech/gym_ni_lukas?sslmode=require

JWT_SECRET=replace_with_a_long_random_secret
```

Ask the team admin for the real Neon `DATABASE_URL`.  
Do **not** commit or share `.env` publicly.

## 4. Run the backend

In the terminal, run:

```bash
npm run dev
```

Expected output:

```text
Connected to NeonDB: PostgreSQL 18...
Server running on http://localhost:5000
```

You can now open:

```text
http://localhost:5000
```

## 5. Test the database connection

Open a **new terminal** in VS Code using `Ctrl + J`, then run:

```bash
node src/tests/db_test.js
```

Expected output:

```text
Connected to Neon successfully
Database: gym_ni_lukas
Version: PostgreSQL 18...
```

## 6. Test mock data

In the same new terminal, run:

```bash
node src/tests/read-mock-data.js
```

You should see tables showing the mock members and memberships from Neon.

## Notes

- `localhost:5000` only works on the computer running the backend.
- Each teammate runs the backend locally.
- Everyone connects to the same Neon cloud database.
- Never push `.env` to GitHub.
- Never share the real database password in public chats.