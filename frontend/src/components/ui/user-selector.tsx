"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, X, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchUsers } from "@/lib/api/requests/user";
import type { DetailedUserInfo } from "@/lib/api/dto/user";

interface UserSelectorProps {
  users?: DetailedUserInfo[];
  value?: string;
  onValueChange?: (userId: string) => void;
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  useSearch?: boolean; // Enable API search instead of client-side filtering
  onSearch?: (
    query: string,
    skip: number,
    limit: number,
  ) => Promise<DetailedUserInfo[]>;
}

export function UserSelector({
  users = [],
  value,
  onValueChange,
  placeholder = "Select user...",
  emptyText = "No users found.",
  disabled = false,
  className,
  useSearch = false,
  onSearch,
}: UserSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DetailedUserInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDebounceTimeout, setSearchDebounceTimeout] =
    useState<NodeJS.Timeout | null>(null);

  const selectedUser = useMemo(() => {
    const allUsers = useSearch ? [...users, ...searchResults] : users;
    return allUsers.find((user) => user.id === value);
  }, [users, searchResults, value, useSearch]);

  // Use search results when using API search, otherwise use provided users with filtering
  const displayUsers = useMemo(() => {
    if (useSearch) {
      return searchQuery.trim() ? searchResults : users.slice(0, 20); // Show limited users when no search
    }

    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query),
    );
  }, [users, searchResults, searchQuery, useSearch]);

  // API search with debouncing
  const performSearch = useCallback(
    async (query: string) => {
      if (!useSearch || !query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const searchFunction = onSearch || searchUsers;
        const results = await searchFunction(query, 0, 50); // Get more results for dropdown
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [useSearch, onSearch],
  );

  // Handle search input changes with debouncing
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);

    if (searchDebounceTimeout) {
      clearTimeout(searchDebounceTimeout);
    }

    if (useSearch) {
      const timeout = setTimeout(() => {
        performSearch(query);
      }, 300); // 300ms debounce
      setSearchDebounceTimeout(timeout);
    }
  };

  // Clear search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceTimeout) {
        clearTimeout(searchDebounceTimeout);
      }
    };
  }, [searchDebounceTimeout]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSelect = (userId: string) => {
    onValueChange?.(userId);
    setOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange?.("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn("justify-between", className)}
          disabled={disabled}
        >
          {selectedUser ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs">
                  {getInitials(selectedUser.name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{selectedUser.name}</span>
              <Badge variant="outline" className="text-xs">
                @{selectedUser.username}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-auto"
                onClick={handleClear}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <>
              <span className="text-muted-foreground">{placeholder}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
            )}
          </div>

          {/* User List */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {displayUsers.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                {isSearching ? "Searching..." : emptyText}
              </div>
            ) : (
              displayUsers.map((user) => (
                <div
                  key={user.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    value === user.id
                      ? "bg-primary/10 border-primary"
                      : "bg-card hover:bg-muted/50",
                  )}
                  onClick={() => handleSelect(user.id)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {user.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        @{user.username}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>

                  {value === user.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
