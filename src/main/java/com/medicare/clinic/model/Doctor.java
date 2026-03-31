package com.medicare.clinic.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DoctorID")
    private Long doctorId;

    @Column(name = "Name", nullable = false)
    private String name;

    @Column(name = "Specialty", nullable = false)
    private String specialty;

    @Column(name = "Qualifications")
    private String qualifications;

    @Column(name = "AvailableDays")
    private String availableDays;  // e.g. "Mon,Tue,Wed,Thu,Fri"

    @Column(name = "ConsultationFee")
    private Double consultationFee;

    @Column(name = "IsAvailable")
    private Boolean isAvailable = true;
}
