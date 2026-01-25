package com.ashutosh.Splitwise.Service;

import com.ashutosh.Splitwise.Dto.GroupSummaryDto;
import com.ashutosh.Splitwise.Dto.SettlementSummaryDto;
import com.ashutosh.Splitwise.Dto.UserExpenseSummaryDto;
import com.ashutosh.Splitwise.Entity.Expense;
import com.ashutosh.Splitwise.Entity.Group;
import com.ashutosh.Splitwise.Entity.Settlement;
import com.ashutosh.Splitwise.Entity.User;
import com.ashutosh.Splitwise.Repository.ExpenseRepository;
import com.ashutosh.Splitwise.Repository.GroupRepository;
import com.ashutosh.Splitwise.Repository.SettlementRepository;
import com.ashutosh.Splitwise.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

import static java.lang.Long.sum;

@Service
@RequiredArgsConstructor
public class GroupSummaryService {

    private final GroupRepository groupRepository;
    private final ExpenseRepository expenseRepository;
    private final SettlementRepository settlementRepository;
    private final UserRepository userRepository;
    private final ExpenseService expenseService;


    public GroupSummaryDto getGroupSummary(Long groupId){
        Group group = groupRepository.findById(groupId)
                .orElseThrow(()-> new RuntimeException("Group not found"));

        List<Expense> expenses = expenseRepository.findByGroupId(groupId);
        List<Settlement> settlements = settlementRepository.findByGroupId(groupId);

        // Calculating total expense
        double totalExpense = expenses.stream()
                .mapToDouble(Expense::getAmount)
                 .sum();

        //Amount Paid by each User
        Map<Long, Double> totalPaid = new HashMap<>();
        for(Expense expense :expenses){
            totalPaid.merge(
                    expense.getPaidByUserId(),
                    expense.getAmount(),
                    Double::sum
            );
        }

        // Fetch ALL group users
        List<Expense> expenses1  =  expenseRepository.findByGroupId(groupId);

        Set<Long> userIdSet = new HashSet<>();

        for (Expense expense : expenses) {
            // add payer
            userIdSet.add(expense.getPaidByUserId());
            // add users from splitDetails
            if (expense.getSplitDetails() != null && !expense.getSplitDetails().isBlank()) {

                String cleaned = expense.getSplitDetails()
                        .replace("{", "")
                        .replace("}", "");
                String[] entries = cleaned.split(",");

                for (String entry : entries) {
                    String userIdStr = entry.split(":")[0]
                            .replace("\"", "")
                            .trim();
                    userIdSet.add(Long.parseLong(userIdStr));
                }
            }
        }

        List<Long> userIds = new ArrayList<>(userIdSet);
        // Calculate net balance correctly
        Map<Long, Double> netBalance = expenseService.calculateNetBalanceMap(groupId, userIds);

        System.out.println("NET BALANCE FROM CALCULATION: " + netBalance);

        // Build User Summaries
        List<UserExpenseSummaryDto> userSummaries = new ArrayList<>();

        for(Map.Entry<Long, Double> entry :netBalance.entrySet()){
            Long userId =entry.getKey();
            User user =userRepository.findById(userId).orElseThrow();

            userSummaries.add(
                    new UserExpenseSummaryDto(
                            user.getName(),
                            totalPaid.getOrDefault(userId, 0.0),
                            entry.getValue()
                    )
            );
        }

        // Settlement Summary
        int total = settlements.size();
        int paid = (int)settlements.stream()
                .filter(s -> "PAID".equals(s.getStatus()))
                .count();

        int unPaid = total - paid;
        SettlementSummaryDto settlementSummary = new SettlementSummaryDto(total, paid, unPaid);

        return new GroupSummaryDto(
                group.getId(),
                group.getName(),
                totalExpense,
                userSummaries,
                settlementSummary
        );
    }
}
