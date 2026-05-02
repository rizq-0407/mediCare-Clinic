package com.medicare.clinic.controller;

import com.medicare.clinic.model.Role;
import com.medicare.clinic.model.User;
import com.medicare.clinic.repository.UserRepository;
import com.medicare.clinic.dto.ProfileUpdateRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userData) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setFullName(userData.getFullName());
        user.setEmail(userData.getEmail());
        user.setContactNumber(userData.getContactNumber());
        user.setRole(userData.getRole());

        return ResponseEntity.ok(userRepository.save(user));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(Authentication authentication, @RequestBody ProfileUpdateRequest request) {
        if (authentication == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getContactNumber() != null) user.setContactNumber(request.getContactNumber());
        
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return ResponseEntity.ok(userRepository.save(user));
    }
}
