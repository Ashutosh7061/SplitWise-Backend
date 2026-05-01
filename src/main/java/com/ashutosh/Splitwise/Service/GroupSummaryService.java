package com.ashutosh.Splitwise.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.ashutosh.Splitwise.Dto.GroupSummaryDto;
import com.ashutosh.Splitwise.Dto.SettlementSummaryDto;
import com.ashutosh.Splitwise.Dto.TimeBasedGroupSummaryDto;
import com.ashutosh.Splitwise.Dto.UserExpenseSummaryDto;
import com.ashutosh.Splitwise.Dto.UserGroupSummaryDto;
import com.ashutosh.Splitwise.Entity.Expense;
import com.ashutosh.Splitwise.Entity.Group;
import com.ashutosh.Splitwise.Entity.GroupMembership;
import com.ashutosh.Splitwise.Entity.Settlement;
import com.ashutosh.Splitwise.Entity.User;
import com.ashutosh.Splitwise.Exception.DataNotFoundException;
import com.ashutosh.Splitwise.Exception.InvalidTypeException;
import com.ashutosh.Splitwise.Repository.ExpenseRepository;
import com.ashutosh.Splitwise.Repository.GroupMembershipRepository;
import com.ashutosh.Splitwise.Repository.GroupRepository;
import com.ashutosh.Splitwise.Repository.SettlementRepository;
import com.ashutosh.Splitwise.Repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GroupSummaryService {

    private final GroupRepository groupRepository;
    private final ExpenseRepository expenseRepository;
    private final SettlementRepository settlementRepository;
    private final UserRepository userRepository;
    private final ExpenseService expenseService;
    private final GroupMembershipRepository groupMembershipRepository;


    public GroupSummaryDto getGroupSummary(Long groupId){
        Group group = groupRepository.findById(groupId)
                .orElseThrow(()-> new RuntimeException("Group not found"));

        List<GroupMembership> memberships =
                groupMembershipRepository.findByGroupId(groupId);

        List<Expense> allExpenses = expenseRepository.findByGroupId(groupId);

        List<Expense> expenses = new ArrayList<>();

        for (Expense expense : allExpenses) {
            Long payer = expense.getPaidByUserId();

            for (GroupMembership membership : memberships) {
                if (membership.getUserId().equals(payer) && membership.getLeftAt() == null) {
                    expenses.add(expense);
                    break;
                }
            }
        }

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
//        List<Expense> expenses1  =  expenseRepository.findByGroupId(groupId);

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
                    if (entry == null || entry.isBlank() || !entry.contains(":")) {
                        continue;
                    }
                    String userIdStr = entry.split(":")[0]
                            .replace("\"", "")
                            .trim();
                    if (userIdStr.isBlank()) {
                        continue;
                    }
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

            double net = entry.getValue();
            double paid = totalPaid.getOrDefault(userId, 0.0);

            // Round to 2 decimal places to avoid floating-point precision errors
            double owes = Math.round((paid - net) * 100.0) / 100.0;
            paid = Math.round(paid * 100.0) / 100.0;
            net = Math.round(net * 100.0) / 100.0;

            userSummaries.add(
                    new UserExpenseSummaryDto(
                            user.getName(),
                            paid,
                            net,
                            owes
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

    public TimeBasedGroupSummaryDto getGroupSummaryByTime(Long groupId, String type){

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start;

        if("weekly".equalsIgnoreCase(type)){
            start = now.minusDays(7);
        }
        else if("monthly".equalsIgnoreCase(type)){
            start = now.minusDays(30);
        }
        else{
            throw new InvalidTypeException("Invalid type. Use weekly or monthly");
        }

        List<Expense> allExpenses = expenseRepository.findByGroupId(groupId);

        List<Expense> filteredExpenses = new ArrayList<>();

        for (Expense expense : allExpenses) {
            if (expense.getCreatedAt() != null &&
                    expense.getCreatedAt().isAfter(start)) {
                filteredExpenses.add(expense);
            }
        }

        GroupSummaryDto base =
                buildSummaryFromExpenses(groupId, filteredExpenses);

        return new TimeBasedGroupSummaryDto(
                base.getGroupId(),
                base.getGroupName(),
                type.toUpperCase(),
                start.toString(),
                now.toString(),
                base.getTotalExpense(),
                base.getUserSummaries()
        );
    }


    private GroupSummaryDto buildSummaryFromExpenses(Long groupId, List<Expense> expenses) {

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        List<Settlement> settlements = settlementRepository.findByGroupId(groupId);

        //  total expense
        double totalExpense = expenses.stream()
                .mapToDouble(Expense::getAmount)
                .sum();

        // total paid
        Map<Long, Double> totalPaid = new HashMap<>();
        for (Expense expense : expenses) {
            totalPaid.merge(
                    expense.getPaidByUserId(),
                    expense.getAmount(),
                    Double::sum
            );
        }

        // collect users
        Set<Long> userIdSet = new HashSet<>();

        for (Expense expense : expenses) {

            userIdSet.add(expense.getPaidByUserId());

            if (expense.getSplitDetails() != null && !expense.getSplitDetails().isBlank()) {

                String cleaned = expense.getSplitDetails()
                        .replace("{", "")
                        .replace("}", "");

                String[] entries = cleaned.split(",");

                for (String entry : entries) {
                    if (entry == null || entry.isBlank() || !entry.contains(":")) {
                        continue;
                    }
                    String userIdStr = entry.split(":")[0]
                            .replace("\"", "")
                            .trim();

                    if (userIdStr.isBlank()) {
                        continue;
                    }

                    userIdSet.add(Long.parseLong(userIdStr));
                }
            }
        }

        List<Long> userIds = new ArrayList<>(userIdSet);

        // net balance
        Map<Long, Double> netBalance =
                expenseService.calculateNetBalanceMap(groupId, userIds);

        // build DTO
        List<UserExpenseSummaryDto> userSummaries = new ArrayList<>();

        for (Map.Entry<Long, Double> entry : netBalance.entrySet()) {

            Long userId = entry.getKey();
            User user = userRepository.findById(userId).orElseThrow();

            double net = entry.getValue();
            double paid = totalPaid.getOrDefault(userId, 0.0);

            // Round to 2 decimal places to avoid floating-point precision errors
            double owes = Math.round((paid - net) * 100.0) / 100.0;
            paid = Math.round(paid * 100.0) / 100.0;
            net = Math.round(net * 100.0) / 100.0;

            userSummaries.add(
                    new UserExpenseSummaryDto(
                            user.getName(),
                            paid,
                            net,
                            owes
                    )
            );
        }

        // settlement summary
        int total = settlements.size();
        int paid = (int) settlements.stream()
                .filter(s -> "PAID".equals(s.getStatus()))
                .count();

        int unPaid = total - paid;

        SettlementSummaryDto settlementSummary =
                new SettlementSummaryDto(total, paid, unPaid);

        return new GroupSummaryDto(
                group.getId(),
                group.getName(),
                totalExpense,
                userSummaries,
                settlementSummary
        );
    }
   public UserGroupSummaryDto getUserGroupSummary(Long groupId, String emailId){

        User user = userRepository.findByEmail(emailId)
                .orElseThrow(()-> new DataNotFoundException("User not found"));

        Long userId = user.getId();

        groupRepository.findById(groupId)
               .orElseThrow(() -> new DataNotFoundException("Group not found"));

        GroupMembership membership = groupMembershipRepository
                .findByGroupIdAndUserId(groupId,user.getId())
                .orElseThrow(()->new DataNotFoundException("user not in group"));


        LocalDateTime joinedAt = membership.getJoinedAt();
        LocalDateTime leftAt = membership.getLeftAt();

        List<Expense> allExpense = expenseRepository.findByGroupId(groupId);

        List<Expense> filteredExpense = new ArrayList<>();

        for(Expense expense : allExpense){
            LocalDateTime createdAt = expense.getCreatedAt();

            if(createdAt == null){
                continue;
            }
            boolean afterJoin = !createdAt.isBefore(joinedAt);
            boolean beforeLeave = (leftAt == null) || !createdAt.isAfter(leftAt);

            if(afterJoin && beforeLeave){
                filteredExpense.add(expense);
            }
        }

       GroupSummaryDto groupSummary =
               buildSummaryFromExpenses(groupId, filteredExpense);

        //extract only this user
       UserExpenseSummaryDto userData = groupSummary.getUserSummaries()
               .stream()
               .filter(u -> u.getUserName().equals(
                       userRepository.findById(userId).orElseThrow().getName()))
               .findFirst()
               .orElseThrow(() -> new RuntimeException("User data not found"));

       return new UserGroupSummaryDto(
               groupSummary.getGroupId(),
               groupSummary.getGroupName(),
               userData.getUserName(),
               userData.getTotalPaid(),
               userData.getTotalOwes(),
               userData.getNetBalance()
       );

   }
}
