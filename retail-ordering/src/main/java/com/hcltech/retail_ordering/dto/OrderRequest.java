package com.hcltech.retail_ordering.dto;

import jakarta.validation.constraints.NotBlank;

import lombok.*;
@Getter
@Setter
public class OrderRequest {

    private Long menuId;
    private Integer quantity;

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;
}