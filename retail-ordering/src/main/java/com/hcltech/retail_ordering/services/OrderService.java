package com.hcltech.retail_ordering.services;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hcltech.retail_ordering.dto.OrderRequest;
import com.hcltech.retail_ordering.entity.Menu;
import com.hcltech.retail_ordering.entity.Order;
import com.hcltech.retail_ordering.entity.User;
import com.hcltech.retail_ordering.repository.MenuRepository;
import com.hcltech.retail_ordering.repository.OrderRepository;
import com.hcltech.retail_ordering.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final MenuRepository menuRepository;
    private final UserRepository userRepository;

    @Transactional
    public Order placeOrder(OrderRequest request, String username) {

        User user = userRepository.findByUsername(username).orElseThrow();
        Menu menu = menuRepository.findById(request.getMenuId()).orElseThrow();

        if (menu.getStock() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock");
        }

        menu.setStock(menu.getStock() - request.getQuantity());

        Order order = Order.builder()
            .user(user)
            .menu(menu)
            .quantity(request.getQuantity())
            .totalAmount(menu.getPrice() * request.getQuantity())
            .deliveryAddress(request.getDeliveryAddress())
            .orderDate(LocalDateTime.now())
            .build();

        return orderRepository.save(order);
    }
}