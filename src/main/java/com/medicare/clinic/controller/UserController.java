package com.medicare.clinic.controller;

import com.medicare.clinic.model.Role;
import com.medicare.clinic.model.User;
import com.medicare.clinic.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Returns all patients — used by the doctor dashboard to populate
     * the patient dropdown in the prescription creation form.
     */
    @GetMapping("/patients")
    public List<Map<String, String>> getAllPatients() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.PATIENT)
                .map(u -> Map.of(
                        "id", u.getUserId(),
                        "name", u.getFullName() != null ? u.getFullName() : u.getUsername()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Returns all doctors — useful for future reference.
     */
    @GetMapping("/doctors")
    public List<Map<String, String>> getAllDoctors() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.DOCTOR)
                .map(u -> Map.of(
                        "id", u.getUserId(),
                        "name", u.getFullName() != null ? u.getFullName() : u.getUsername()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Returns all registered users in the system.
     */
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Updates an existing user's details (Name, Email, Contact, Role).
     */
    @PutMapping("/{id}")
    public org.springframework.http.ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userData) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setFullName(userData.getFullName());
        user.setEmail(userData.getEmail());
        user.setContactNumber(userData.getContactNumber());
        user.setRole(userData.getRole());

        return org.springframework.http.ResponseEntity.ok(userRepository.save(user));
    }
}
