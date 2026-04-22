package com.medicare.clinic.controller;

import com.medicare.clinic.dto.TicketDTO;
import com.medicare.clinic.service.TicketService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@Slf4j
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    /**
     * POST /api/tickets - Create a new ticket
     */
    @PostMapping
    public ResponseEntity<?> createTicket(@RequestBody Map<String, Object> request) {
        try {
            String patientId = (String) request.get("patientId");
            String subject = (String) request.get("subject");
            String description = (String) request.get("description");
            String priority = (String) request.get("priority");
            String category = (String) request.get("category");

            if (patientId == null || subject == null || description == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields"));
            }

            TicketDTO ticket = ticketService.createTicket(patientId, subject, description, priority, category);
            return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
        } catch (Exception e) {
            log.error("Error creating ticket", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /api/tickets/{ticketId} - Get ticket by ID
     */
    @GetMapping("/{ticketId}")
    public ResponseEntity<?> getTicket(@PathVariable String ticketId) {
        try {
            TicketDTO ticket = ticketService.getTicketById(ticketId);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            log.error("Error fetching ticket", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /api/tickets/patient/{patientId} - Get all tickets for a patient
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPatientTickets(@PathVariable String patientId) {
        try {
            List<TicketDTO> tickets = ticketService.getPatientTickets(patientId);
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            log.error("Error fetching patient tickets", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /api/tickets - Get all tickets (admin)
     */
    @GetMapping
    public ResponseEntity<?> getAllTickets() {
        try {
            List<TicketDTO> tickets = ticketService.getAllTickets();
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            log.error("Error fetching all tickets", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /api/tickets/unassigned - Get unassigned tickets
     */
    @GetMapping("/unassigned")
    public ResponseEntity<?> getUnassignedTickets() {
        try {
            List<TicketDTO> tickets = ticketService.getUnassignedTickets();
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            log.error("Error fetching unassigned tickets", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /api/tickets/assigned/{adminId} - Get tickets assigned to admin
     */
    @GetMapping("/assigned/{adminId}")
    public ResponseEntity<?> getAdminTickets(@PathVariable String adminId) {
        try {
            List<TicketDTO> tickets = ticketService.getAdminTickets(adminId);
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            log.error("Error fetching admin tickets", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * POST /api/tickets/search - Search tickets
     */
    @PostMapping("/search")
    public ResponseEntity<?> searchTickets(@RequestBody Map<String, String> request) {
        try {
            String keyword = request.get("keyword");
            List<TicketDTO> tickets = ticketService.searchTickets(keyword);
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            log.error("Error searching tickets", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * PUT /api/tickets/{ticketId}/reply - Reply to a ticket
     */
    @PutMapping("/{ticketId}/reply")
    public ResponseEntity<?> replyToTicket(@PathVariable String ticketId,
                                            @RequestBody Map<String, String> request) {
        try {
            String adminId = request.get("adminId");
            String reply = request.get("reply");

            if (adminId == null || adminId.isBlank() || reply == null || reply.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields"));
            }

            TicketDTO ticket = ticketService.replyToTicket(ticketId, adminId, reply);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            log.error("Error replying to ticket", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * PATCH /api/tickets/{ticketId}/status - Update ticket status
     */
    @PatchMapping("/{ticketId}/status")
    public ResponseEntity<?> updateTicketStatus(@PathVariable String ticketId,
                                                 @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            TicketDTO ticket = ticketService.updateTicketStatus(ticketId, status);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            log.error("Error updating ticket status", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * PATCH /api/tickets/{ticketId}/priority - Update ticket priority
     */
    @PatchMapping("/{ticketId}/priority")
    public ResponseEntity<?> updateTicketPriority(@PathVariable String ticketId,
                                                   @RequestBody Map<String, String> request) {
        try {
            String priority = request.get("priority");
            TicketDTO ticket = ticketService.updateTicketPriority(ticketId, priority);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            log.error("Error updating ticket priority", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * PATCH /api/tickets/{ticketId}/assign/{adminId} - Assign ticket to admin
     */
    @PatchMapping("/{ticketId}/assign/{adminId}")
    public ResponseEntity<?> assignTicket(@PathVariable String ticketId, @PathVariable String adminId) {
        try {
            TicketDTO ticket = ticketService.assignTicket(ticketId, adminId);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            log.error("Error assigning ticket", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * PATCH /api/tickets/{ticketId} - Update ticket
     */
    @PatchMapping("/{ticketId}")
    public ResponseEntity<?> updateTicket(@PathVariable String ticketId, @RequestBody TicketDTO ticketDTO) {
        try {
            TicketDTO updated = ticketService.updateTicket(ticketId, ticketDTO);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Error updating ticket", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * PUT /api/tickets/{ticketId}/patient-edit - Patient edits own ticket before admin reply
     */
    @PutMapping("/{ticketId}/patient-edit")
    public ResponseEntity<?> updateTicketByPatient(@PathVariable String ticketId, @RequestBody TicketDTO ticketDTO) {
        try {
            if (ticketDTO.getPatientId() == null || ticketDTO.getPatientId().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "patientId is required"));
            }

            TicketDTO updated = ticketService.updateTicketByPatient(ticketId, ticketDTO.getPatientId(), ticketDTO);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Error editing ticket by patient", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * DELETE /api/tickets/{ticketId} - Delete ticket
     */
    @DeleteMapping("/{ticketId}")
    public ResponseEntity<?> deleteTicket(@PathVariable String ticketId) {
        try {
            ticketService.deleteTicket(ticketId);
            return ResponseEntity.ok(Map.of("message", "Ticket deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting ticket", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * POST /api/tickets/bulk/close - Bulk close tickets
     */
    @PostMapping("/bulk/close")
    public ResponseEntity<?> bulkCloseTickets(@RequestBody Map<String, List<String>> request) {
        try {
            List<String> ticketIds = request.get("ticketIds");
            ticketService.bulkCloseTickets(ticketIds);
            return ResponseEntity.ok(Map.of("message", "Tickets closed successfully"));
        } catch (Exception e) {
            log.error("Error bulk closing tickets", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * POST /api/tickets/bulk/reassign - Bulk reassign tickets
     */
    @PostMapping("/bulk/reassign")
    public ResponseEntity<?> bulkReassignTickets(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<String> ticketIds = (List<String>) request.get("ticketIds");
            String adminId = (String) request.get("adminId");
            ticketService.bulkReassignTickets(ticketIds, adminId);
            return ResponseEntity.ok(Map.of("message", "Tickets reassigned successfully"));
        } catch (Exception e) {
            log.error("Error bulk reassigning tickets", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /api/tickets/stats/{patientId} - Get ticket statistics
     */
    @GetMapping("/stats/{patientId}")
    public ResponseEntity<?> getTicketStats(@PathVariable String patientId) {
        try {
            TicketService.TicketStatsDTO stats = ticketService.getTicketStats(patientId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching ticket stats", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /api/tickets/admin/stats - Get admin dashboard stats
     */
    @GetMapping("/admin/stats")
    public ResponseEntity<?> getAdminStats() {
        try {
            TicketService.AdminDashboardStatsDTO stats = ticketService.getAdminStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching admin stats", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
