export interface Team {
  id?: string;
  name: string;
  leadUid: string;
  members: string[]; // Array of UIDs
  createdAt: any;
}

export interface TeamMemberProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  username?: string;
  role: 'lead' | 'member';
}
