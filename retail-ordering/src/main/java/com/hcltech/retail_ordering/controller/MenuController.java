package com.hcltech.retail_ordering.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.hcltech.retail_ordering.entity.Menu;
import com.hcltech.retail_ordering.repository.MenuRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuRepository menuRepository;

    @GetMapping
    public List<Menu> getAll() {
        return menuRepository.findAll();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Menu add(@RequestBody Menu menu) {
        return menuRepository.save(menu);
    }
}