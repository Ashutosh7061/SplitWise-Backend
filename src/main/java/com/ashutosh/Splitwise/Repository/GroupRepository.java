package com.ashutosh.Splitwise.Repository;

import com.ashutosh.Splitwise.Entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GroupRepository extends JpaRepository<Group, Long> {

    Optional<Group> findByNameIgnoreCaseAndCreatedBy(String name, Long createdBy);
}
