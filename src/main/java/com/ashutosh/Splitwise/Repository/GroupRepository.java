package com.ashutosh.Splitwise.Repository;

import com.ashutosh.Splitwise.Entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupRepository extends JpaRepository<Group, Long> {
}
