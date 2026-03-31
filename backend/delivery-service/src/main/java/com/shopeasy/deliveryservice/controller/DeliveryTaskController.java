package com.shopeasy.deliveryservice.controller;

import com.shopeasy.deliveryservice.dto.StatusUpdateRequest;
import com.shopeasy.deliveryservice.dto.TaskRequest;
import com.shopeasy.deliveryservice.dto.TaskResponse;
import com.shopeasy.deliveryservice.service.DeliveryTaskService;
import com.shopeasy.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery/tasks")
@RequiredArgsConstructor
public class DeliveryTaskController {
    private final DeliveryTaskService taskService;

    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(@Valid @RequestBody TaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Delivery task created successfully", taskService.createTask(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getAllTasks() {
        return ResponseEntity.ok(ApiResponse.success("All tasks retrieved successfully", taskService.getAllTasks()));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getPendingTasks() {
        return ResponseEntity.ok(ApiResponse.success("Pending tasks retrieved successfully", taskService.getPendingTasks()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> getTaskById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Task retrieved successfully", taskService.getTaskById(id)));
    }

    @PostMapping("/{taskId}/accept/{driverId}")
    public ResponseEntity<ApiResponse<TaskResponse>> acceptTask(
            @PathVariable String taskId, @PathVariable String driverId) {
        return ResponseEntity.ok(ApiResponse.success("Task accepted by driver", taskService.acceptTask(taskId, driverId)));
    }

    @PostMapping("/{taskId}/reject/{driverId}")
    public ResponseEntity<ApiResponse<TaskResponse>> rejectTask(
            @PathVariable String taskId, @PathVariable String driverId) {
        return ResponseEntity.ok(ApiResponse.success("Task rejected by driver", taskService.rejectTask(taskId, driverId)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TaskResponse>> updateStatus(
            @PathVariable String id, @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Task status updated", taskService.updateStatus(id, request.getStatus())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable String id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully", null));
    }
}
