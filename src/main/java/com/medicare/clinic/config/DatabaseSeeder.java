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
            ScheduleRepository scheduleRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Seed Users (Admin, Doctor, Pharmacy, Patients)
            seedUser(userRepository, passwordEncoder, "admin", "ADM001", "admin@medicare.com", Role.ADMIN,
                    "System Admin", "555-000");
            seedUser(userRepository, passwordEncoder, "drjames", "DOC001", "james@medicare.com", Role.DOCTOR,
                    "Dr. James Wilson", "555-001");
            seedUser(userRepository, passwordEncoder, "pharma_one", "PHM001", "store@medicare.com", Role.PHARMACY,
                    "Sarah Pharma", "555-002");
            seedUser(userRepository, passwordEncoder, "staff_one", "STF001", "staff@medicare.com", Role.STAFF,
                    "Alex Reception", "555-003");
            seedUser(userRepository, passwordEncoder, "johndoe", "PAT001", "john@gmail.com", Role.PATIENT, "John Doe",
                    "555-0101");
            seedUser(userRepository, passwordEncoder, "janesmith", "PAT002", "jane@gmail.com", Role.PATIENT,
                    "Jane Smith", "555-0102");

            // 2. Seed Doctors (Profile details)
            if (doctorRepository.count() == 0) {
                doctorRepository.save(
                        new Doctor(null, "Dr. James Wilson", "Cardiology", "MBBS, MD", "Mon,Wed,Fri", 500.0, true));
                System.out.println("Seeded doctor profiles.");
            }

            // 3. Seed Medicines
            if (medicineRepository.count() == 0) {
                medicineRepository.save(new Medicine("MED001", "Paracetamol", "Analgesic", "Pain relief", 5.00, 100, 10,
                        LocalDate.now().plusMonths(12), "Supplier A"));
                medicineRepository.save(new Medicine("MED002", "Amoxicillin", "Antibiotic", "Infection treatment",
                        12.50, 50, 5, LocalDate.now().plusMonths(6), "Supplier B"));

                System.out.println("Seeded medicines.");
            }

            // 4. Seed Schedules (for Dr. James Wilson - username: drjames)
            if (scheduleRepository.count() == 0) {
                Schedule s1 = new Schedule();
                s1.setDoctorName("drjames");
                s1.setSpecialization("Cardiology");
                s1.setDate(LocalDate.now().plusDays(1).toString());
                s1.setTime("09:00");
                s1.setRoomNumber("Room 101");
                s1.setAvailableSlots(10);
                scheduleRepository.save(s1);

                Schedule s2 = new Schedule();
                s2.setDoctorName("drjames");
                s2.setSpecialization("Cardiology");
                s2.setDate(LocalDate.now().plusDays(2).toString());
                s2.setTime("14:00");
                s2.setRoomNumber("Room 102");
                s2.setAvailableSlots(8);
                scheduleRepository.save(s2);

                System.out.println("Seeded schedules for drjames.");
            }
        };
    }

    private void seedUser(UserRepository repo, PasswordEncoder encoder, String username, String userId,
            String email, Role role, String fullName, String contact) {
        User user = repo.findByUsername(username).orElse(new User());
        
        // If user is new, set basic fields
        if (user.getUserId() == null) {
            user.setUsername(username);
            user.setUserId(userId);
            user.setRole(role);
        }
        
        // Always update these to ensure they are correct
        user.setEmail(email);
        user.setFullName(fullName);
        user.setContactNumber(contact);
        
        // Force reset password to "password123" (hashed) to ensure login works
        user.setPassword(encoder.encode("password123"));
        
        repo.save(user);
        System.out.println("Seeded/Updated user: " + username + " [Role: " + role + "]");
    }
}
