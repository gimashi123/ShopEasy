package com.shopeasy.notificationservice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;   // MongoDB uses String ID

    private String message;
    private String user;

    public Notification() {}

    public Notification(String id, String message, String user) {
        this.id = id;
        this.message = message;
        this.user = user;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getUser() { return user; }
    public void setUser(String user) { this.user = user; }
}