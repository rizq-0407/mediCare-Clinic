package com.medicare.clinic.repository;

import com.medicare.clinic.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByTicketId(String ticketId);
    List<Ticket> findByPatientId(String patientId);
    List<Ticket> findByPatientIdOrderByCreatedAtDesc(String patientId);
    List<Ticket> findByAssignedAdminId(String adminId);
    List<Ticket> findByAssignedAdminIdOrderByCreatedAtDesc(String adminId);
    List<Ticket> findByStatus(String status);
    List<Ticket> findByStatusAndAssignedAdminIdIsNull(String status);
    List<Ticket> findByStatusAndPriority(String status, String priority);
    List<Ticket> findByPatientIdAndStatus(String patientId, String status);
    List<Ticket> findBySubjectContainingIgnoreCase(String subject);
    List<Ticket> findByCategoryOrderByCreatedAtDesc(String category);
    long countByStatus(String status);
    long countByPatientId(String patientId);
    long countByAssignedAdminId(String adminId);
}
