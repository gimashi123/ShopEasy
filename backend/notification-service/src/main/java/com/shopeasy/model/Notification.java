package com.shopeasy.model;

public class Notification {

    private Long id;
    private String message;
    private String user;

    public Notification() {}

    public Notification(Long id, String message, String user) {
        this.id = id;
        this.message = message;
        this.user = user;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getUser() { return user; }
    public void setUser(String user) { this.user = user; }
}