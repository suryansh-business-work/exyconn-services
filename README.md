# Services

This repository contains two projects:

## Services UI (Port 4003)
React + Vite + TypeScript application with:
- Material UI (MUI)
- Formik for form handling
- Yup for validation

### Development
```bash
cd services-ui
npm install
npm run dev
```

### Build
```bash
npm run build
```

### Docker
```bash
docker build -t services-ui ./services-ui
docker run -p 4003:4003 services-ui
```

---

## Services Server (Port 4004)
Node.js + TypeScript backend with:
- Express.js
- CORS support
- RESTful API

### Development
```bash
cd services-server
npm install
npm run dev
```

### Build
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t services-server ./services-server
docker run -p 4004:4004 services-server
```

---

## Run Both with Docker Compose
```bash
docker-compose up --build
```

This will start:
- Services UI at http://localhost:4003
- Services Server at http://localhost:4004

## API Endpoints

### Services Server
- `GET /` - Welcome message
- `GET /api/health` - Health check
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contacts
