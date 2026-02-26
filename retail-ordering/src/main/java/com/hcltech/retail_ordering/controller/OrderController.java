package com.hcltech.retail_ordering.controller;

import java.security.Principal;

import org.springframework.web.bind.annotation.*;

import com.hcltech.retail_ordering.dto.OrderRequest;
import com.hcltech.retail_ordering.entity.Order;
import com.hcltech.retail_ordering.services.OrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public Order placeOrder(@Valid @RequestBody OrderRequest request,
                            Principal principal) {

        return orderService.placeOrder(request, principal.getName());
    }
}