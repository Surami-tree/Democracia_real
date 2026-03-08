package com.votapp.repository;

import com.votapp.entity.VoteRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VoteRecordRepository extends JpaRepository<VoteRecord, Long> {
    boolean existsByUserIdAndPollId(Long userId, Long pollId);
    List<VoteRecord> findByPollId(Long pollId);
    long countByPollId(Long pollId);
}
