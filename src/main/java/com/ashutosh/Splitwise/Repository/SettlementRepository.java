package com.ashutosh.Splitwise.Repository;

import com.ashutosh.Splitwise.Entity.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SettlementRepository extends JpaRepository<Settlement, Long> {

    //This allows filter ONLY UNPAID settlements;
    List<Settlement> findByGroupIdAndStatus(Long groupId, String status);
}
