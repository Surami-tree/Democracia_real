package com.votapp.service;

import com.votapp.dto.AppDtos.*;
import com.votapp.entity.Group;
import com.votapp.entity.GroupMember;
import com.votapp.entity.GroupMember.GroupRole;
import com.votapp.entity.User;
import com.votapp.repository.GroupMemberRepository;
import com.votapp.repository.GroupRepository;
import com.votapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public GroupDto createGroup(CreateGroupRequest request, String username) {
        User user = getUser(username);

        String inviteCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Group group = Group.builder()
                .name(request.name)
                .description(request.description)
                .inviteCode(inviteCode)
                .isPublic(request.isPublic)
                .build();

        group = groupRepository.save(group);

        // Creator becomes ADMIN
        GroupMember member = GroupMember.builder()
                .user(user)
                .group(group)
                .role(GroupRole.ADMIN)
                .build();
        groupMemberRepository.save(member);

        return mapToDto(group, GroupRole.ADMIN);
    }

    @Transactional
    public GroupDto joinByInviteCode(String inviteCode, String username) {
        User user = getUser(username);
        Group group = groupRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new IllegalArgumentException("Invalid invite code"));

        if (groupMemberRepository.existsByUserIdAndGroupId(user.getId(), group.getId())) {
            throw new IllegalStateException("Already a member of this group");
        }

        GroupMember member = GroupMember.builder()
                .user(user)
                .group(group)
                .role(GroupRole.MEMBER)
                .build();
        groupMemberRepository.save(member);

        return mapToDto(group, GroupRole.MEMBER);
    }

    @Transactional
    public GroupDto joinPublicGroup(Long groupId, String username) {
        User user = getUser(username);
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        if (!group.isPublic()) throw new IllegalArgumentException("Group is not public");
        if (groupMemberRepository.existsByUserIdAndGroupId(user.getId(), group.getId())) {
            throw new IllegalStateException("Already a member");
        }

        GroupMember member = GroupMember.builder()
                .user(user).group(group).role(GroupRole.MEMBER).build();
        groupMemberRepository.save(member);

        return mapToDto(group, GroupRole.MEMBER);
    }

    public List<GroupDto> getMyGroups(String username) {
        User user = getUser(username);
        return groupRepository.findByMemberId(user.getId()).stream()
                .map(group -> {
                    GroupRole role = groupMemberRepository
                            .findByUserIdAndGroupId(user.getId(), group.getId())
                            .map(GroupMember::getRole)
                            .orElse(GroupRole.MEMBER);
                    return mapToDto(group, role);
                })
                .collect(Collectors.toList());
    }

    public List<GroupDto> getPublicGroups() {
        return groupRepository.findByIsPublicTrue().stream()
                .map(g -> mapToDto(g, null))
                .collect(Collectors.toList());
    }

    public GroupDto getGroup(Long groupId, String username) {
        User user = getUser(username);
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        requireMembership(user.getId(), groupId);
        GroupRole role = groupMemberRepository.findByUserIdAndGroupId(user.getId(), groupId)
                .map(GroupMember::getRole).orElse(GroupRole.MEMBER);
        return mapToDto(group, role);
    }

    public List<GroupMemberDto> getMembers(Long groupId, String username) {
        User user = getUser(username);
        requireMembership(user.getId(), groupId);
        return groupMemberRepository.findByGroupId(groupId).stream()
                .map(this::mapMemberToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateMemberRole(Long groupId, Long targetUserId, GroupRole newRole, String username) {
        User requester = getUser(username);
        requireAdmin(requester.getId(), groupId);

        GroupMember target = groupMemberRepository.findByUserIdAndGroupId(targetUserId, groupId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
        target.setRole(newRole);
        groupMemberRepository.save(target);
    }

    @Transactional
    public void leaveGroup(Long groupId, String username) {
        User user = getUser(username);
        groupMemberRepository.deleteByUserIdAndGroupId(user.getId(), groupId);
    }

    // ===== Helpers =====

    public void requireMembership(Long userId, Long groupId) {
        if (!groupMemberRepository.existsByUserIdAndGroupId(userId, groupId)) {
            throw new SecurityException("Not a member of this group");
        }
    }

    public void requireAdmin(Long userId, Long groupId) {
        GroupMember member = groupMemberRepository.findByUserIdAndGroupId(userId, groupId)
                .orElseThrow(() -> new SecurityException("Not a member of this group"));
        if (member.getRole() != GroupRole.ADMIN) {
            throw new SecurityException("Admin role required");
        }
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private GroupDto mapToDto(Group group, GroupRole role) {
        GroupDto dto = new GroupDto();
        dto.id = group.getId();
        dto.name = group.getName();
        dto.description = group.getDescription();
        dto.inviteCode = group.getInviteCode();
        dto.isPublic = group.isPublic();
        dto.memberCount = group.getMembers().size();
        dto.currentUserRole = role;
        dto.createdAt = group.getCreatedAt();
        return dto;
    }

    private GroupMemberDto mapMemberToDto(GroupMember m) {
        GroupMemberDto dto = new GroupMemberDto();
        dto.userId = m.getUser().getId();
        dto.username = m.getUser().getUsername();
        dto.displayName = m.getUser().getDisplayName();
        dto.role = m.getRole();
        dto.joinedAt = m.getJoinedAt();
        return dto;
    }
}
