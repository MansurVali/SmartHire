package com.smarthire.repository;

import com.smarthire.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByTenantId(String tenantId);
    boolean existsByTenantId(String tenantId);
}
