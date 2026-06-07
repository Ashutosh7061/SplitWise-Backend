package com.ashutosh.Splitwise.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ashutosh.Splitwise.Entity.Settlement;
import com.ashutosh.Splitwise.Enum.SettlementStatus;

public interface SettlementRepository extends JpaRepository<Settlement, Long> {

    List<Settlement> findByGroupIdAndStatus(Long groupId, SettlementStatus status);

    List<Settlement> findByGroupId(Long groupId);

    @Modifying
    @Query("delete from Settlement s where s.groupId = :groupId and s.status = :status")
    int deleteByGroupIdAndStatus(@Param("groupId") Long groupId, @Param("status") SettlementStatus status);
}
