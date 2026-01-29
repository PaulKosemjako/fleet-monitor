# Fleet Monitor

## Projektübersicht

Der **Fleet Monitor** ist eine Full-Stack-Webanwendung zur Überwachung und Simulation einer Roboterflotte. Die Anwendung ermöglicht es, mehrere Roboter in Echtzeit zu verfolgen, ihre Positionen auf einer Karte darzustellen und Bewegungen zu simulieren. Das Projekt wurde als Praxisprojekt im Rahmen einer Full-Stack-Aufgabenstellung umgesetzt.

Ziel war es, sowohl Backend- als auch Frontend-Kenntnisse zu demonstrieren, inklusive Authentifizierung, API-Design, Datenbankanbindung, Simulation und Containerisierung mit Docker.

---

## Features

* Benutzer-Login mit **JWT-Authentifizierung**
* Geschützte API-Endpunkte (Bearer Token)
* Verwaltung und Anzeige einer Roboterflotte
* Darstellung der Roboterpositionen auf einer **OpenStreetMap-Karte**
* Roboter-Bewegung per Simulation (periodische Positionsänderung)
* Manuelles Bewegen einzelner Roboter
* Automatische Aktualisierung der Daten im Frontend
* Docker-Setup für Backend & Datenbank

---

## Technologie-Stack

### Backend

* Node.js
* Express.js
* PostgreSQL
* JSON Web Tokens (JWT)
* Simulation per `setInterval`
* (vorbereitet) WebSocket / Live-Übertragung

### Frontend

* React
* Vite
* OpenLayers (Kartenanzeige)
* Fetch API

### DevOps

* Docker
* Docker Compose
* Git & GitHub

---

## Architektur (Überblick)

```
Frontend (React)
   │
   │  HTTP (REST, JSON)
   ▼
Backend (Node.js / Express)
   │
   │  SQL
   ▼
PostgreSQL Datenbank
```

* Das Frontend kommuniziert über eine REST-API mit dem Backend.
* Das Backend prüft alle geschützten Routen über ein JWT-Middleware.
* Die Simulation aktualisiert regelmäßig die Roboterpositionen in der Datenbank.
* Das Frontend lädt die aktualisierten Daten automatisch neu.

---

## Installation & Start

### Voraussetzungen

* Node.js (empfohlen: v18 oder höher)
* Docker Desktop
* Git

---

### Lokaler Start (ohne Docker)

**Backend:**

```bash
cd backend
npm install
npm start
```

**Frontend:**

```bash
cd frontend/frontend
npm install
npm run dev
```

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend: [http://localhost:4000](http://localhost:4000)

---

### Start mit Docker (empfohlen)

```bash
docker compose up --build
```

* Backend läuft auf Port **4000**
* PostgreSQL läuft auf Port **5432**

Hinweis: Das Frontend wird aktuell lokal im Dev-Modus betrieben.

---

## Authentifizierung

Die Authentifizierung erfolgt über **JSON Web Tokens (JWT)**:

* Login über `/auth/login`
* Token wird im Frontend im `localStorage` gespeichert
* Geschützte Routen erfordern einen Header:

```
Authorization: Bearer <TOKEN>
```

Das Backend prüft den Token über eine Middleware.

---

## Simulation

Die Roboter-Simulation läuft serverseitig:

* Alle 2 Sekunden werden die Positionen der Roboter zufällig verändert
* Die neuen Positionen werden in der Datenbank gespeichert
* Das Frontend lädt die neuen Daten automatisch neu

Ziel der Simulation ist es, eine bewegte Roboterflotte realistisch darzustellen.

---

## Live-Daten

Aktuell werden die Daten im Frontend regelmäßig neu geladen (Polling).

Eine WebSocket-Struktur ist bereits vorbereitet, um zukünftig echte Echtzeit-Updates ohne Polling zu ermöglichen.

---

## API-Endpunkte (Auswahl)

### Auth

* `POST /auth/login`

### Roboter (JWT erforderlich)

* `GET /robots`
* `POST /robots/:id/move`

---

## Screenshots

*(Hier können später Screenshots des Dashboards, der Karte und der Tabelle ergänzt werden.)*

---

## Fazit

Der Fleet Monitor zeigt die Umsetzung einer modernen Full-Stack-Anwendung mit klarer Trennung von Frontend und Backend, sicherer Authentifizierung, Datenbankanbindung und Docker-Setup.

Das Projekt dient als praxisnahes Beispiel für typische Anforderungen in der Webentwicklung.

---

## Autor

**Paul Kosemjako**
