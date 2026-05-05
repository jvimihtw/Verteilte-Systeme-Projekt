# 🔔 Notifications Service — Spring Boot

Microservice responsible for storing and serving notifications.  
Runs on **port 3004**.

---

## Notification Types

| Type | Trigger | Who sends it |
|---|---|---|
| `BUDGET_ALERT_80` | User reaches 80% of their budget | `budget-service` |
| `BUDGET_EXCEEDED` | User surpasses their budget | `budget-service` |
| `WEEKLY_REMINDER` | Every Monday 09:00 (automatic) | Internal scheduler |

---

## Run the service

```bash
./mvnw spring-boot:run
# or
mvn spring-boot:run
```

---

## Endpoints

### GET `/notifications`
List all notifications. Filter by user with `?userId=2`.

```bash
curl http://localhost:3004/notifications
curl http://localhost:3004/notifications?userId=2
```

### GET `/notifications/unread?userId=2`
Only unread notifications for a user.

```bash
curl http://localhost:3004/notifications/unread?userId=2
```

### POST `/notifications`
Used by **other services** to push a notification here.

```bash
# Budget 80% alert
curl -X POST http://localhost:3004/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "type": "BUDGET_ALERT_80",
    "userId": 2,
    "message": "You have used 80% of your April budget."
  }'

# Budget exceeded
curl -X POST http://localhost:3004/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "type": "BUDGET_EXCEEDED",
    "userId": 2,
    "message": "You have exceeded your April budget by €45."
  }'
```

### PATCH `/notifications/{id}/read`
Mark a notification as read.

```bash
curl -X PATCH http://localhost:3004/notifications/1/read
```

### GET `/health`
```bash
curl http://localhost:3004/health
```

---

## How the weekly reminder works

`NotificationService` uses Spring's `@Scheduled` annotation:

```java
@Scheduled(cron = "0 0 9 * * MON")  // Every Monday at 09:00
public void sendWeeklyExpenseReminder() { ... }
```

`@EnableScheduling` in `NotificationsApplication.java` activates it.  
To test it quickly, change the cron to `"0/10 * * * * *"` (every 10 seconds).

---

## How other services call this one

From the **budget-service** (Python / FastAPI example):

```python
import httpx

async def notify_budget_alert(user_id: int, percent: float):
    await httpx.AsyncClient().post(
        "http://localhost:3004/notifications",
        json={
            "type": "BUDGET_ALERT_80" if percent < 100 else "BUDGET_EXCEEDED",
            "userId": user_id,
            "message": f"You have used {percent:.0f}% of your monthly budget."
        }
    )
```

---

## Project structure

```
notifications-service/
├── pom.xml
└── src/main/java/com/exercise/notifications/
    ├── NotificationsApplication.java   ← entry point + @EnableScheduling
    ├── controller/
    │   └── NotificationController.java ← REST endpoints
    ├── model/
    │   ├── Notification.java           ← entity + NotificationType enum
    │   └── NotificationRequest.java    ← incoming DTO
    ├── repository/
    │   └── NotificationRepository.java ← in-memory store
    └── service/
        └── NotificationService.java    ← business logic + @Scheduled
```
