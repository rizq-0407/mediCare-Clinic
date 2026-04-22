package com.medicare.clinic.repository;

import com.medicare.clinic.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Optional<Notification> findByNotificationId(String notificationId);
    List<Notification> findByRecipientIdAndRecipientRoleOrderByCreatedAtDesc(String recipientId, String role);
    List<Notification> findByRecipientIdAndRecipientRoleAndIsReadFalseOrderByCreatedAtDesc(String recipientId, String role);
    List<Notification> findByTicketId(String ticketId);
    long countByRecipientIdAndRecipientRoleAndIsReadFalse(String recipientId, String role);
    void deleteByTicketId(String ticketId);
}
