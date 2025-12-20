package com.ashutosh.Splitwise.Repository;

import com.ashutosh.Splitwise.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
