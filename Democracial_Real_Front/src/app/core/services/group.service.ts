import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group, GroupMember } from '../models/models';

const API = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class GroupService {
  constructor(private http: HttpClient) {}

  createGroup(data: { name: string; description?: string; isPublic?: boolean }): Observable<Group> {
    return this.http.post<Group>(`${API}/groups`, data);
  }

  getMyGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${API}/groups/my`);
  }

  getPublicGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${API}/groups/public`);
  }

  getGroup(id: number): Observable<Group> {
    return this.http.get<Group>(`${API}/groups/${id}`);
  }

  joinByInviteCode(code: string): Observable<Group> {
    return this.http.post<Group>(`${API}/groups/join/${code}`, {});
  }

  joinPublicGroup(id: number): Observable<Group> {
    return this.http.post<Group>(`${API}/groups/${id}/join`, {});
  }

  leaveGroup(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/groups/${id}/leave`);
  }

  getMembers(groupId: number): Observable<GroupMember[]> {
    return this.http.get<GroupMember[]>(`${API}/groups/${groupId}/members`);
  }

  updateMemberRole(groupId: number, userId: number, role: 'ADMIN' | 'MEMBER'): Observable<void> {
    return this.http.patch<void>(`${API}/groups/${groupId}/members/${userId}/role`, { role });
  }
}
