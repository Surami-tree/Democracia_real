package com.votapp.controller;

import com.votapp.dto.AppDtos.*;
import com.votapp.service.PollService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PollController {

    private final PollService pollService;

    @PostMapping("/groups/{groupId}/polls")
    public ResponseEntity<PollDto> createPoll(@PathVariable Long groupId,
                                               @Valid @RequestBody CreatePollRequest request,
                                               @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(pollService.createPoll(groupId, request, user.getUsername()));
    }

    @GetMapping("/groups/{groupId}/polls")
    public ResponseEntity<List<PollDto>> getPollsByGroup(@PathVariable Long groupId,
                                                          @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(pollService.getPollsByGroup(groupId, user.getUsername()));
    }

    @GetMapping("/polls/{pollId}")
    public ResponseEntity<PollDto> getPoll(@PathVariable Long pollId,
                                            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(pollService.getPoll(pollId, user.getUsername()));
    }

    @PostMapping("/polls/{pollId}/vote")
    public ResponseEntity<PollDto> vote(@PathVariable Long pollId,
                                         @Valid @RequestBody CastVoteRequest request,
                                         @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(pollService.castVote(pollId, request, user.getUsername()));
    }

    @PatchMapping("/polls/{pollId}/close")
    public ResponseEntity<PollDto> closePoll(@PathVariable Long pollId,
                                              @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(pollService.closePoll(pollId, user.getUsername()));
    }

    // Admin: see who voted (NOT what they voted)
    @GetMapping("/polls/{pollId}/voters")
    public ResponseEntity<List<VoterDto>> getVoters(@PathVariable Long pollId,
                                                     @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(pollService.getVoters(pollId, user.getUsername()));
    }
}
