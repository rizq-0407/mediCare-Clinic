package com.medicare.clinic.service;

import com.medicare.clinic.dto.NotificationDTO;
import com.medicare.clinic.model.Notification;
import com.medicare.clinic.repository.NotificationRepository;
import com.medicare.clinic.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    /**
     * Notify a specific user
     */
    @Transactional
    public NotificationDTO notifyUser(String recipientRole, String recipientId, String type,
                                       String title, String message, String ticketId) {
        String notificationId = generateNotificationId();

        Notification notification = new Notification();
        notification.setNotificationId(notificationId);
        notification.setRecipientRole(recipientRole);
        notification.setRecipientId(recipientId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setTicketId(ticketId);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        Notification saved = notificationRepository.save(notification);
        log.info("Notification created for {} ({}): {}", recipientId, recipientRole, type);
        return mapToDTO(saved);
    }

    /**
     * Notify all admins
     */
    @Transactional
    public void notifyAdmins(String type, String title, String message, String ticketId) {
        String notificationId = generateNotificationId();

        Notification notification = new Notification();
        notification.setNotificationId(notificationId);
        notification.setRecipientRole("ADMIN");
        notification.setRecipientId("BROADCAST");  // Broadcast to all admins
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setTicketId(ticketId);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        notificationRepository.save(notification);
        log.info("Broadcast notification sent to all admins: {}", type);
    }

    /**
     * Get notifications for a user
     */
    public List<NotificationDTO> getUserNotifications(String userId, String role) {
        return notificationRepository.findByRecipientIdAndRecipientRoleOrderByCreatedAtDesc(userId, role)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get unread notifications for a user
     */
    public List<NotificationDTO> getUnreadNotifications(String userId, String role) {
        return notificationRepository.findByRecipientIdAndRecipientRoleAndIsReadFalseOrderByCreatedAtDesc(userId, role)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get unread count for a user
     */
    public long getUnreadCount(String userId, String role) {
        return notificationRepository.countByRecipientIdAndRecipientRoleAndIsReadFalse(userId, role);
    }

    /**
     * Mark notification as read
     */
    @Transactional
    public NotificationDTO markAsRead(String notificationId) {
        Notification notification = notificationRepository.findByNotificationId(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));

        notification.setIsRead(true);
        Notification updated = notificationRepository.save(notification);
        log.info("Notification {} marked as read", notificationId);
        return mapToDTO(updated);
    }

    /**
     * Get notification by ID
     */
    public NotificationDTO getNotificationById(String notificationId) {
        Notification notification = notificationRepository.findByNotificationId(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));
        return mapToDTO(notification);
    }

    /**
     * Get notifications for a ticket
     */
    public List<NotificationDTO> getTicketNotifications(String ticketId) {
        return notificationRepository.findByTicketId(ticketId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Delete notification
     */
    @Transactional
    public void deleteNotification(String notificationId) {
        Notification notification = notificationRepository.findByNotificationId(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));
        notificationRepository.delete(notification);
        log.info("Notification {} deleted", notificationId);
    }

    /**
     * Generate unique notification ID
     */
    private String generateNotificationId() {
        return "NOTIF" + System.currentTimeMillis();
    }

    /**
     * Map entity to DTO
     */
    private NotificationDTO mapToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setNotificationId(notification.getNotificationId());
        dto.setRecipientRole(notification.getRecipientRole());
        dto.setRecipientId(notification.getRecipientId());
        dto.setType(notification.getType());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setTicketId(notification.getTicketId());
        dto.setIsRead(notification.getIsRead());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}
