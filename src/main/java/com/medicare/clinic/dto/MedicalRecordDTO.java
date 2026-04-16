package com.medicare.clinic.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordDTO {
    private Long id;

    @NotBlank(message = "Patient full name is required")
    @Size(max = 100, message = "Patient full name cannot exceed 100 characters")
    private String patientFullName;

    @Size(max = 50, message = "Patient username cannot exceed 50 characters")
    private String patientUsername;

    @PastOrPresent(message = "Date of birth cannot be in the future")
    private LocalDate dateOfBirth;

    @Pattern(regexp = "^(Male|Female|Other|)$", message = "Invalid gender")
    private String gender;

    @Pattern(regexp = "^(A\\+|A-|B\\+|B-|AB\\+|AB-|O\\+|O-|)$", message = "Invalid blood group")
    private String bloodGroup;

    private String allergies;

    @Size(max = 100, message = "Attending doctor name cannot exceed 100 characters")
    private String attendingDoctor;

    @NotNull(message = "Visit date is required")
    @PastOrPresent(message = "Visit date cannot be in the future")
    private LocalDate visitDate;

    private LocalDate nextVisitFollowUpDate;

    @Pattern(regexp = "^(Active|Follow-Up|Discharged|Critical|)$", message = "Invalid status")
    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
