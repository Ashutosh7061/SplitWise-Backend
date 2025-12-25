package com.ashutosh.Splitwise.Service;

import com.ashutosh.Splitwise.Dto.SettlementDataDto;
import com.ashutosh.Splitwise.Entity.Expense;
import com.ashutosh.Splitwise.Entity.Settlement;
import com.ashutosh.Splitwise.Entity.User;
import com.ashutosh.Splitwise.Entity.SettlementData;
import com.ashutosh.Splitwise.Repository.ExpenseRepository;
import com.ashutosh.Splitwise.Repository.SettlementRepository;
import com.ashutosh.Splitwise.Repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final SettlementRepository settlementRepository;

    public Expense addExpense(Expense expense) {
        return expenseRepository.save(expense);
    }

    // MAIN BALANCE LOGIC
    public List<SettlementDataDto> calculateBalances(Long groupId, List<Long> userIds) {

        List<Expense> expenses = expenseRepository.findByGroupId(groupId);
        Map<Long, Double> netBalance = new HashMap<>();

        Map<Long, String> userNameMap = getUserNameMap(userIds);

        for (Long userId : userIds) {
            netBalance.put(userId, 0.0);
        }

        for (Expense expense : expenses) {
            if ("EQUAL".equalsIgnoreCase(expense.getSplitType())) {
                equalSplit(expense, userIds, netBalance);
            }
            if ("EXACT".equalsIgnoreCase(expense.getSplitType())) {
                exactSplit(expense, netBalance);
            }
            if ("PERCENTAGE".equalsIgnoreCase(expense.getSplitType())) {
                percentageSplit(expense, netBalance);
            }
        }
        return simplifyBalances(netBalance, userNameMap, groupId);
    }


    // -------- SPLIT METHODS --------
            // ======== METHOD 1 - EQUALSPLIT==========
    private void equalSplit(Expense expense, List<Long> userIds, Map<Long, Double> balance) {
        double splitAmount = expense.getAmount() / userIds.size();

        for (Long userId : userIds) {
            balance.put(userId, balance.get(userId) - splitAmount);
        }
        balance.put(
                expense.getPaidByUserId(),
                balance.get(expense.getPaidByUserId()) + expense.getAmount()
        );
    }


        // =========== METHOD 2 - EXACTSPLIT ===============
    private void exactSplit(Expense expense, Map<Long, Double> balance) {
        Map<Long, Double> splitMap = parseMap(expense.getSplitDetails());

        for (Map.Entry<Long, Double> entry : splitMap.entrySet()) {
            balance.put(
                    entry.getKey(),
                    balance.get(entry.getKey()) - entry.getValue()
            );
        }
        balance.put(
                expense.getPaidByUserId(),
                balance.get(expense.getPaidByUserId()) + expense.getAmount()
        );
    }


        // ========== METHOD 3 - PERCENTAGESPLIT ==============
    private void percentageSplit(Expense expense, Map<Long, Double> balance) {
        Map<Long, Double> percentMap = parseMap(expense.getSplitDetails());

        for (Map.Entry<Long, Double> entry : percentMap.entrySet()) {
            double share = (entry.getValue() / 100.0) * expense.getAmount();
            balance.put(
                    entry.getKey(),
                    balance.get(entry.getKey()) - share
            );
        }
        balance.put(
                expense.getPaidByUserId(),
                balance.get(expense.getPaidByUserId()) + expense.getAmount()
        );
    }




    // -------- SIMPLIFY BALANCES --------
    private List<SettlementDataDto> simplifyBalances(
            Map<Long, Double> netBalance,
            Map<Long, String> userNameMap,
            Long groupId
    ) {

        List<Long> creditors = new ArrayList<>();
        List<Long> debtors = new ArrayList<>();

        // Step 1: Separate creditors and debtors
        for (Map.Entry<Long, Double> entry : netBalance.entrySet()) {
            if (entry.getValue() > 0) {
                creditors.add(entry.getKey());
            }
            if (entry.getValue() < 0) {
                debtors.add(entry.getKey());
            }
        }
        List<SettlementDataDto> settlements = new ArrayList<>();

        int i = 0, j = 0;
        // Step 2: Match debtors with creditors
        while (i < debtors.size() && j < creditors.size()) {

            Long debtor = debtors.get(i);
            Long creditor = creditors.get(j);

            double owe = Math.min(
                    -netBalance.get(debtor),
                    netBalance.get(creditor)
            );
            // Step 3: SAVE settlement in DB (UNPAID)
            Settlement settlement = new Settlement();
            settlement.setFromUserId(debtor);
            settlement.setToUserId(creditor);
            settlement.setAmount(owe);
            settlement.setStatus("UNPAID");
            settlement.setGroupId(groupId);

            settlementRepository.save(settlement);
            // Step 4: ADD response DTO (for API output)
            settlements.add(
                    new SettlementDataDto(
                            userNameMap.get(debtor),
                            userNameMap.get(creditor),
                            owe
                    )
            );
            // Step 5: Update balances
            netBalance.put(debtor, netBalance.get(debtor) + owe);
            netBalance.put(creditor, netBalance.get(creditor) - owe);

            if (netBalance.get(debtor) == 0) {
                i++;
            }
            if (netBalance.get(creditor) == 0) {
                j++;
            }
        }
        return settlements;
    }



    // -------- SIMPLE PARSER --------
                  // Input: {"2":1200,"3":1800}
    private Map<Long, Double> parseMap(String text) {

        Map<Long, Double> map = new HashMap<>();

        if (text == null || text.isEmpty()) {
            return map;
        }

        text = text.replace("{", "")
                .replace("}", "")
                .replace("\"", "");
        String[] pairs = text.split(",");

        for (String pair : pairs) {
            String[] kv = pair.split(":");
            map.put(Long.parseLong(kv[0]), Double.parseDouble(kv[1]));
        }
        return map;
    }

    // ------- CREATE A METHOD TO MAP USER to NAME --------

    private Map<Long, String> getUserNameMap(List<Long> userIds) {

        Map<Long, String> map = new HashMap<>();
        List<com.ashutosh.Splitwise.Entity.User> users = userRepository.findAllById(userIds);

        for (User user : users) {
            map.put(user.getId(), user.getName());
        }
        return map;
    }

}
