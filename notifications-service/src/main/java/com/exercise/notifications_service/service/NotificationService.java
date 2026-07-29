package com.exercise.notifications_service.service;

import com.exercise.notifications_service.model.Notification;
import com.exercise.notifications_service.model.Notification.NotificationType;
import com.exercise.notifications_service.model.NotificationRequest;
import com.exercise.notifications_service.repository.NotificationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Core business logic for the notifications service.
 *
 * The frontend POSTs a notification whenever the user:
 *   - creates / updates / deletes a budget
 *   - creates / updates / deletes an expense
 *   - crosses 70% / 90% / 100% of their total budget
 *
 * A weekly reminder is also fired automatically by the scheduler.
 */
@Service
public class NotificationService {

    private final NotificationRepository repository;

    public NotificationService(NotificationRepository repository) {
        this.repository = repository;
    }

    // ── Create from external request (frontend / other services) ─────────────
    public Notification create(NotificationRequest request) {
        String finalMessage = enrichMessage(request.getType(), request.getMessage());

        Notification notification = new Notification(
                null,
                request.getType(),
                request.getUserId(),
                finalMessage
        );
        Notification saved = repository.save(notification);
        logNotification(saved);
        return saved;
    }

    // ── Get all notifications (optionally filtered by userId) ────────────────
    public List<Notification> getAll(Long userId) {
        if (userId != null) {
            return repository.findByUserId(userId);
        }
        return repository.findAll();
    }

    // ── Get unread notifications for a user ───────────────────────────────────
    public List<Notification> getUnread(Long userId) {
        return repository.findUnreadByUserId(userId);
    }

    // ── Mark a notification as read ───────────────────────────────────────────
    public Optional<Notification> markAsRead(Long id) {
        return repository.findById(id).map(n -> {
            n.setRead(true);
            return n;
        });
    }

    // ── Weekly reminder scheduler ─────────────────────────────────────────────
    /**
     * Fires every Monday at 09:00.
     * For quick testing, temporarily change the cron to "0/10 * * * * *"
     * (every 10 seconds).
     */
    @Scheduled(cron = "0 0 9 * * MON")
    public void sendWeeklyExpenseReminder() {
        System.out.println("⏰  [Scheduler] Sending weekly expense upload reminders...");

        List<Long> activeUserIds = List.of(1L, 2L, 3L);

        for (Long userId : activeUserIds) {
            Notification reminder = new Notification(
                    null,
                    NotificationType.WEEKLY_REMINDER,
                    userId,
                    "Weekly reminder: please upload your expenses for this week!"
            );
            repository.save(reminder);
            System.out.printf("   → Reminder sent to userId=%d%n", userId);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Adds a friendly emoji prefix based on notification type.
     */
    private String enrichMessage(NotificationType type, String original) {
        return switch (type) {
            case BUDGET_CREATED   -> "🟢  " + original;
            case BUDGET_UPDATED   -> "✏️  " + original;
            case BUDGET_DELETED   -> "🗑️  " + original;
            case EXPENSE_CREATED  -> "💸  " + original;
            case EXPENSE_UPDATED  -> "✏️  " + original;
            case EXPENSE_DELETED  -> "🗑️  " + original;
            case BUDGET_ALERT_70  -> "⚠️  " + original;
            case BUDGET_ALERT_90  -> "⚠️  " + original;
            case BUDGET_EXCEEDED  -> "🚨  " + original;
            case WEEKLY_REMINDER  -> "📎  " + original;
        };
    }

    private void logNotification(Notification n) {
        System.out.printf("🔔  [%s] userId=%s → %s%n",
                n.getType(), n.getUserId(), n.getMessage());
    }
}
