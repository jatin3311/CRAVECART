package com.hcltech.retail_ordering.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import lombok.*;

@Getter
@Setter
public class RegisterRequest {
    private String username;
    private String email;
    private String password;

    @NotBlank(message = "Contact number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Must be 10 digits")
    private String contactNumber;
}
