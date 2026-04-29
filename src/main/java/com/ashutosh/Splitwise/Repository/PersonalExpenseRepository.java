package com.ashutosh.Splitwise.Repository;

import com.ashutosh.Splitwise.Entity.PersonalExpense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PersonalExpenseRepository extends JpaRepository<PersonalExpense, Long> {

    List<PersonalExpense> findByUserId(Long userId);

    List<PersonalExpense> findByUserIdAndCreatedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);

}
