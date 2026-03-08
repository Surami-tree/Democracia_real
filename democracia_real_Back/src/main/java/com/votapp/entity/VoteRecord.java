package com.votapp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * ANONYMITY KEY: This table only records THAT a user voted in a poll,
 * NOT which option they chose. The actual vote counts are stored in
 * poll_options.vote_count with NO user reference.
 *
 * Admin can see: who voted (via this table)
 * Admin CANNOT see: what each user voted (impossible by design)
 */
@Entity
@Table(name = "vote_records",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "poll_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VoteRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poll_id", nullable = false)
    private Poll poll;

    @CreationTimestamp
    @Column(name = "voted_at", updatable = false)
    private LocalDateTime votedAt;
}
