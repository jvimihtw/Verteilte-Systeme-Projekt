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
 * Three notification types are handled:
 *  1. BUDGET_ALERT_80  – another service POSTs this when a user hits 80 % spend
 *  2. BUDGET_EXCEEDED  – another service POSTs this when a user surpasses budget
 *  3. WEEKLY_REMINDER  – automatically fired every Monday at 09:00 by the scheduler
 */
@Service
public class NotificationService {

    private final NotificationRepository repository;

    public NotificationService(NotificationRepository repository) {
        this.repository = repository;
    }

    // ── Create from external request (budget-service / expenses-service) ─────
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
     * Cron format: second  minute  hour  day-of-month  month  day-of-week
     *
     * For testing purposes you can temporarily change the cron to run every
     * 10 seconds:  "0/10 * * * * *"
     */
    @Scheduled(cron = "0 0 9 * * MON")
    public void sendWeeklyExpenseReminder() {
        System.out.println("⏰  [Scheduler] Sending weekly expense upload reminders...");

        // In a real app you would fetch all active userIds from the users-service.
        // Here we simulate with a fixed list so the scheduler is self-contained.
        List<Long> activeUserIds = List.of(1L, 2L, 3L);

        for (Long userId : activeUserIds) {
            Notification reminder = new Notification(
                    null,
                    NotificationType.WEEKLY_REMINDER,
                    userId,
                    "📎 Weekly reminder: please upload your expenses for this week!"
            );
            repository.save(reminder);
            System.out.printf("   → Reminder sent to userId=%d%n", userId);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Adds a friendly emoji prefix based on notification type if the caller
     * didn't already include one.
     */
    private String enrichMessage(NotificationType type, String original) {
        return switch (type) {
            case BUDGET_ALERT_80 -> "⚠️  " + original;
            case BUDGET_EXCEEDED -> "🚨  " + original;
            case WEEKLY_REMINDER -> "📎  " + original;
        };
    }

    private void logNotification(Notification n) {
        System.out.printf("🔔  [%s] userId=%s → %s%n",
                n.getType(), n.getUserId(), n.getMessage());
    }
}
