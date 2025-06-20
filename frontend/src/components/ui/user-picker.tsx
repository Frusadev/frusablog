"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, X, ChevronLeft, ChevronRight, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchUsers } from "@/lib/api/requests/user";
import type { DetailedUserInfo } from "@/lib/api/dto/user";

interface UserPickerProps {
  users?: DetailedUserInfo[];
  loading?: boolean;
  selectedUserIds?: string[];
  onSelectionChange?: (userIds: string[]) => void;
  multiple?: boolean;
  title?: string;
  description?: string;
  placeholder?: string;
  maxHeight?: string;
  showAvatar?: boolean;
  showEmail?: boolean;
  itemsPerPage?: number;
  className?: string;
  useSearch?: boolean; // Enable API search instead of client-side filtering
  onSearch?: (query: string, skip: number, limit: number) => Promise<DetailedUserInfo[]>;
}

export function UserPicker({
  users = [],
  loading = false,
  selectedUserIds = [],
  onSelectionChange,
  multiple = false,
  title = "Select Users",
  description,
  placeholder = "Search users by name, username, or email...",
  maxHeight = "max-h-96",
  showAvatar = true,
  showEmail = true,
  itemsPerPage = 10,
  className,
  useSearch = false,
  onSearch,
}: UserPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchResults, setSearchResults] = useState<DetailedUserInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDebounceTimeout, setSearchDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  // Use search results when using API search, otherwise use provided users
  const displayUsers = useSearch ? searchResults : users;

  // Filter users based on search query (client-side filtering)
  const filteredUsers = useMemo(() => {
    if (useSearch) return displayUsers; // API search already filters
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery, useSearch, displayUsers]);

  // Paginate filtered users (only for client-side filtering)
  const paginatedUsers = useMemo(() => {
    if (useSearch) return displayUsers; // API search handles pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage, useSearch, displayUsers]);

  const totalPages = useSearch ? 1 : Math.ceil(filteredUsers.length / itemsPerPage);

  // API search with debouncing
  const performSearch = useCallback(async (query: string, page: number = 1) => {
    if (!useSearch || !query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const searchFunction = onSearch || searchUsers;
      const skip = (page - 1) * itemsPerPage;
      const results = await searchFunction(query, skip, itemsPerPage);
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [useSearch, onSearch, itemsPerPage]);

  // Handle search input changes with debouncing
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);

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

  // Reset page when search changes (client-side filtering)
  useEffect(() => {
    if (!useSearch) {
      setCurrentPage(1);
    }
  }, [searchQuery, useSearch]);

  // Clear search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceTimeout) {
        clearTimeout(searchDebounceTimeout);
      }
    };
  }, [searchDebounceTimeout]);

  const handleUserToggle = (userId: string) => {
    if (!onSelectionChange) return;

    if (multiple) {
      const newSelection = selectedUserIds.includes(userId)
        ? selectedUserIds.filter(id => id !== userId)
        : [...selectedUserIds, userId];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange(selectedUserIds.includes(userId) ? [] : [userId]);
    }
  };

  const handleSelectAll = () => {
    if (!onSelectionChange || !multiple) return;
    
    const allCurrentPageIds = paginatedUsers.map(user => user.id);
    const allSelected = allCurrentPageIds.every(id => selectedUserIds.includes(id));
    
    if (allSelected) {
      // Deselect all on current page
      const newSelection = selectedUserIds.filter(id => !allCurrentPageIds.includes(id));
      onSelectionChange(newSelection);
    } else {
      // Select all on current page
      const newSelection = [...new Set([...selectedUserIds, ...allCurrentPageIds])];
      onSelectionChange(newSelection);
    }
  };

  const clearSelection = () => {
    if (onSelectionChange) {
      onSelectionChange([]);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              {multiple ? <Users className="h-5 w-5" /> : <User className="h-5 w-5" />}
              {title}
            </CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {selectedUserIds.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedUserIds.length} selected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="h-auto p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
          {(isSearching || loading) && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
          )}
        </div>

        {/* Loading State */}
        {(loading && !isSearching) && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {/* User List */}
        {!(loading && !isSearching) && (
          <>
            {/* Select All (for multiple selection) */}
            {multiple && paginatedUsers.length > 0 && (
              <div className="flex items-center space-x-2 pb-2 border-b">
                <Checkbox
                  id="select-all-page"
                  checked={paginatedUsers.every(user => selectedUserIds.includes(user.id))}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all-page" className="text-sm font-medium">
                  Select all on this page ({paginatedUsers.length} users)
                </Label>
              </div>
            )}

            {/* User Items */}
            <div className={cn("space-y-2 overflow-y-auto", maxHeight)}>
              {paginatedUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No users found matching your search." : "No users available."}
                </div>
              ) : (
                paginatedUsers.map((user) => {
                  const isSelected = selectedUserIds.includes(user.id);
                  
                  return (
                    <div
                      key={user.id}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        isSelected 
                          ? "bg-primary/10 border-primary" 
                          : "bg-card hover:bg-muted/50"
                      )}
                      onClick={() => handleUserToggle(user.id)}
                    >
                      {multiple && (
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleUserToggle(user.id)}
                        />
                      )}
                      
                      {showAvatar && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{user.name}</p>
                          <Badge variant="outline" className="text-xs">
                            @{user.username}
                          </Badge>
                        </div>
                        {showEmail && (
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        )}
                      </div>
                      
                      {!multiple && isSelected && (
                        <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination (only for client-side filtering) */}
            {!useSearch && totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages} ({filteredUsers.length} users)
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
