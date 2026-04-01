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
}
