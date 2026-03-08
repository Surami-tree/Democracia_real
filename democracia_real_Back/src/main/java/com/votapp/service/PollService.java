package com.votapp.service;

import com.votapp.dto.AppDtos.*;
import com.votapp.entity.*;
import com.votapp.entity.Poll.PollStatus;
import com.votapp.entity.Poll.PollType;
import com.votapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PollService {

    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final VoteRecordRepository voteRecordRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final GroupService groupService;

    @Transactional
    public PollDto createPoll(Long groupId, CreatePollRequest request, String username) {
        User user = getUser(username);
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        // Only admins can create polls
        groupService.requireAdmin(user.getId(), groupId);

        // YES_NO auto-generates options
        List<String> optionTexts = request.options;
        if (request.pollType == PollType.YES_NO) {
            optionTexts = List.of("Sí", "No");
        } else if (optionTexts == null || optionTexts.size() < 2) {
            throw new IllegalArgumentException("At least 2 options required");
        }

        Poll poll = Poll.builder()
                .question(request.question)
                .description(request.description)
                .pollType(request.pollType)
                .group(group)
                .createdBy(user)
                .endsAt(request.endsAt)
                .build();

        poll = pollRepository.save(poll);

        List<PollOption> options = new ArrayList<>();
        for (int i = 0; i < optionTexts.size(); i++) {
            PollOption option = PollOption.builder()
                    .poll(poll)
                    .text(optionTexts.get(i))
                    .displayOrder(i)
                    .build();
            options.add(pollOptionRepository.save(option));
        }
        poll.setOptions(options);

        return mapToDto(poll, user.getId());
    }

    public List<PollDto> getPollsByGroup(Long groupId, String username) {
        User user = getUser(username);
        groupService.requireMembership(user.getId(), groupId);
        return pollRepository.findByGroupIdOrderByCreatedAtDesc(groupId).stream()
                .map(p -> mapToDto(p, user.getId()))
                .collect(Collectors.toList());
    }

    public PollDto getPoll(Long pollId, String username) {
        User user = getUser(username);
        Poll poll = getPollOrThrow(pollId);
        groupService.requireMembership(user.getId(), poll.getGroup().getId());
        return mapToDto(poll, user.getId());
    }

    @Transactional
    public PollDto castVote(Long pollId, CastVoteRequest request, String username) {
        User user = getUser(username);
        Poll poll = getPollOrThrow(pollId);

        groupService.requireMembership(user.getId(), poll.getGroup().getId());

        if (poll.getStatus() == PollStatus.CLOSED) {
            throw new IllegalStateException("Poll is closed");
        }
        if (voteRecordRepository.existsByUserIdAndPollId(user.getId(), pollId)) {
            throw new IllegalStateException("You have already voted in this poll");
        }

        // Validate options belong to this poll
        List<Long> validOptionIds = poll.getOptions().stream()
                .map(PollOption::getId).collect(Collectors.toList());

        for (Long optionId : request.optionIds) {
            if (!validOptionIds.contains(optionId)) {
                throw new IllegalArgumentException("Invalid option: " + optionId);
            }
        }

        // For SINGLE_CHOICE and YES_NO: only 1 option allowed
        if (poll.getPollType() != PollType.MULTIPLE_CHOICE && request.optionIds.size() > 1) {
            throw new IllegalArgumentException("Only one option allowed for this poll type");
        }

        // Increment vote counts ANONYMOUSLY (no user reference)
        for (Long optionId : request.optionIds) {
            pollOptionRepository.incrementVoteCount(optionId);
        }

        // Record ONLY that this user voted (NOT what they voted)
        VoteRecord record = VoteRecord.builder()
                .user(user)
                .poll(poll)
                .build();
        voteRecordRepository.save(record);

        // Refresh poll from DB
        Poll updated = getPollOrThrow(pollId);
        return mapToDto(updated, user.getId());
    }

    @Transactional
    public PollDto closePoll(Long pollId, String username) {
        User user = getUser(username);
        Poll poll = getPollOrThrow(pollId);
        groupService.requireAdmin(user.getId(), poll.getGroup().getId());

        poll.setStatus(PollStatus.CLOSED);
        pollRepository.save(poll);
        return mapToDto(poll, user.getId());
    }

    // Admin-only: see who voted (but NOT what they voted)
    public List<VoterDto> getVoters(Long pollId, String username) {
        User user = getUser(username);
        Poll poll = getPollOrThrow(pollId);
        groupService.requireAdmin(user.getId(), poll.getGroup().getId());

        return voteRecordRepository.findByPollId(pollId).stream()
                .map(vr -> {
                    VoterDto dto = new VoterDto();
                    dto.userId = vr.getUser().getId();
                    dto.username = vr.getUser().getUsername();
                    dto.displayName = vr.getUser().getDisplayName();
                    dto.votedAt = vr.getVotedAt();
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // ===== Helpers =====

    private Poll getPollOrThrow(Long pollId) {
        return pollRepository.findById(pollId)
                .orElseThrow(() -> new IllegalArgumentException("Poll not found"));
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private PollDto mapToDto(Poll poll, Long currentUserId) {
        PollDto dto = new PollDto();
        dto.id = poll.getId();
        dto.question = poll.getQuestion();
        dto.description = poll.getDescription();
        dto.pollType = poll.getPollType();
        dto.status = poll.getStatus();
        dto.groupId = poll.getGroup().getId();
        dto.createdByUsername = poll.getCreatedBy().getUsername();
        dto.endsAt = poll.getEndsAt();
        dto.createdAt = poll.getCreatedAt();
        dto.hasVoted = voteRecordRepository.existsByUserIdAndPollId(currentUserId, poll.getId());
        dto.totalVotes = voteRecordRepository.countByPollId(poll.getId());

        long total = dto.totalVotes > 0 ? dto.totalVotes : 1;
        dto.options = poll.getOptions().stream().map(opt -> {
            PollOptionDto o = new PollOptionDto();
            o.id = opt.getId();
            o.text = opt.getText();
            o.voteCount = opt.getVoteCount();
            o.displayOrder = opt.getDisplayOrder();
            o.percentage = (dto.totalVotes > 0)
                    ? Math.round((opt.getVoteCount() * 100.0 / total) * 10.0) / 10.0
                    : 0.0;
            return o;
        }).collect(Collectors.toList());

        return dto;
    }
}
