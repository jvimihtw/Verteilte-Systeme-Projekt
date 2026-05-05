package com.exercise.notifications_service.controller;

import com.exercise.notifications_service.model.Notification;
import com.exercise.notifications_service.model.NotificationRequest;
import com.exercise.notifications_service.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST endpoints for the notifications service.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  METHOD  │  PATH                          │  Description                │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │  GET     │  /notifications                │  List all (or by userId)    │
 * │  GET     │  /notifications/unread?userId= │  Unread for a user          │
 * │  POST    │  /notifications                │  Receive from other service │
 * │  PATCH   │  /notifications/{id}/read      │  Mark as read               │
 * │  GET     │  /health                       │  Health check               │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    // ── GET /notifications?userId=2 ───────────────────────────────────────────
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll(
            @RequestParam(required = false) Long userId) {

        List<Notification> data = service.getAll(userId);
        return ResponseEntity.ok(Map.of(
                "service", "notifications-service",
                "count", data.size(),
                "data", data
        ));
    }

    // ── GET /notifications/unread?userId=2 ────────────────────────────────────
    @GetMapping("/unread")
    public ResponseEntity<Map<String, Object>> getUnread(
            @RequestParam Long userId) {

        List<Notification> data = service.getUnread(userId);
        return ResponseEntity.ok(Map.of(
                "service", "notifications-service",
                "count", data.size(),
                "data", data
        ));
    }

    // ── POST /notifications ───────────────────────────────────────────────────
    /**
     * Called by other services (budget-service, expenses-service) to push a
     * notification into this service.
     *
     * Example payloads:
     *
     *  Budget 80% alert (from budget-service):
     *  {
     *    "type":    "BUDGET_ALERT_80",
     *    "userId":  2,
     *    "message": "You have used 80% of your April budget."
     *  }
     *
     *  Budget exceeded (from budget-service):
     *  {
     *    "type":    "BUDGET_EXCEEDED",
     *    "userId":  2,
     *    "message": "You have exceeded your April budget by €45."
     *  }
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @Valid @RequestBody NotificationRequest request) {

        Notification created = service.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of(
                        "service", "notifications-service",
                        "data", created
                ));
    }

    // ── PATCH /notifications/{id}/read ────────────────────────────────────────
    @PatchMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Long id) {
        Optional<Notification> updated = service.markAsRead(id);

        if (updated.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Notification not found with id=" + id));
        }

        return ResponseEntity.ok(Map.of(
                "service", "notifications-service",
                "data", updated.get()
        ));
    }

    // ── GET /health ───────────────────────────────────────────────────────────
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "service", "notifications-service",
                "port", 3004
        ));
    }
}
