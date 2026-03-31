package com.medicare.clinic.service;

import com.medicare.clinic.model.Medicine;
import com.medicare.clinic.repository.MedicineRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;

    public MedicineService(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    public Medicine saveMedicine(Medicine medicine) {
        if (medicine.getMedicineId() == null || medicine.getMedicineId().isEmpty()) {
            medicine.setMedicineId("MED" + (System.currentTimeMillis() % 100000));
        }
        return medicineRepository.save(medicine);
    }

    public void deleteMedicine(String id) {
        medicineRepository.deleteById(id);
    }
}