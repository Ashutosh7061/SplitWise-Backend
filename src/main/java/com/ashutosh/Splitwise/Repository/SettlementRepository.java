package com.ashutosh.Splitwise.Repository;

import com.ashutosh.Splitwise.Entity.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SettlementRepository extends JpaRepository<Settlement, Long> {

    //This allows filter ONLY UNPAID settlements;
    List<Settlement> findByGroupIdAndStatus(Long groupId, String status);

    List<Settlement> findByGroupId(Long groupId);

    @Modifying
    @Query("delete from Settlement s where s.groupId = :groupId and s.status = :status")
    int deleteByGroupIdAndStatus(@Param("groupId") Long groupId, @Param("status") String status);
}
