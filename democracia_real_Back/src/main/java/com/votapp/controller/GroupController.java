package com.votapp.controller;

import com.votapp.dto.AppDtos.*;
import com.votapp.entity.GroupMember.GroupRole;
import com.votapp.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    public ResponseEntity<GroupDto> create(@Valid @RequestBody CreateGroupRequest request,
                                           @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(groupService.createGroup(request, user.getUsername()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<GroupDto>> myGroups(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(groupService.getMyGroups(user.getUsername()));
    }

    @GetMapping("/public")
    public ResponseEntity<List<GroupDto>> publicGroups() {
        return ResponseEntity.ok(groupService.getPublicGroups());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupDto> getGroup(@PathVariable Long id,
                                              @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(groupService.getGroup(id, user.getUsername()));
    }

    @PostMapping("/join/{inviteCode}")
    public ResponseEntity<GroupDto> joinByCode(@PathVariable String inviteCode,
                                                @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(groupService.joinByInviteCode(inviteCode, user.getUsername()));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<GroupDto> joinPublic(@PathVariable Long id,
                                                @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(groupService.joinPublicGroup(id, user.getUsername()));
    }

    @DeleteMapping("/{id}/leave")
    public ResponseEntity<Void> leave(@PathVariable Long id,
                                       @AuthenticationPrincipal UserDetails user) {
        groupService.leaveGroup(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<GroupMemberDto>> members(@PathVariable Long id,
                                                         @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(groupService.getMembers(id, user.getUsername()));
    }

    @PatchMapping("/{groupId}/members/{userId}/role")
    public ResponseEntity<Void> updateRole(@PathVariable Long groupId,
                                            @PathVariable Long userId,
                                            @Valid @RequestBody UpdateRoleRequest request,
                                            @AuthenticationPrincipal UserDetails user) {
        groupService.updateMemberRole(groupId, userId, request.role, user.getUsername());
        return ResponseEntity.ok().build();
    }
}
