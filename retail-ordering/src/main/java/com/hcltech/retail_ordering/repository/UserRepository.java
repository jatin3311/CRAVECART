package com.hcltech.retail_ordering.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.hcltech.retail_ordering.entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
