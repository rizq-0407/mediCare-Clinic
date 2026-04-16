package com.medicare.clinic.controller;

import com.medicare.clinic.dto.NotificationDTO;
import com.medicare.clinic.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@Slf4j
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * GET /api/notifications/admin - Get admin notifications
     */
    @GetMapping("/admin")
    public ResponseEntity<?> getAdminNotifications(@RequestParam String adminId) {
        try {
            List<NotificationDTO> notifications = notificationService.getUserNotifications(adminId, "ADMIN");
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("Error fetching admin notifications", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /api/notifications/patient/{patientId} - Get patient notifications
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPatientNotifications(@PathVariable String patientId) {
        try {
            List<NotificationDTO> notifications = notificationService.getUserNotifications(patientId, "PATIENT");
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("Error fetching patient notifications", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /api/notifications - Get user notifications (generic)
     */
    @GetMapping
    public ResponseEntity<?> getUserNotifications(@RequestParam String userId, @RequestParam String role) {
        try {
            List<NotificationDTO> notifications = notificationService.getUserNotifications(userId, role);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("Error fetching user notifications", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /api/notifications/unread - Get unread notifications
     */
    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadNotifications(@RequestParam String userId, @RequestParam String role) {
        try {
            List<NotificationDTO> notifications = notificationService.getUnreadNotifications(userId, role);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("Error fetching unread notifications", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /api/notifications/count - Get unread count
     */
    @GetMapping("/count")
    public ResponseEntity<?> getUnreadCount(@RequestParam String userId, @RequestParam String role) {
        try {
            long count = notificationService.getUnreadCount(userId, role);
            return ResponseEntity.ok(Map.of("unreadCount", count));
        } catch (Exception e) {
            log.error("Error fetching unread count", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * PATCH /api/notifications/{notificationId}/read - Mark notification as read
     */
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String notificationId) {
        try {
            NotificationDTO notification = notificationService.markAsRead(notificationId);
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            log.error("Error marking notification as read", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /api/notifications/{notificationId} - Get notification by ID
     */
    @GetMapping("/{notificationId}")
    public ResponseEntity<?> getNotification(@PathVariable String notificationId) {
        try {
            NotificationDTO notification = notificationService.getNotificationById(notificationId);
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            log.error("Error fetching notification", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
