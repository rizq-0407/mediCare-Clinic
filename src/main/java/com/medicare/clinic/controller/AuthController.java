package com.medicare.clinic.controller;

import com.medicare.clinic.config.JwtService;
import com.medicare.clinic.model.Role;
import com.medicare.clinic.model.User;
import com.medicare.clinic.repository.UserRepository;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
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
<<<<<<< HEAD
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        final String jwt = jwtService.generateToken(userDetails);
        
        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();
        
        return ResponseEntity.ok(Map.of(
            "token", jwt,
            "username", user.getUsername(),
            "userId", user.getUserId(),
            "role", user.getRole(),
            "fullName", user.getFullName()
        ));
=======
        log.info("Login attempt for username: '{}'", request.getUsername());

        // Validate input
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            log.warn("Login failed: username is empty");
            return ResponseEntity.badRequest().body(Map.of("message", "Username is required"));
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            log.warn("Login failed: password is empty for username '{}'", request.getUsername());
            return ResponseEntity.badRequest().body(Map.of("message", "Password is required"));
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (UsernameNotFoundException ex) {
            log.warn("Login failed: user '{}' not found", request.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password"));
        } catch (BadCredentialsException ex) {
            log.warn("Login failed: bad credentials for username '{}'", request.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password"));
        } catch (Exception ex) {
            log.error("Login failed: unexpected error for username '{}'", request.getUsername(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred. Please try again."));
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        final String jwt = jwtService.generateToken(userDetails);

        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();

        log.info("Login successful for username: '{}', role: {}", user.getUsername(), user.getRole().name());

        // Build response using HashMap to safely handle potential null values
        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("username", user.getUsername());
        response.put("userId", user.getUserId() != null ? user.getUserId() : "");
        response.put("role", user.getRole().name());
        response.put("fullName", user.getFullName() != null ? user.getFullName() : user.getUsername());

        return ResponseEntity.ok(response);
>>>>>>> 45e23be (“emr”)
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
<<<<<<< HEAD
        // Ensure public registration is only for PATIENT
        if (user.getRole() == null || user.getRole() == Role.PATIENT) {
            user.setRole(Role.PATIENT);
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Public registration is only for patients."));
        }
        
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken."));
=======
        log.info("Registration attempt for username: '{}'", user.getUsername());

        if (user.getUsername() == null || user.getUsername().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is required"));
        }

        if (user.getEmail() == null || user.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        if (user.getPassword() == null || user.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password is required"));
        }

        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            log.warn("Registration failed: username '{}' already exists", user.getUsername());
            return ResponseEntity.badRequest().body(Map.of("message", "Username already exists"));
        }

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            log.warn("Registration failed: email '{}' already exists", user.getEmail());
            return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
        }

        if (user.getUserId() == null || user.getUserId().isBlank()) {
            user.setUserId("U" + (System.currentTimeMillis() % 100000));
        } else if (userRepository.findByUserId(user.getUserId()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "UserID already exists"));
>>>>>>> 45e23be (“emr”)
        }
        
        user.setUserId(generateUserId(user.getRole()));
        user.setPassword(passwordEncoder.encode(user.getPassword()));
<<<<<<< HEAD
        
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
=======

        if (user.getRole() == null) {
            user.setRole(Role.PATIENT);
        }

        userRepository.save(user);
        log.info("Registration successful for username: '{}', userId: '{}'", user.getUsername(), user.getUserId());
        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
>>>>>>> 45e23be (“emr”)
    }
}

@Data
class LoginRequest {
    private String username;
    private String password;
}
