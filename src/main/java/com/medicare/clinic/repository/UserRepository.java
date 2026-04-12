package com.medicare.clinic.repository;

import com.medicare.clinic.model.User;
import com.medicare.clinic.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Keep original methods to avoid breaking Auth/Prescription services
    Optional<User> findByUsername(String username);
    Optional<User> findByUserId(String userId);
    
    // Add flexible/case-insensitive methods for Scheduling
    Optional<User> findByUsernameIgnoreCase(String username);
    Optional<User> findByFullNameIgnoreCase(String fullName);
    
    long countByRole(Role role);
    
    boolean existsByUsernameIgnoreCaseAndRole(String username, Role role);
    boolean existsByFullNameIgnoreCaseAndRole(String fullName, Role role);
    boolean existsByUserIdIgnoreCaseAndRole(String userId, Role role);
}
