package com.ashutosh.Splitwise.Repository;

import com.ashutosh.Splitwise.Entity.MonthlyBudget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MonthlyBudgetRepository extends JpaRepository<MonthlyBudget, Long> {

    Optional<MonthlyBudget> findByUserIdAndYearAndMonth(Long userId, int year, int month);
}
