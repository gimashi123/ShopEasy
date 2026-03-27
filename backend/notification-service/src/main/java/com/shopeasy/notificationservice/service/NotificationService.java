package com.shopeasy.notificationservice.service;

import com.shopeasy.notificationservice.model.Notification;
import com.shopeasy.notificationservice.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository repo;

    public NotificationService(NotificationRepository repo) {
        this.repo = repo;
    }

    // CREATE
    public Notification create(Notification notification) {
        return repo.save(notification);
    }

    // READ ALL
    public List<Notification> getAll() {
        return repo.findAll();
    }

    // READ ONE
    public Notification getById(String id) {
        return repo.findById(id).orElse(null);
    }

    // UPDATE
    public Notification update(String id, Notification notification) {
        notification.setId(id);
        return repo.save(notification);
    }

    // DELETE
    public void delete(String id) {
        repo.deleteById(id);
    }
}