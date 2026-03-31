package com.medicare.clinic.service;

import com.medicare.clinic.dto.PrescriptionDTO;
import com.medicare.clinic.model.Prescription;
import com.medicare.clinic.model.PrescriptionItem;
import com.medicare.clinic.repository.PrescriptionItemRepository;
import com.medicare.clinic.repository.PrescriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;

    public PrescriptionService(PrescriptionRepository prescriptionRepository,
            PrescriptionItemRepository prescriptionItemRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.prescriptionItemRepository = prescriptionItemRepository;
    }

    public List<PrescriptionDTO> getAllPrescriptions() {
        List<Prescription> prescriptions = prescriptionRepository.findAll();
        List<PrescriptionDTO> dtos = new ArrayList<>();

        for (Prescription p : prescriptions) {
            List<PrescriptionItem> items = prescriptionItemRepository.findByPrescriptionId(p.getPrescriptionId());

            PrescriptionDTO dto = new PrescriptionDTO();
            dto.setId(p.getPrescriptionId());
            dto.setPatientId(p.getPatientId());
            dto.setDoctorId(p.getDoctorId());
            dto.setInstructions(p.getNotes());
            dto.setRefills(0);
            dto.setStatus(p.getStatus() != null ? p.getStatus() : "Pending");
            dto.setCreatedAt(p.getPrescriptionDate() != null
                    ? p.getPrescriptionDate().format(DateTimeFormatter.ISO_LOCAL_DATE)
                    : "");

            if (!items.isEmpty()) {
                PrescriptionItem firstItem = items.get(0);
                dto.setMedicineId(firstItem.getMedicineId());
                dto.setDosage(firstItem.getDosage());
                dto.setDuration(firstItem.getDuration());
            }

            dtos.add(dto);
        }
        return dtos;
    }

    @Transactional
    public PrescriptionDTO createPrescription(PrescriptionDTO dto) {
        long ts = System.currentTimeMillis();
        String prescriptionId = "PRES" + (ts % 100000);
        String prescriptionItemId = "PI" + ((ts + 1) % 100000);

        LocalDateTime now = LocalDateTime.now();

        Prescription prescription = new Prescription();
        prescription.setPrescriptionId(prescriptionId);
        prescription.setPatientId(dto.getPatientId());
        prescription.setDoctorId(dto.getDoctorId());
        prescription.setNotes(dto.getInstructions());
        prescription.setPrescriptionDate(now);
        prescription.setStatus("Pending");

        prescriptionRepository.save(prescription);

        if (dto.getMedicineId() != null && !dto.getMedicineId().isEmpty()) {
            PrescriptionItem item = new PrescriptionItem();
            item.setPrescriptionItemId(prescriptionItemId);
            item.setPrescriptionId(prescriptionId);
            item.setMedicineId(dto.getMedicineId());
            item.setQuantity(1);
            item.setDosage(dto.getDosage());
            item.setDuration(dto.getDuration());
            prescriptionItemRepository.save(item);
        }

        dto.setId(prescriptionId);
        dto.setStatus("Pending");
        dto.setCreatedAt(now.format(DateTimeFormatter.ISO_LOCAL_DATE));
        return dto;
    }

    @Transactional
    public PrescriptionDTO updatePrescription(String id, PrescriptionDTO dto) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found with id: " + id));

        prescription.setPatientId(dto.getPatientId());
        prescription.setDoctorId(dto.getDoctorId());
        prescription.setNotes(dto.getInstructions());

        prescriptionRepository.save(prescription);

        List<PrescriptionItem> items = prescriptionItemRepository.findByPrescriptionId(id);
        PrescriptionItem item;
        if (!items.isEmpty()) {
            item = items.get(0);
        } else {
            item = new PrescriptionItem();
            item.setPrescriptionItemId("PI" + (System.currentTimeMillis() % 100000));
            item.setPrescriptionId(id);
            item.setQuantity(1);
        }

        item.setMedicineId(dto.getMedicineId());
        item.setDosage(dto.getDosage());
        item.setDuration(dto.getDuration());

        prescriptionItemRepository.save(item);

        dto.setId(id);
        dto.setStatus(prescription.getStatus() != null ? prescription.getStatus() : "Pending");
        if (prescription.getPrescriptionDate() != null) {
            dto.setCreatedAt(prescription.getPrescriptionDate().format(DateTimeFormatter.ISO_LOCAL_DATE));
        }
        return dto;
    }

    @Transactional
    public PrescriptionDTO updateStatus(String id, String newStatus) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found with id: " + id));

        prescription.setStatus(newStatus);
        prescriptionRepository.save(prescription);

        List<PrescriptionItem> items = prescriptionItemRepository.findByPrescriptionId(id);

        PrescriptionDTO dto = new PrescriptionDTO();
        dto.setId(prescription.getPrescriptionId());
        dto.setPatientId(prescription.getPatientId());
        dto.setDoctorId(prescription.getDoctorId());
        dto.setInstructions(prescription.getNotes());
        dto.setStatus(newStatus);
        dto.setRefills(0);
        dto.setCreatedAt(prescription.getPrescriptionDate() != null
                ? prescription.getPrescriptionDate().format(DateTimeFormatter.ISO_LOCAL_DATE)
                : "");

        if (!items.isEmpty()) {
            PrescriptionItem firstItem = items.get(0);
            dto.setMedicineId(firstItem.getMedicineId());
            dto.setDosage(firstItem.getDosage());
            dto.setDuration(firstItem.getDuration());
        }

        return dto;
    }

    @Transactional
    public void deletePrescription(String id) {
        List<PrescriptionItem> items = prescriptionItemRepository.findByPrescriptionId(id);
        prescriptionItemRepository.deleteAll(items);
        prescriptionRepository.deleteById(id);
    }
}
