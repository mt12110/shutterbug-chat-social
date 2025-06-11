
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
}

interface UserTaggerProps {
  selectedUsers: User[];
  onUsersChange: (users: User[]) => void;
  placeholder?: string;
}

const UserTagger = ({ selectedUsers, onUsersChange, placeholder = "Tag people..." }: UserTaggerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      try {
        const { data: users, error } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
          .limit(10);

        if (!error && users) {
          // Filter out already selected users
          const filteredUsers = users.filter(
            user => !selectedUsers.some(selected => selected.id === user.id)
          );
          setSearchResults(filteredUsers);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedUsers]);

  const handleSelectUser = (user: User) => {
    onUsersChange([...selectedUsers, user]);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleRemoveUser = (userId: string) => {
    onUsersChange(selectedUsers.filter(user => user.id !== userId));
  };

  return (
    <div className="space-y-2">
      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map(user => (
            <Badge key={user.id} variant="secondary" className="flex items-center gap-2 px-2 py-1">
              <Avatar className="w-4 h-4">
                {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                <AvatarFallback className="text-xs">
                  {(user.display_name || user.username || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">@{user.username || user.display_name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleRemoveUser(user.id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-10"
          />
        </div>

        {/* Search Dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg z-10 mt-1 max-h-48 overflow-y-auto">
            {isSearching ? (
              <div className="p-3 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-muted text-left"
                >
                  <Avatar className="w-8 h-8">
                    {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                    <AvatarFallback>
                      {(user.display_name || user.username || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {user.display_name || user.username}
                    </p>
                    {user.username && user.display_name && (
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-sm text-muted-foreground">
                No users found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTagger;
