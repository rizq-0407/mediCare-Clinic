package com.medicare.clinic.config;

import com.medicare.clinic.model.*;
import com.medicare.clinic.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;

@Configuration
public class DatabaseSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, 
                                   MedicineRepository medicineRepository,
                                   DoctorRepository doctorRepository,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Seed Users (Admin, Doctor, Pharmacy, Patients)
            seedUser(userRepository, passwordEncoder, "admin", "ADM001", "admin@medicare.com", Role.ADMIN, "System Admin", "555-000");
            seedUser(userRepository, passwordEncoder, "drjames", "DOC001", "james@medicare.com", Role.DOCTOR, "Dr. James Wilson", "555-001");
            seedUser(userRepository, passwordEncoder, "pharma_one", "PHM001", "store@medicare.com", Role.PHARMACY, "Sarah Pharma", "555-002");
            seedUser(userRepository, passwordEncoder, "johndoe", "PAT001", "john@gmail.com", Role.PATIENT, "John Doe", "555-0101");
            seedUser(userRepository, passwordEncoder, "janesmith", "PAT002", "jane@gmail.com", Role.PATIENT, "Jane Smith", "555-0102");

            // 2. Seed Doctors (Profile details)
            if (doctorRepository.count() == 0) {
                doctorRepository.save(new Doctor(null, "Dr. James Wilson", "Cardiology", "MBBS, MD", "Mon,Wed,Fri", 500.0, true));
                System.out.println("Seeded doctor profiles.");
            }

            // 3. Seed Medicines
            if (medicineRepository.count() == 0) {
                medicineRepository.save(new Medicine("MED001", "Paracetamol", "Analgesic", "Pain relief", 5.00, 100, 10, LocalDate.now().plusMonths(12), "Supplier A"));
                medicineRepository.save(new Medicine("MED002", "Amoxicillin", "Antibiotic", "Infection treatment", 12.50, 50, 5, LocalDate.now().plusMonths(6), "Supplier B"));
                
                System.out.println("Seeded medicines.");
            }
        };
    }

    private void seedUser(UserRepository repo, PasswordEncoder encoder, String username, String userId, 
                          String email, Role role, String fullName, String contact) {
        User user = repo.findByUsername(username).orElse(new User());
        user.setUsername(username);
        user.setUserId(userId);
        user.setEmail(email);
        user.setRole(role);
        user.setFullName(fullName);
        user.setContactNumber(contact);
        user.setPassword(encoder.encode("password123"));
        repo.save(user);
        System.out.println("Seeded/Updated user: " + username);
    }
}
