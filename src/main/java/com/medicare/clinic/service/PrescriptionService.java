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
    private final com.medicare.clinic.repository.UserRepository userRepository;
    private final com.medicare.clinic.repository.MedicineRepository medicineRepository;

    public PrescriptionService(PrescriptionRepository prescriptionRepository,
            PrescriptionItemRepository prescriptionItemRepository,
            com.medicare.clinic.repository.UserRepository userRepository,
            com.medicare.clinic.repository.MedicineRepository medicineRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.prescriptionItemRepository = prescriptionItemRepository;
        this.userRepository = userRepository;
        this.medicineRepository = medicineRepository;
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
                
                medicineRepository.findById(firstItem.getMedicineId())
                    .ifPresent(m -> dto.setMedicineName(m.getName()));
            }

            // Lookup Patient Name by userId (e.g., PAT001)
            if (p.getPatientId() != null) {
                userRepository.findByUserId(p.getPatientId())
                    .ifPresent(u -> dto.setPatientName(u.getFullName() != null ? u.getFullName() : u.getUsername()));
            }

            // Lookup Doctor Name by userId (e.g., DOC001)
            if (p.getDoctorId() != null) {
                userRepository.findByUserId(p.getDoctorId())
                    .ifPresent(u -> dto.setDoctorName(u.getFullName() != null ? u.getFullName() : u.getUsername()));
            }

            dtos.add(dto);
        }
        return dtos;
    }

    public List<PrescriptionDTO> getPrescriptionsByPatientId(String patientId) {
        List<Prescription> prescriptions = prescriptionRepository.findByPatientId(patientId);
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

                medicineRepository.findById(firstItem.getMedicineId())
                    .ifPresent(m -> dto.setMedicineName(m.getName()));
            }

            if (p.getDoctorId() != null) {
                userRepository.findByUserId(p.getDoctorId())
                    .ifPresent(u -> dto.setDoctorName(u.getFullName() != null ? u.getFullName() : u.getUsername()));
            }

            userRepository.findByUserId(patientId)
                .ifPresent(u -> dto.setPatientName(u.getFullName() != null ? u.getFullName() : u.getUsername()));

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

        // Populate names for immediate UI feedback
        if (dto.getMedicineId() != null) {
            medicineRepository.findById(dto.getMedicineId())
                .ifPresent(m -> dto.setMedicineName(m.getName()));
        }
        if (dto.getPatientId() != null) {
            userRepository.findByUserId(dto.getPatientId())
                .ifPresent(u -> dto.setPatientName(u.getFullName() != null ? u.getFullName() : u.getUsername()));
        }
        if (dto.getDoctorId() != null) {
            userRepository.findByUserId(dto.getDoctorId())
                .ifPresent(u -> dto.setDoctorName(u.getFullName() != null ? u.getFullName() : u.getUsername()));
        }

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

            // Handle stock decrement when dispensed
            if ("Dispensed".equalsIgnoreCase(newStatus) || "COMPLETED".equalsIgnoreCase(newStatus)) {
                medicineRepository.findById(firstItem.getMedicineId()).ifPresent(m -> {
                    int currentStock = m.getStockQuantity() != null ? m.getStockQuantity() : 0;
                    int quantityToReduce = firstItem.getQuantity() != null ? firstItem.getQuantity() : 1;
                    if (currentStock >= quantityToReduce) {
                        m.setStockQuantity(currentStock - quantityToReduce);
                        medicineRepository.save(m);
                        System.out.println("Stock decremented for " + m.getName() + ". New stock: " + m.getStockQuantity());
                    }
                });
            }

            medicineRepository.findById(firstItem.getMedicineId())
                .ifPresent(m -> dto.setMedicineName(m.getName()));
        }

        if (prescription.getPatientId() != null) {
            userRepository.findByUserId(prescription.getPatientId())
                .ifPresent(u -> dto.setPatientName(u.getFullName() != null ? u.getFullName() : u.getUsername()));
        }

        if (prescription.getDoctorId() != null) {
            userRepository.findByUserId(prescription.getDoctorId())
                .ifPresent(u -> dto.setDoctorName(u.getFullName() != null ? u.getFullName() : u.getUsername()));
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
