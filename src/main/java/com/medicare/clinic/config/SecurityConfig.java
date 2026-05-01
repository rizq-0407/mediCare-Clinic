package com.medicare.clinic.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.Customizer;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(UserDetailsService userDetailsService, JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth

                        // ── PUBLIC — no token required ──────────────────────────────────────
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/agent/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/schedules/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/schedules/search").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/schedules/*/request").hasRole("DOCTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/schedules/*/dismiss-response").hasRole("DOCTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/schedules/*/approve").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/schedules/*/reject").hasRole("ADMIN")
                        .requestMatchers("/api/schedules/**").hasRole("ADMIN")

                        // ── ADMIN-ONLY ───────────────────────────────────────────────────────
                        .requestMatchers("/api/auth/register-employee").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/users/**").hasRole("ADMIN")

                        // ── STAFF / ADMIN / DOCTOR / PHARMACY — can list all users/patients
                        // ─────────────
                        .requestMatchers(HttpMethod.GET, "/api/users")
                        .hasAnyRole("ADMIN", "STAFF", "DOCTOR", "PHARMACY")
                        .requestMatchers(HttpMethod.GET, "/api/users/patients")
                        .hasAnyRole("ADMIN", "STAFF", "DOCTOR", "PHARMACY")
                        .requestMatchers(HttpMethod.GET, "/api/users/doctors")
                        .hasAnyRole("ADMIN", "STAFF", "DOCTOR", "PHARMACY")

                        // ── STAFF / ADMIN / DOCTOR / PATIENT — appointment management ──────────────────
                        .requestMatchers(HttpMethod.GET, "/api/appointments").hasAnyRole("ADMIN", "STAFF", "DOCTOR")
                        .requestMatchers("/api/appointments/patient/**").hasAnyRole("ADMIN", "STAFF", "DOCTOR", "PATIENT")
                        .requestMatchers(HttpMethod.PATCH, "/api/appointments/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.DELETE, "/api/appointments/**").hasAnyRole("ADMIN", "STAFF")

                        // ── PHARMACY / ADMIN / DOCTOR — medicine inventory
                        // ────────────────────────────
                        .requestMatchers("/api/medicines/**").hasAnyRole("ADMIN", "PHARMACY", "DOCTOR")

                        // ── PRESCRIPTIONS — doctor (create), pharmacy (dispense), admin (view)
                        // ────────
                        .requestMatchers("/api/prescriptions/**").hasAnyRole("ADMIN", "DOCTOR", "PHARMACY", "PATIENT")

                        // ── EMR — staff, doctors, admins, and patients (own records) ────────────────────────────────
                        .requestMatchers("/api/emr/**").hasAnyRole("ADMIN", "STAFF", "DOCTOR", "PATIENT")

                        // ── ALL OTHER endpoints require a valid JWT ───────────────────────────
                        .anyRequest().authenticated())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                // ✅ JWT filter populates SecurityContext — runs before any access-check
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://127.0.0.1:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(
                Arrays.asList("Authorization", "Content-Type", "Accept", "X-Requested-With", "Origin"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}