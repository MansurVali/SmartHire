package com.smarthire.repository;

import com.smarthire.entity.HrUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface HrUserRepository extends JpaRepository<HrUser, Long> {
    Optional<HrUser> findByTenantIdAndEmail(String tenantId, String email);
}
