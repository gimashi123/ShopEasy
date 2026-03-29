package com.shopeasy.notificationservice.controller;

import com.shopeasy.notificationservice.model.Notification;
import com.shopeasy.notificationservice.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    // CREATE
    @PostMapping
    public Notification create(@RequestBody Notification notification) {
        return service.create(notification);
    }

    // READ ALL
    @GetMapping
    public List<Notification> getAll() {
        return service.getAll();
    }

    // READ ONE
    @GetMapping("/{id}")
    public Notification getById(@PathVariable String id) {
        return service.getById(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Notification update(@PathVariable String id,
                               @RequestBody Notification notification) {
        return service.update(id, notification);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String delete(@PathVariable String id) {
        service.delete(id);
        return "Deleted successfully";
    }
}