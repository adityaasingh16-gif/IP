# IP — College Student Track Record

An advanced, responsive student intelligence dashboard with a vanilla HTML/CSS/JS frontend and Spring Boot + MongoDB backend.

## Features
- Dashboard KPIs: students, departments, attendance and marks
- Student CRUD with search and department/status filters
- Student profile view
- Attendance and academic risk indicators
- Department analytics
- Demo dataset that works without a backend
- Browser-persisted demo records via localStorage
- CSV export
- Printable college report
- Dark mode
- Responsive mobile/tablet/desktop UI
- Spring Boot REST API + MongoDB support

## Stack
Frontend: HTML5, CSS3, Vanilla JavaScript
Backend: Java 17+, Spring Boot 3.5.5, Spring Data MongoDB
Database: MongoDB

## Demo / Vercel
The frontend automatically runs in Demo Mode when deployed as a static Vercel site. This makes the dashboard usable online without exposing your local MongoDB.

To connect a deployed frontend to a real backend, define `window.IP_API_URL` before `script.js` or replace the API constant with your hosted Spring Boot URL. Never expose a MongoDB connection string in frontend code.

## Local backend
MongoDB for this project uses port 27018:

```powershell
mkdir C:\data\db-college
& "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --dbpath "C:\data\db-college" --port 27018
```

Compass: `mongodb://localhost:27018`

Run backend:

```powershell
cd backend
mvn spring-boot:run
```

Backend: `http://localhost:8080`
Health: `http://localhost:8080/api/health`

Run frontend locally:

```powershell
cd frontend
python -m http.server 5500
```

Open `http://localhost:5500`.

## API
- GET `/api/students`
- GET `/api/students/{id}`
- GET `/api/students/department/{department}`
- POST `/api/students`
- PUT `/api/students/{id}`
- DELETE `/api/students/{id}`
- GET `/api/health`

## Deployment
- Vercel: deploy the `frontend` directory as the static site.
- Render: deploy the Spring Boot `backend`.
- MongoDB Atlas: use a cloud connection string as a Render environment variable.
- Never commit production credentials.

## GitHub
Repository: https://github.com/adityaasingh16-gif/IP

Recommended commit:
`feat: launch IP student intelligence dashboard`
