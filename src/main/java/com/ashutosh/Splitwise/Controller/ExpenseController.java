package com.ashutosh.Splitwise.Controller;


import com.ashutosh.Splitwise.Dto.SettlementDataDto;
import com.ashutosh.Splitwise.Entity.Expense;
import com.ashutosh.Splitwise.Service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public Expense addExpense(@RequestBody Expense expense){
        return expenseService.addExpense(expense);
    }

    @PostMapping("/balances/{groupId}")
    public List<SettlementDataDto> getBalances(
            @PathVariable Long groupId,
            @RequestBody List<Long> userIds
    ) {
        return expenseService.calculateBalances(groupId, userIds);
    }

}
