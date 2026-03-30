package com.shopeasy.deliveryservice.service;

import com.shopeasy.deliveryservice.dto.TaskRequest;
import com.shopeasy.deliveryservice.dto.TaskResponse;
import com.shopeasy.deliveryservice.model.DeliveryTask;
import com.shopeasy.deliveryservice.model.Driver;
import com.shopeasy.deliveryservice.repository.DeliveryTaskRepository;
import com.shopeasy.deliveryservice.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryTaskService {
    private final DeliveryTaskRepository taskRepository;
    private final DriverRepository driverRepository;

    public TaskResponse createTask(TaskRequest request) {
        DeliveryTask task = DeliveryTask.builder()
                .orderId(request.getOrderId())
                .deliveryAddress(request.getDeliveryAddress())
                .status("PENDING")
                .build();
        return mapToResponse(taskRepository.save(task));
    }

    public List<TaskResponse> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TaskResponse> getPendingTasks() {
        return taskRepository.findByStatus("PENDING").stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TaskResponse getTaskById(String id) {
        DeliveryTask task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        return mapToResponse(task);
    }

    public TaskResponse acceptTask(String taskId, String driverId) {
        DeliveryTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        if (!"PENDING".equals(task.getStatus())) {
            throw new RuntimeException("Task is not in PENDING state");
        }

        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        
        if (!driver.isAvailable()) {
            throw new RuntimeException("Driver is not available");
        }

        // Update task
        task.setDriverId(driverId);
        task.setStatus("ACCEPTED");
        task.setAcceptedAt(Instant.now());

        // Update driver
        driver.setAvailable(false);
        driverRepository.save(driver);

        return mapToResponse(taskRepository.save(task));
    }

    public TaskResponse rejectTask(String taskId, String driverId) {
        DeliveryTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        if (!"PENDING".equals(task.getStatus())) {
            throw new RuntimeException("Only PENDING tasks can be rejected");
        }

        if (!task.getRejectedByDriverIds().contains(driverId)) {
            task.getRejectedByDriverIds().add(driverId);
            taskRepository.save(task);
        }

        return mapToResponse(task);
    }

    public TaskResponse updateStatus(String taskId, String status) {
        DeliveryTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setStatus(status);
        
        if ("DELIVERED".equals(status) || "CANCELLED".equals(status)) {
            if (task.getDriverId() != null) {
                Driver driver = driverRepository.findById(task.getDriverId()).orElse(null);
                if (driver != null) {
                    driver.setAvailable(true);
                    driverRepository.save(driver);
                }
            }
            if ("DELIVERED".equals(status)) {
                task.setDeliveredAt(Instant.now());
            }
        }

        return mapToResponse(taskRepository.save(task));
    }

    public void deleteTask(String id) {
        DeliveryTask task = taskRepository.findById(id).orElse(null);
        if (task != null && task.getDriverId() != null && !"DELIVERED".equals(task.getStatus()) && !"CANCELLED".equals(task.getStatus())) {
            // Free the driver if task is deleted before completion
            Driver driver = driverRepository.findById(task.getDriverId()).orElse(null);
            if (driver != null) {
                driver.setAvailable(true);
                driverRepository.save(driver);
            }
        }
        taskRepository.deleteById(id);
    }

    private TaskResponse mapToResponse(DeliveryTask task) {
        return TaskResponse.builder()
                .id(task.getId())
                .orderId(task.getOrderId())
                .driverId(task.getDriverId())
                .status(task.getStatus())
                .rejectedByDriverIds(task.getRejectedByDriverIds())
                .deliveryAddress(task.getDeliveryAddress())
                .acceptedAt(task.getAcceptedAt())
                .deliveredAt(task.getDeliveredAt())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
