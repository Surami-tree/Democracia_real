import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Poll, Voter, PollType } from '../models/models';

const API = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class PollService {
  constructor(private http: HttpClient) {}

  createPoll(groupId: number, data: {
    question: string;
    description?: string;
    pollType: PollType;
    options?: string[];
    endsAt?: string;
  }): Observable<Poll> {
    return this.http.post<Poll>(`${API}/groups/${groupId}/polls`, data);
  }

  getPollsByGroup(groupId: number): Observable<Poll[]> {
    return this.http.get<Poll[]>(`${API}/groups/${groupId}/polls`);
  }

  getPoll(pollId: number): Observable<Poll> {
    return this.http.get<Poll>(`${API}/polls/${pollId}`);
  }

  vote(pollId: number, optionIds: number[]): Observable<Poll> {
    return this.http.post<Poll>(`${API}/polls/${pollId}/vote`, { optionIds });
  }

  closePoll(pollId: number): Observable<Poll> {
    return this.http.patch<Poll>(`${API}/polls/${pollId}/close`, {});
  }

  getVoters(pollId: number): Observable<Voter[]> {
    return this.http.get<Voter[]>(`${API}/polls/${pollId}/voters`);
  }
}
