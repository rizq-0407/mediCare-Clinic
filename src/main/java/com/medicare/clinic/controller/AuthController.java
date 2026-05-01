package com.medicare.clinic.controller;

import com.medicare.clinic.config.JwtService;
import com.medicare.clinic.model.Role;
import com.medicare.clinic.model.User;
import com.medicare.clinic.repository.UserRepository;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager,
            UserDetailsService userDetailsService,
            JwtService jwtService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        System.out.println("Login attempt for user: " + request.getUsername());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        } catch (Exception e) {
            System.out.println("Authentication failed for: " + request.getUsername() + " - " + e.getMessage());
            return ResponseEntity.status(401).body(Map.of("message", "Invalid username or password"));
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        final String jwt = jwtService.generateToken(userDetails);

        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();
        System.out.println("Login successful for: " + user.getUsername() + " [Role: " + user.getRole() + "]");

        return ResponseEntity.ok(Map.of(
                "token", jwt,
                "username", user.getUsername(),
                "userId", user.getUserId(),
                "role", user.getRole(),
                "fullName", user.getFullName()));
    }

    private String generateUserId(Role role) {
        String prefix = switch (role) {
            case PATIENT -> "PAT";
            case DOCTOR -> "DOC";
            case PHARMACY -> "PHM";
            case ADMIN -> "ADM";
            case STAFF -> "STF";
            default -> "USR";
        };
        long count = userRepository.countByRole(role);
        String newId;
        do {
            count++;
            newId = prefix + String.format("%03d", count);
        } while (userRepository.findByUserId(newId).isPresent());
        return newId;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        // Ensure public registration is only for PATIENT
        if (user.getRole() == null || user.getRole() == Role.PATIENT) {
            user.setRole(Role.PATIENT);
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Public registration is only for patients."));
        }

        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken."));
        }

        user.setUserId(generateUserId(user.getRole()));
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Patient registered successfully", "userId", user.getUserId()));
    }

    @PostMapping("/register-employee")
    public ResponseEntity<?> registerEmployee(@RequestBody User user) {
        if (user.getRole() == null || user.getRole() == Role.PATIENT) {
            return ResponseEntity.badRequest().body(Map.of("message", "This endpoint is for employee registration."));
        }

        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken."));
        }

        user.setUserId(generateUserId(user.getRole()));
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Employee registered successfully", "userId", user.getUserId()));
    }
}

@Data
class LoginRequest {
    private String username;
    private String password;
}
