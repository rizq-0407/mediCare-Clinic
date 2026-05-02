package com.medicare.clinic.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String fullName;
    private String email;
    private String contactNumber;
    private String password; // Optional
}
