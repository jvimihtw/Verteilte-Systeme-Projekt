package com.exercise.notifications_service.model;

import java.time.LocalDateTime;

/**
 * Represents a single notification stored in memory.
 *
 * NotificationType drives the business logic. The frontend sends the matching
 * type whenever the user performs a budget/expense action or crosses a spend
 * threshold.
 */
public class Notification {

    // ── Possible types ──────────────────────────────────────────────────────
    public enum NotificationType {
        // Budget lifecycle
        BUDGET_CREATED,
        BUDGET_UPDATED,
        BUDGET_DELETED,

        // Expense lifecycle
        EXPENSE_CREATED,
        EXPENSE_UPDATED,
        EXPENSE_DELETED,

        // Spend thresholds (percentage of total budget used)
        BUDGET_ALERT_70,
        BUDGET_ALERT_90,
        BUDGET_EXCEEDED,

        // Scheduler
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
