package com.medicare.clinic.repository;

import com.medicare.clinic.model.PrescriptionItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrescriptionItemRepository extends JpaRepository<PrescriptionItem, String> {
    List<PrescriptionItem> findByPrescriptionId(String prescriptionId);
}
