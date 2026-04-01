package com.medicare.clinic.controller;

import com.medicare.clinic.dto.PrescriptionDTO;
import com.medicare.clinic.service.PrescriptionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = "*")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @GetMapping
    public List<PrescriptionDTO> getAllPrescriptions() {
        return prescriptionService.getAllPrescriptions();
    }

    @GetMapping("/patient/{patientId}")
    public List<PrescriptionDTO> getPrescriptionsByPatient(@PathVariable String patientId) {
        return prescriptionService.getPrescriptionsByPatientId(patientId);
    }

    @PostMapping
    public PrescriptionDTO addPrescription(@RequestBody PrescriptionDTO dto) {
        return prescriptionService.createPrescription(dto);
    }

    @PutMapping("/{id}")
    public PrescriptionDTO updatePrescription(@PathVariable String id, @RequestBody PrescriptionDTO dto) {
        return prescriptionService.updatePrescription(id, dto);
    }

    // PATCH endpoint for pharmacist to update prescription status
    @PatchMapping("/{id}/status")
    public PrescriptionDTO updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        return prescriptionService.updateStatus(id, newStatus);
    }

    @DeleteMapping("/{id}")
    public void deletePrescription(@PathVariable String id) {
        prescriptionService.deletePrescription(id);
    }
}
