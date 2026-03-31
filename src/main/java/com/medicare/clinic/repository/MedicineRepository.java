package com.medicare.clinic.repository;

import com.medicare.clinic.model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, String> {
    @Query("SELECT m FROM Medicine m WHERE m.stockQuantity < :threshold")
    List<Medicine> findLowStockMedicines(int threshold);
}