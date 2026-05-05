package com.exercise.notifications_service.repository;

import com.exercise.notifications_service.model.Notification;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * Simple in-memory store — no database needed for the exercise.
 * In a real app you would swap this for a JPA repository backed by PostgreSQL.
 */
@Repository
public class NotificationRepository {

    private final List<Notification> store  = new ArrayList<>();
    private final AtomicLong         idSeq  = new AtomicLong(1);

    // ── Save ─────────────────────────────────────────────────────────────────
    public Notification save(Notification notification) {
        notification.setId(idSeq.getAndIncrement());
        store.add(notification);
        return notification;
    }

    // ── Find all ─────────────────────────────────────────────────────────────
    public List<Notification> findAll() {
        return new ArrayList<>(store);
    }

    // ── Find by userId ────────────────────────────────────────────────────────
    public List<Notification> findByUserId(Long userId) {
        return store.stream()
                .filter(n -> userId.equals(n.getUserId()))
                .collect(Collectors.toList());
    }

    // ── Find by id ────────────────────────────────────────────────────────────
    public Optional<Notification> findById(Long id) {
        return store.stream().filter(n -> n.getId().equals(id)).findFirst();
    }

    // ── Find unread by userId ─────────────────────────────────────────────────
    public List<Notification> findUnreadByUserId(Long userId) {
        return store.stream()
                .filter(n -> userId.equals(n.getUserId()) && !n.isRead())
                .collect(Collectors.toList());
    }
}
