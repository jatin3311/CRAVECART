package com.hcltech.retail_ordering.controller;

import org.springframework.web.bind.annotation.*;

import com.hcltech.retail_ordering.dto.LoginRequest;
import com.hcltech.retail_ordering.dto.RegisterRequest;
import com.hcltech.retail_ordering.services.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // =========================
    // REGISTER
    // =========================
    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    // =========================
    // LOGIN
    // =========================
    @PostMapping("/login")
    public String login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}