package com.votapp.repository;

import com.votapp.entity.GroupMember;
import com.votapp.entity.GroupMember.GroupRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    Optional<GroupMember> findByUserIdAndGroupId(Long userId, Long groupId);
    boolean existsByUserIdAndGroupId(Long userId, Long groupId);
    List<GroupMember> findByGroupId(Long groupId);
    List<GroupMember> findByGroupIdAndRole(Long groupId, GroupRole role);
    void deleteByUserIdAndGroupId(Long userId, Long groupId);
}
