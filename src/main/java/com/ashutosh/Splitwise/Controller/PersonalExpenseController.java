package com.ashutosh.Splitwise.Controller;

import com.ashutosh.Splitwise.Dto.*;
import com.ashutosh.Splitwise.Service.PersonalExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/personal")
@RequiredArgsConstructor
public class PersonalExpenseController {

    private final PersonalExpenseService personalExpenseService;

    @PostMapping("/add")
    public String addExpense(@RequestBody PersonalExpenseRequestDto requestDto){
        return personalExpenseService.addExpense(requestDto);
    }

    @GetMapping("/history")
    public List<PersonalExpenseResponseDto> getHistory(@RequestParam Long userId){
        return personalExpenseService.getAllExpenses(userId);
    }

    @GetMapping("/monthly")
    public PersonalExpenseSummaryDto getMonthlySummary(@RequestParam Long userId, @RequestParam int year, @RequestParam int month){
        return personalExpenseService.getMonthlySummary(userId, year, month);
    }

    @GetMapping("/date-range")
    public List<PersonalExpenseResponseDto> getByDateRange(@RequestParam Long userId, @RequestParam String startDate, @RequestParam String endDate) {

        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);

        return personalExpenseService.getExpensesByDateRange(userId, start, end);
    }

    @PostMapping("/set-budget")
    public String setBudget(@RequestBody MonthlyBudgetRequestDto requestDto){
        return personalExpenseService.setBudget(requestDto);
    }

    @GetMapping("/budget-track")
    public MonthlyBudgetResponseDto getBudgetTrack(@RequestParam Long userId, @RequestParam int year, @RequestParam int month){
        return personalExpenseService.getBudgetSummary(userId,year,month);
    }
}
