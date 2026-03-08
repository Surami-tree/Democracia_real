package com.votapp.dto;

import com.votapp.entity.GroupMember.GroupRole;
import com.votapp.entity.Poll.PollStatus;
import com.votapp.entity.Poll.PollType;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

public class AppDtos {

    @Data public static class RegisterRequest {
        @NotBlank @Size(min=3, max=50) public String username;
        @NotBlank @Email public String email;
        @NotBlank @Size(min=6, max=100) public String password;
        @Size(max=100) public String displayName;
    }

    @Data public static class LoginRequest {
        @NotBlank public String username;
        @NotBlank public String password;
    }

    @Data public static class AuthResponse {
        public String token;
        public UserDto user;
    }

    @Data public static class UserDto {
        public Long id;
        public String username;
        public String email;
        public String displayName;
        public LocalDateTime createdAt;
    }

    @Data public static class CreateGroupRequest {
        @NotBlank @Size(min=3, max=100) public String name;
        @Size(max=500) public String description;
        public boolean isPublic = false;
    }

    @Data public static class GroupDto {
        public Long id;
        public String name;
        public String description;
        public String inviteCode;
        public boolean isPublic;
        public int memberCount;
        public GroupRole currentUserRole;
        public LocalDateTime createdAt;
    }

    @Data public static class GroupMemberDto {
        public Long userId;
        public String username;
        public String displayName;
        public GroupRole role;
        public LocalDateTime joinedAt;
    }

    @Data public static class CreatePollRequest {
        @NotBlank @Size(min=5, max=500) public String question;
        @Size(max=1000) public String description;
        @NotNull public PollType pollType;
        public List<@NotBlank String> options;
        public LocalDateTime endsAt;
    }

    @Data public static class PollDto {
        public Long id;
        public String question;
        public String description;
        public PollType pollType;
        public PollStatus status;
        public Long groupId;
        public String createdByUsername;
        public LocalDateTime endsAt;
        public LocalDateTime createdAt;
        public List<PollOptionDto> options;
        public long totalVotes;
        public boolean hasVoted;
    }

    @Data public static class PollOptionDto {
        public Long id;
        public String text;
        public int voteCount;
        public int displayOrder;
        public double percentage;
    }

    @Data public static class CastVoteRequest {
        @NotEmpty public List<Long> optionIds;
    }

    @Data public static class VoterDto {
        public Long userId;
        public String username;
        public String displayName;
        public LocalDateTime votedAt;
    }

    @Data public static class UpdateRoleRequest {
        @NotNull public GroupRole role;
    }
}
