package com.ashutosh.Splitwise.Controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ashutosh.Splitwise.Dto.PaySettlementRequest;
import com.ashutosh.Splitwise.Dto.SettlementDto;
import com.ashutosh.Splitwise.Service.SettlementService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/settlements")
public class SettlementController {

    private final SettlementService settlementService;

    @GetMapping("/{settlementId}")
    public SettlementDto viewSettlement(@PathVariable Long settlementId){
        return settlementService.getSettlementDetails(settlementId);
    }

    @PostMapping("/{settlementId}/pay")
    public String paySettlement(@PathVariable Long settlementId, @RequestBody PaySettlementRequest request){
        return settlementService.paySettlement(
                settlementId,
                request.getPaymentMethod()
        );
    }

    @GetMapping("/group/{groupId}")
    public List<SettlementDto> getSettlements(@PathVariable Long groupId) {
        return settlementService.getSettlementsForGroup(groupId);
    }
}
