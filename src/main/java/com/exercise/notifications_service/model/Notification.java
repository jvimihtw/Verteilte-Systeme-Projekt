package com.exercise.notifications_service.model;

import java.time.LocalDateTime;

/**
 * Represents a single notification stored in memory.
 *
 * NotificationType drives the business logic:
 *   BUDGET_ALERT_80    → user reached 80 % of their budget
 *   BUDGET_EXCEEDED    → user has surpassed their budget
 *   WEEKLY_REMINDER    → weekly prompt to upload expenses
 */
public class Notification {

    // ── Possible types ──────────────────────────────────────────────────────
    public enum NotificationType {
        BUDGET_ALERT_80,
        BUDGET_EXCEEDED,
        WEEKLY_REMINDER
    }

    // ── Fields ───────────────────────────────────────────────────────────────
    private Long              id;
    private NotificationType  type;
    private Long              userId;      // null for broadcast notifications (e.g. weekly reminder)
    private String            message;
    private boolean           read;
    private LocalDateTime     createdAt;

    // ── Constructors ─────────────────────────────────────────────────────────
    public Notification() {}

    public Notification(Long id, NotificationType type, Long userId, String message) {
        this.id        = id;
        this.type      = type;
        this.userId    = userId;
        this.message   = message;
        this.read      = false;
        this.createdAt = LocalDateTime.now();
    }

    // ── Getters & Setters ────────────────────────────────────────────────────
    public Long getId()                     { return id; }
    public void setId(Long id)              { this.id = id; }

    public NotificationType getType()                       { return type; }
    public void             setType(NotificationType type)  { this.type = type; }

    public Long   getUserId()               { return userId; }
    public void   setUserId(Long userId)    { this.userId = userId; }

    public String getMessage()              { return message; }
    public void   setMessage(String m)      { this.message = m; }

    public boolean isRead()                 { return read; }
    public void    setRead(boolean read)    { this.read = read; }

    public LocalDateTime getCreatedAt()               { return createdAt; }
    public void          setCreatedAt(LocalDateTime t){ this.createdAt = t; }
}
