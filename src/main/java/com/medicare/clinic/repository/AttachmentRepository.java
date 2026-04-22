package com.medicare.clinic.repository;

import com.medicare.clinic.model.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    Optional<Attachment> findByAttachmentId(String attachmentId);
    List<Attachment> findByTicketId(String ticketId);
    void deleteByTicketId(String ticketId);
    void deleteByAttachmentId(String attachmentId);
}
