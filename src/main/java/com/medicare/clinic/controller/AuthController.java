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
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUserId(), request.getPassword())
        );
        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUserId());
        final String jwt = jwtService.generateToken(userDetails);
        
        User user = userRepository.findByUserId(request.getUserId()).orElseThrow();
        
        return ResponseEntity.ok(Map.of(
            "token", jwt,
            "username", user.getUsername(),
            "userId", user.getUserId(),
            "role", user.getRole(),
            "fullName", user.getFullName()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByUserId(user.getUserId()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "UserID already exists"));
        }
        
        if (user.getUserId() == null || user.getUserId().isEmpty()) {
            user.setUserId("U" + (System.currentTimeMillis() % 100000));
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Ensure role is default as PATIENT if not assigned during registration
        if (user.getRole() == null) user.setRole(Role.PATIENT);
        
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }
}

@Data
class LoginRequest {
    private String userId;
    private String password;
}
