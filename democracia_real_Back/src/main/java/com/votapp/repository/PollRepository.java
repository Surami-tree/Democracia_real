package com.votapp.repository;

import com.votapp.entity.Poll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PollRepository extends JpaRepository<Poll, Long> {
    List<Poll> findByGroupIdOrderByCreatedAtDesc(Long groupId);
    List<Poll> findByGroupIdAndStatus(Long groupId, Poll.PollStatus status);
}
