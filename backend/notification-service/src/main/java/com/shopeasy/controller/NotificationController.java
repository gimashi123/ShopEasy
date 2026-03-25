package com.shopeasy.controller;

import com.shopeasy.model.Notification;
import com.shopeasy.service.NotificationService;
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
    public Notification getById(@PathVariable Long id) {
        return service.getById(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Notification update(@PathVariable Long id,
                               @RequestBody Notification notification) {
        return service.update(id, notification);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.delete(id);
        return "Deleted successfully";
    }
}