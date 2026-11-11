# PlayTube Backend (Node.js + Express + MongoDB)

RangTube React frontend ke liye REST API. Field names (`ch`, `len`, `cat`, `age`, `c1`, `c2`) frontend ke `VIDEOS` data se match karte hain, to React mein bas data fetch karke wahi components chalte hain.

## Setup

```bash
npm install
cp .env.example .env     # phir .env mein JWT_SECRET badlo
npm run seed             # demo data (optional)
npm run dev              # http://localhost:5000
```

MongoDB local chalana ho to `MONGO_URI=mongodb://127.0.0.1:27017/rangtube`, ya MongoDB Atlas ka connection string `.env` mein daalo.

Seed ke baad login: `demo@rangtube.dev` / `password123`.

## API

| Method | Route | Auth | Kaam |
|---|---|---|---|
| POST | /api/auth/register | - | Naya account (name, email, password) |
| POST | /api/auth/login | - | Login, token milta hai |
| GET | /api/auth/me | Haan | Current user |
| GET | /api/videos | Optional | List. Query: `cat`, `q`, `sort=popular`, `page`, `limit` |
| GET | /api/videos/:id | Optional | Ek video |
| GET | /api/videos/:id/related | Optional | Related videos |
| POST | /api/videos | Haan | Video banao |
| PUT | /api/videos/:id | Owner | Video edit |
| DELETE | /api/videos/:id | Owner | Video delete |
| POST | /api/videos/:id/view | - | View count +1 |
| POST | /api/videos/:id/like | Haan | Like toggle |
| GET | /api/videos/:id/comments | Optional | Comments |
| POST | /api/videos/:id/comments | Haan | Comment likho (`{ "text": "..." }`) |
| DELETE | /api/comments/:id | Author | Comment delete |
| GET | /api/channels/:id | Optional | Channel info, subscribers |
| POST | /api/channels/:id/subscribe | Haan | Subscribe toggle |

Protected routes par header lagao: `Authorization: Bearer <token>`.

## Test (curl)

```bash
curl http://localhost:5000/api/videos?cat=Coding

curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@rangtube.dev","password":"password123"}'
```

## Frontend se jodna

React project mein `.env` banao: `VITE_API_URL=http://localhost:5000/api`, phir:

```js
const API = import.meta.env.VITE_API_URL;

export async function getVideos({ cat = "Sab", q = "" } = {}) {
  const res = await fetch(`${API}/videos?cat=${cat}&q=${encodeURIComponent(q)}`);
  return (await res.json()).items;
}
```

`App.jsx` mein `useEffect` se `getVideos` call karke `VIDEOS` ki jagah state use karo. Views ko `1.2M` jaisa dikhana ho to number ko format karna hoga (`views` yahan number hai).

## Dhyan do

- Asli video upload is version mein nahi hai (frontend bhi fake player hai). Aage `multer` + Cloudinary/S3 add kiya ja sakta hai.
- Production mein `JWT_SECRET` lamba random rakho aur `CLIENT_URL` apne frontend domain par set karo.
