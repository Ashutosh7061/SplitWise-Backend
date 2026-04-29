package com.ashutosh.Splitwise.Controller;

import com.ashutosh.Splitwise.Dto.PaySettlementRequest;
import com.ashutosh.Splitwise.Dto.SettlementDto;
import com.ashutosh.Splitwise.Entity.Settlement;
import com.ashutosh.Splitwise.Service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
