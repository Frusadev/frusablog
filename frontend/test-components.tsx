import React from 'react';
import { UserPicker } from './src/components/ui/user-picker';
import { UserSelector } from './src/components/ui/user-selector';
import type { DetailedUserInfo } from './src/lib/api/dto/user';

// Test the components with sample data
const sampleUsers: DetailedUserInfo[] = [
  {
    id: '1',
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    banned: false,
    joined_at: '2024-01-01T00:00:00Z',
    last_ban_motive: null,
  },
  {
    id: '2',
    name: 'Jane Smith',
    username: 'janesmith',
    email: 'jane@example.com',
    banned: false,
    joined_at: '2024-01-02T00:00:00Z',
    last_ban_motive: null,
  },
  {
    id: '3',
    name: 'Bob Johnson',
    username: 'bobjohnson',
    email: 'bob@example.com',
    banned: false,
    joined_at: '2024-01-03T00:00:00Z',
    last_ban_motive: null,
  },
  // Add more sample users for testing...
];

function TestComponents() {
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<string>('');

  return (
    <div className="p-6 space-y-6">
      <h1>User Picker Components Test</h1>
      
      <div>
        <h2>Single User Selector with Search</h2>
        <UserSelector
          users={sampleUsers}
          value={selectedUser}
          onValueChange={setSelectedUser}
        />
      </div>

      <div>
        <h2>Multiple User Picker with Pagination</h2>
        <UserPicker
          users={sampleUsers}
          selectedUserIds={selectedUsers}
          onSelectionChange={setSelectedUsers}
          multiple={true}
        />
      </div>
    </div>
  );
}

export default TestComponents;
