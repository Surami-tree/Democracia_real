package com.votapp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "poll_options")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PollOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poll_id", nullable = false)
    private Poll poll;

    @Column(nullable = false, length = 300)
    private String text;

    // Anonymous vote count - NOT linked to any user
    @Column(name = "vote_count", nullable = false)
    @Builder.Default
    private int voteCount = 0;

    @Column(name = "display_order")
    private int displayOrder;
}
