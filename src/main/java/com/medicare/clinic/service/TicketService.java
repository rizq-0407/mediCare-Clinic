package com.medicare.clinic.service;

import com.medicare.clinic.dto.TicketDTO;
import com.medicare.clinic.model.Ticket;
import com.medicare.clinic.repository.TicketRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class TicketService {

    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;

    public TicketService(TicketRepository ticketRepository, NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.notificationService = notificationService;
    }

    /**
     * Create a new ticket
     */
    @Transactional
    public TicketDTO createTicket(String patientId, String subject, String description,
                                   String priority, String category) {
        // Generate ticket ID
        String ticketId = generateTicketId();

        Ticket ticket = new Ticket();
        ticket.setTicketId(ticketId);
        ticket.setPatientId(patientId);
        ticket.setSubject(subject);
        ticket.setDescription(description);
        ticket.setStatus("OPEN");
        ticket.setPriority(priority != null ? priority : "MEDIUM");
        ticket.setCategory(category);
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket savedTicket = ticketRepository.save(ticket);

        // Send notification to admins
        notificationService.notifyAdmins("TICKET_CREATED", 
            "New Support Ticket: " + subject,
            "A new support ticket (" + ticketId + ") has been created by patient " + patientId,
            ticketId);

        log.info("Ticket created: {}", ticketId);
        return mapToDTO(savedTicket);
    }

    /**
     * Get ticket by ticketId
     */
    public TicketDTO getTicketById(String ticketId) {
        Ticket ticket = ticketRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));
        return mapToDTO(ticket);
    }

    /**
     * Get all tickets for a patient
     */
    public List<TicketDTO> getPatientTickets(String patientId) {
        return ticketRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get tickets assigned to an admin
     */
    public List<TicketDTO> getAdminTickets(String adminId) {
        return ticketRepository.findByAssignedAdminIdOrderByCreatedAtDesc(adminId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get unassigned tickets
     */
    public List<TicketDTO> getUnassignedTickets() {
        return ticketRepository.findByStatusAndAssignedAdminIdIsNull("OPEN")
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all tickets (admin view)
     */
    public List<TicketDTO> getAllTickets() {
        return ticketRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get tickets by status
     */
    public List<TicketDTO> getTicketsByStatus(String status) {
        return ticketRepository.findByStatus(status)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Assign ticket to an admin
     */
    @Transactional
    public TicketDTO assignTicket(String ticketId, String adminId) {
        Ticket ticket = ticketRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));

        ticket.setAssignedAdminId(adminId);
        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket updated = ticketRepository.save(ticket);

        // Notify admin of assignment
        notificationService.notifyUser("ADMIN", adminId, "TICKET_ASSIGNED",
            "Ticket Assigned to You: " + ticket.getSubject(),
            "You have been assigned ticket " + ticketId,
            ticketId);

        log.info("Ticket {} assigned to admin {}", ticketId, adminId);
        return mapToDTO(updated);
    }

    /**
     * Reply to a ticket
     */
    @Transactional
    public TicketDTO replyToTicket(String ticketId, String adminId, String reply) {
        Ticket ticket = ticketRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));

        if (adminId == null || adminId.isBlank()) {
            throw new RuntimeException("adminId is required");
        }
        if (reply == null || reply.isBlank()) {
            throw new RuntimeException("reply is required");
        }
        if ("CLOSED".equals(ticket.getStatus()) || "RESOLVED".equals(ticket.getStatus())) {
            throw new RuntimeException("Cannot reply to a closed or resolved ticket");
        }

        if (ticket.getAssignedAdminId() == null || ticket.getAssignedAdminId().isBlank()) {
            ticket.setAssignedAdminId(adminId);
        }

        ticket.setAdminReply(reply.trim());
        ticket.setRepliedBy(adminId);
        if (ticket.getFirstResponseAt() == null) {
            ticket.setFirstResponseAt(LocalDateTime.now());
        }
        ticket.setStatus("WAITING-FOR-PATIENT");
        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket updated = ticketRepository.save(ticket);

        // Notify patient
        notificationService.notifyUser("PATIENT", ticket.getPatientId(), "TICKET_UPDATED",
            "Response to Your Ticket: " + ticket.getSubject(),
            "An admin has replied to your ticket " + ticketId,
            ticketId);

        log.info("Reply added to ticket {}", ticketId);
        return mapToDTO(updated);
    }

    /**
     * Update ticket status
     */
    @Transactional
    public TicketDTO updateTicketStatus(String ticketId, String status) {
        Ticket ticket = ticketRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));

        ticket.setStatus(status);
        if ("CLOSED".equals(status) || "RESOLVED".equals(status)) {
            ticket.setClosedAt(LocalDateTime.now());
        }
        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket updated = ticketRepository.save(ticket);

        log.info("Ticket {} status updated to {}", ticketId, status);
        return mapToDTO(updated);
    }

    /**
     * Update ticket priority
     */
    @Transactional
    public TicketDTO updateTicketPriority(String ticketId, String priority) {
        Ticket ticket = ticketRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));

        ticket.setPriority(priority);
        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket updated = ticketRepository.save(ticket);

        log.info("Ticket {} priority updated to {}", ticketId, priority);
        return mapToDTO(updated);
    }

    /**
     * Update ticket (partial)
     */
    @Transactional
    public TicketDTO updateTicket(String ticketId, TicketDTO ticketDTO) {
        Ticket ticket = ticketRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));

        if (ticketDTO.getSubject() != null) {
            ticket.setSubject(ticketDTO.getSubject());
        }
        if (ticketDTO.getDescription() != null) {
            ticket.setDescription(ticketDTO.getDescription());
        }
        if (ticketDTO.getPriority() != null) {
            ticket.setPriority(ticketDTO.getPriority());
        }
        if (ticketDTO.getStatus() != null) {
            ticket.setStatus(ticketDTO.getStatus());
        }
        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket updated = ticketRepository.save(ticket);

        log.info("Ticket {} updated", ticketId);
        return mapToDTO(updated);
    }

    /**
     * Update ticket by patient (allowed only before admin reply)
     */
    @Transactional
    public TicketDTO updateTicketByPatient(String ticketId, String patientId, TicketDTO ticketDTO) {
        Ticket ticket = ticketRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));

        if (!ticket.getPatientId().equals(patientId)) {
            throw new RuntimeException("You can only edit your own ticket");
        }

        if (ticket.getAdminReply() != null && !ticket.getAdminReply().isBlank()) {
            throw new RuntimeException("Ticket cannot be edited after admin reply");
        }

        if (ticketDTO.getSubject() != null && !ticketDTO.getSubject().isBlank()) {
            ticket.setSubject(ticketDTO.getSubject().trim());
        }
        if (ticketDTO.getDescription() != null && !ticketDTO.getDescription().isBlank()) {
            ticket.setDescription(ticketDTO.getDescription().trim());
        }
        if (ticketDTO.getPriority() != null && !ticketDTO.getPriority().isBlank()) {
            ticket.setPriority(ticketDTO.getPriority().trim());
        }
        if (ticketDTO.getCategory() != null) {
            ticket.setCategory(ticketDTO.getCategory());
        }

        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket updated = ticketRepository.save(ticket);

        log.info("Ticket {} edited by patient {}", ticketId, patientId);
        return mapToDTO(updated);
    }

    /**
     * Delete a ticket
     */
    @Transactional
    public void deleteTicket(String ticketId) {
        Ticket ticket = ticketRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));
        ticketRepository.delete(ticket);
        log.info("Ticket {} deleted", ticketId);
    }

    /**
     * Search tickets
     */
    public List<TicketDTO> searchTickets(String keyword) {
        List<Ticket> results = ticketRepository.findBySubjectContainingIgnoreCase(keyword);
        return results.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get ticket statistics
     */
    public TicketStatsDTO getTicketStats(String patientId) {
        TicketStatsDTO stats = new TicketStatsDTO();
        stats.setTotal(ticketRepository.countByPatientId(patientId));
        stats.setOpen(ticketRepository.findByPatientIdAndStatus(patientId, "OPEN").size());
        stats.setInProgress(ticketRepository.findByPatientIdAndStatus(patientId, "IN-PROGRESS").size());
        stats.setResolved(ticketRepository.findByPatientIdAndStatus(patientId, "RESOLVED").size());
        stats.setClosed(ticketRepository.findByPatientIdAndStatus(patientId, "CLOSED").size());
        return stats;
    }

    /**
     * Get admin dashboard stats
     */
    public AdminDashboardStatsDTO getAdminStats() {
        AdminDashboardStatsDTO stats = new AdminDashboardStatsDTO();
        stats.setTotalTickets(ticketRepository.findAll().size());
        stats.setOpenTickets(ticketRepository.findByStatus("OPEN").size());
        stats.setInProgressTickets(ticketRepository.findByStatus("IN-PROGRESS").size());
        stats.setUnassignedTickets(ticketRepository.findByStatusAndAssignedAdminIdIsNull("OPEN").size());
        return stats;
    }

    /**
     * Bulk close tickets
     */
    @Transactional
    public void bulkCloseTickets(List<String> ticketIds) {
        for (String ticketId : ticketIds) {
            updateTicketStatus(ticketId, "CLOSED");
        }
        log.info("Bulk closed {} tickets", ticketIds.size());
    }

    /**
     * Bulk reassign tickets
     */
    @Transactional
    public void bulkReassignTickets(List<String> ticketIds, String adminId) {
        for (String ticketId : ticketIds) {
            assignTicket(ticketId, adminId);
        }
        log.info("Bulk reassigned {} tickets to admin {}", ticketIds.size(), adminId);
    }

    /**
     * Generate unique ticket ID
     */
    private String generateTicketId() {
        long count = ticketRepository.count();
        return "TKT" + String.format("%04d", count + 1);
    }

    /**
     * Map entity to DTO
     */
    private TicketDTO mapToDTO(Ticket ticket) {
        TicketDTO dto = new TicketDTO();
        dto.setTicketId(ticket.getTicketId());
        dto.setPatientId(ticket.getPatientId());
        dto.setSubject(ticket.getSubject());
        dto.setDescription(ticket.getDescription());
        dto.setStatus(ticket.getStatus());
        dto.setPriority(ticket.getPriority());
        dto.setCategory(ticket.getCategory());
        dto.setAssignedAdminId(ticket.getAssignedAdminId());
        dto.setAdminReply(ticket.getAdminReply());
        dto.setRepliedBy(ticket.getRepliedBy());
        dto.setFirstResponseAt(ticket.getFirstResponseAt());
        dto.setClosedAt(ticket.getClosedAt());
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());
        return dto;
    }

    // Helper DTOs
    public static class TicketStatsDTO {
        public long total;
        public long open;
        public long inProgress;
        public long resolved;
        public long closed;

        public long getTotal() { return total; }
        public void setTotal(long total) { this.total = total; }
        public long getOpen() { return open; }
        public void setOpen(long open) { this.open = open; }
        public long getInProgress() { return inProgress; }
        public void setInProgress(long inProgress) { this.inProgress = inProgress; }
        public long getResolved() { return resolved; }
        public void setResolved(long resolved) { this.resolved = resolved; }
        public long getClosed() { return closed; }
        public void setClosed(long closed) { this.closed = closed; }
    }

    public static class AdminDashboardStatsDTO {
        public long totalTickets;
        public long openTickets;
        public long inProgressTickets;
        public long unassignedTickets;

        public long getTotalTickets() { return totalTickets; }
        public void setTotalTickets(long totalTickets) { this.totalTickets = totalTickets; }
        public long getOpenTickets() { return openTickets; }
        public void setOpenTickets(long openTickets) { this.openTickets = openTickets; }
        public long getInProgressTickets() { return inProgressTickets; }
        public void setInProgressTickets(long inProgressTickets) { this.inProgressTickets = inProgressTickets; }
        public long getUnassignedTickets() { return unassignedTickets; }
        public void setUnassignedTickets(long unassignedTickets) { this.unassignedTickets = unassignedTickets; }
    }
}
