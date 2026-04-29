package com.ashutosh.Splitwise.Service;

import com.ashutosh.Splitwise.Dto.*;
import com.ashutosh.Splitwise.Entity.MonthlyBudget;
import com.ashutosh.Splitwise.Entity.PersonalExpense;
import com.ashutosh.Splitwise.Entity.User;
import com.ashutosh.Splitwise.Exception.DataNotFoundException;
import com.ashutosh.Splitwise.Repository.MonthlyBudgetRepository;
import com.ashutosh.Splitwise.Repository.PersonalExpenseRepository;
import com.ashutosh.Splitwise.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PersonalExpenseService {

    private final PersonalExpenseRepository personalExpenseRepository;
    private final UserRepository userRepository;
    private final MonthlyBudgetRepository monthlyBudgetRepository;

    public String addExpense(PersonalExpenseRequestDto requestDto){

        User user = userRepository.findById(requestDto.getUserId())
                .orElseThrow(()-> new DataNotFoundException("User not found"));

        PersonalExpense expense = new PersonalExpense();
        expense.setUserId(user.getId());
        expense.setDescription(requestDto.getDescription());
        expense.setAmount(requestDto.getAmount());
        expense.setCategory(requestDto.getCategory());
        expense.setCreatedAt(LocalDateTime.now());

        personalExpenseRepository.save(expense);

        return "Expense added successfully";
    }

    public List<PersonalExpenseResponseDto> getAllExpenses(Long userId){

        List<PersonalExpense> expenses = personalExpenseRepository.findByUserId(userId);

        List<PersonalExpenseResponseDto> result = new ArrayList<>();

        for(PersonalExpense e : expenses){
            result.add(new PersonalExpenseResponseDto(
                    e.getDescription(),
                    e.getAmount(),
                    e.getCategory(),
                    e.getCreatedAt()
            ));
        }
        return result;
    }

    public PersonalExpenseSummaryDto getMonthlySummary(Long userId, int year ,int month) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new DataNotFoundException("User not found"));

        YearMonth yearMonth = YearMonth.of(year, month);

        LocalDateTime start = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime end = yearMonth.atEndOfMonth().atTime(23, 59);

        List<PersonalExpense> expenses = personalExpenseRepository.findByUserIdAndCreatedAtBetween(userId, start, end);

        double total = 0;
        Map<String, Double> categoryMap = new HashMap<>();

        Map<String, PersonalExpense> maxExpense = new HashMap<>();

        for (PersonalExpense e : expenses) {
            total += e.getAmount();

            categoryMap.merge(
                    e.getCategory(),
                    e.getAmount(),
                    Double::sum
            );

            maxExpense.compute(e.getCategory(), (key, existing) -> {
                if (existing == null || e.getAmount() > existing.getAmount()) {
                    return e;
                }
                return existing;
            });
        }
        Map<String, PersonalExpenseResponseDto> highestExpenseMap = new HashMap<>();

        for (Map.Entry<String, PersonalExpense> entry : maxExpense.entrySet()) {

            PersonalExpense e = entry.getValue();

            highestExpenseMap.put(entry.getKey(),
                    new PersonalExpenseResponseDto(
                            e.getDescription(),
                            e.getAmount(),
                            e.getCategory(),
                            e.getCreatedAt()
                    ));
        }

        return new PersonalExpenseSummaryDto(
                userId,
                user.getName(),
                total,
                yearMonth.toString(),
                categoryMap,
                highestExpenseMap
        );
    }

    public List<PersonalExpenseResponseDto> getExpensesByDateRange(Long userId, LocalDateTime start, LocalDateTime end) {

        userRepository.findById(userId)
                .orElseThrow(() -> new DataNotFoundException("User not found"));

        List<PersonalExpense> expenses =
                personalExpenseRepository.findByUserIdAndCreatedAtBetween(userId, start, end);

        List<PersonalExpenseResponseDto> result = new ArrayList<>();

        for (PersonalExpense e : expenses) {
            result.add(new PersonalExpenseResponseDto(
                    e.getDescription(),
                    e.getAmount(),
                    e.getCategory(),
                    e.getCreatedAt()
            ));
        }
        return result;
    }

    public String setBudget(MonthlyBudgetRequestDto request) {

        userRepository.findById(request.getUserId())
                .orElseThrow(() -> new DataNotFoundException("User not found"));

        MonthlyBudget budget = monthlyBudgetRepository
                .findByUserIdAndYearAndMonth(
                        request.getUserId(),
                        request.getYear(),
                        request.getMonth()
                )
                .orElse(new MonthlyBudget());

        budget.setUserId(request.getUserId());
        budget.setMonthlyLimit(request.getLimit());
        budget.setYear(request.getYear());
        budget.setMonth(request.getMonth());

        monthlyBudgetRepository.save(budget);

        return "Budget set successfully";
    }

    public MonthlyBudgetResponseDto getBudgetSummary(Long userId, int year, int month){

        MonthlyBudget budget = monthlyBudgetRepository.findByUserIdAndYearAndMonth(userId,year,month)
                .orElseThrow(()-> new DataNotFoundException("Budget is not set"));

        PersonalExpenseSummaryDto summary = getMonthlySummary(userId,year,month);

        double spent = summary.getTotalExpense();
        double remaining = budget.getMonthlyLimit() - spent;

        String status = remaining >= 0 ? "WITHIN LIMIT" : "LIMIT EXCEEDED";

        return new MonthlyBudgetResponseDto(
                budget.getMonthlyLimit(),
                spent,
                remaining,
                status
        );
    }
}
