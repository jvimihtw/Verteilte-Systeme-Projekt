package com.exercise.notifications_service.model;

import javax.validation.constraints.NotNull;

public class NotificationRequest {
    @NotNull
    private String message;

    private Notification.NotificationType type;
    private Long userId;

    // Add other fields as necessary

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Notification.NotificationType getType() {
        return type;
    }

    public void setType(Notification.NotificationType type) {
        this.type = type;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    // Add other getters and setters as necessary
}