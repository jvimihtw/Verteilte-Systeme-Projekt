# Verteilte Systeme Projekt

## Notifications Service (Spring Boot)
Microservice for managing notifications. Runs on port 3004.

### Run
```bash
./mvnw spring-boot:run
```

### Endpoints
- `GET /notifications` — list all notifications
- `POST /notifications` — create a notification
- `PATCH /notifications/{id}/read` — mark as read
- `GET /health` — health check