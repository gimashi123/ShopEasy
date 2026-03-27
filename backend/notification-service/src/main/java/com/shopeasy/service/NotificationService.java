package com.shopeasy.service;
import com.shopeasy.model.Notification;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class NotificationService {

    private final Map<Long, Notification> store = new HashMap<>();
    private Long idCounter = 1L;

    // CREATE
    public Notification create(Notification notification) {
        notification.setId(idCounter++);
        store.put(notification.getId(), notification);
        return notification;
    }

    // READ ALL
    public List<Notification> getAll() {
        return new ArrayList<>(store.values());
    }

    // READ ONE
    public Notification getById(Long id) {
        return store.get(id);
    }

    // UPDATE
    public Notification update(Long id, Notification notification) {
        notification.setId(id);
        store.put(id, notification);
        return notification;
    }

    // DELETE
    public void delete(Long id) {
        store.remove(id);
    }
}