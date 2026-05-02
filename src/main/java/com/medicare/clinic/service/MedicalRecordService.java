package com.medicare.clinic.service;

import com.medicare.clinic.dto.MedicalRecordDTO;
import com.medicare.clinic.model.MedicalRecord;
import com.medicare.clinic.repository.MedicalRecordRepository;
import com.medicare.clinic.model.Role;
import com.medicare.clinic.model.User;
import com.medicare.clinic.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository repository;
    private final UserRepository userRepository;

    public MedicalRecordService(MedicalRecordRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    public List<MedicalRecordDTO> getAllRecords() {
        return repository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public MedicalRecordDTO getRecordById(Long id) {
        MedicalRecord record = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical record not found with id: " + id));
        return toDTO(record);
    }

    public List<MedicalRecordDTO> getRecordsByPatientUsername(String patientUsername) {
        return repository.findByPatientUsernameOrderByCreatedAtDesc(patientUsername)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<MedicalRecordDTO> searchByPatientName(String name) {
        return repository.findByPatientFullNameContainingIgnoreCaseOrderByCreatedAtDesc(name)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public MedicalRecordDTO createRecord(MedicalRecordDTO dto) {
        validateDates(dto);
        validatePatientRole(dto.getPatientUsername());
        MedicalRecord entity = toEntity(dto);
        MedicalRecord saved = repository.save(entity);
        return toDTO(saved);
    }

    public MedicalRecordDTO updateRecord(Long id, MedicalRecordDTO dto) {
        validateDates(dto);
        validatePatientRole(dto.getPatientUsername());
        MedicalRecord existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical record not found with id: " + id));

        existing.setPatientFullName(dto.getPatientFullName() != null ? dto.getPatientFullName().trim() : null);
        existing.setPatientUsername(dto.getPatientUsername() != null ? dto.getPatientUsername().trim() : null);
        existing.setDateOfBirth(dto.getDateOfBirth());
        existing.setGender(dto.getGender());
        existing.setBloodGroup(dto.getBloodGroup());
        existing.setAllergies(dto.getAllergies() != null ? dto.getAllergies().trim() : null);
        existing.setAttendingDoctor(dto.getAttendingDoctor() != null ? dto.getAttendingDoctor().trim() : null);
        existing.setVisitDate(dto.getVisitDate());
        existing.setNextVisitFollowUpDate(dto.getNextVisitFollowUpDate());
        existing.setStatus(dto.getStatus());
        existing.setDiagnosis(dto.getDiagnosis() != null ? dto.getDiagnosis().trim() : null);
        existing.setNotes(dto.getNotes() != null ? dto.getNotes().trim() : null);

        MedicalRecord saved = repository.save(existing);
        return toDTO(saved);
    }

    public void deleteRecord(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Medical record not found with id: " + id);
        }
        repository.deleteById(id);
    }

    private void validateDates(MedicalRecordDTO dto) {
        if (dto.getNextVisitFollowUpDate() != null && dto.getVisitDate() != null) {
            if (dto.getNextVisitFollowUpDate().isBefore(dto.getVisitDate())) {
                throw new IllegalArgumentException("Next visit follow-up date cannot be earlier than visit date");
            }
        }
    }

    private void validatePatientRole(String username) {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Patient username must be provided");
        }
        User user = userRepository.findByUsername(username.trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found with username: " + username));
        if (user.getRole() != Role.PATIENT) {
            throw new IllegalArgumentException("User is not registered as a patient");
        }
    }

    private MedicalRecordDTO toDTO(MedicalRecord entity) {
        MedicalRecordDTO dto = new MedicalRecordDTO();
        dto.setId(entity.getId());
        dto.setPatientFullName(entity.getPatientFullName());
        dto.setPatientUsername(entity.getPatientUsername());
        dto.setDateOfBirth(entity.getDateOfBirth());
        dto.setGender(entity.getGender());
        dto.setBloodGroup(entity.getBloodGroup());
        dto.setAllergies(entity.getAllergies());
        dto.setAttendingDoctor(entity.getAttendingDoctor());
        dto.setVisitDate(entity.getVisitDate());
        dto.setNextVisitFollowUpDate(entity.getNextVisitFollowUpDate());
        dto.setStatus(entity.getStatus());
        dto.setDiagnosis(entity.getDiagnosis());
        dto.setNotes(entity.getNotes());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    private MedicalRecord toEntity(MedicalRecordDTO dto) {
        MedicalRecord entity = new MedicalRecord();
        entity.setPatientFullName(dto.getPatientFullName() != null ? dto.getPatientFullName().trim() : null);
        entity.setPatientUsername(dto.getPatientUsername() != null ? dto.getPatientUsername().trim() : null);
        entity.setDateOfBirth(dto.getDateOfBirth());
        entity.setGender(dto.getGender());
        entity.setBloodGroup(dto.getBloodGroup());
        entity.setAllergies(dto.getAllergies() != null ? dto.getAllergies().trim() : null);
        entity.setAttendingDoctor(dto.getAttendingDoctor() != null ? dto.getAttendingDoctor().trim() : null);
        entity.setVisitDate(dto.getVisitDate());
        entity.setNextVisitFollowUpDate(dto.getNextVisitFollowUpDate());
        entity.setStatus(dto.getStatus() != null && !dto.getStatus().isBlank() ? dto.getStatus() : "Active");
        entity.setDiagnosis(dto.getDiagnosis() != null ? dto.getDiagnosis().trim() : null);
        entity.setNotes(dto.getNotes() != null ? dto.getNotes().trim() : null);
        return entity;
    }
}
