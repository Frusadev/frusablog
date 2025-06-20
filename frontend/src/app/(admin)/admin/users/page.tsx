"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserX, Mail, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import {
  getUsers,
  banUser,
  deleteUser,
  mailUser,
} from "@/lib/api/requests/user";
import type { DetailedUserInfo, UserMessageSendDTO } from "@/lib/api/dto/user";
import { format } from "date-fns";

export default function UsersPage() {
  const [users, setUsers] = useState<DetailedUserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<DetailedUserInfo[]>([]);

  // Ban user state
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [banMotive, setBanMotive] = useState("");
  const [banLoading, setBanLoading] = useState(false);

  // Message user state
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageData, setMessageData] = useState<UserMessageSendDTO>({
    recipient_id: "",
    mail_content: "",
    mail_subject: "",
  });
  const [messageLoading, setMessageLoading] = useState(false);

  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const skip = (currentPage - 1) * usersPerPage;
      const response = await getUsers(skip, usersPerPage);
      setUsers(response.users);
      setTotalUsers(response.length);
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!selectedUserId || banMotive.length < 100) {
      toast.error("Ban motive must be at least 100 characters long");
      return;
    }

    try {
      setBanLoading(true);
      await banUser(selectedUserId, banMotive);
      toast.success("User banned successfully");
      setBanDialogOpen(false);
      setBanMotive("");
      setSelectedUserId(null);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to ban user");
      console.error(error);
    } finally {
      setBanLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (
      !confirm(
        `Are you sure you want to delete user "${username}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await deleteUser(userId);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
      console.error(error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageData.mail_subject.trim() || !messageData.mail_content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setMessageLoading(true);
      await mailUser(messageData);
      toast.success("Message sent successfully");
      setMessageDialogOpen(false);
      setMessageData({
        recipient_id: "",
        mail_content: "",
        mail_subject: "",
      });
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setMessageLoading(false);
    }
  };

  const openMessageDialog = (user: DetailedUserInfo) => {
    setMessageData({
      recipient_id: user.id,
      mail_content: "",
      mail_subject: "",
    });
    setMessageDialogOpen(true);
  };

  const openBanDialog = (userId: string) => {
    setSelectedUserId(userId);
    setBanDialogOpen(true);
  };

  const totalPages = Math.ceil(totalUsers / usersPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {format(new Date(user.joined_at), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  {user.banned ? (
                    <Badge variant="destructive">Banned</Badge>
                  ) : (
                    <Badge variant="default">Active</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {!user.banned && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openBanDialog(user.id)}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openMessageDialog(user)}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id, user.username)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <p className="text-sm text-gray-700">
          Showing {filteredUsers.length} of {totalUsers} users
        </p>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Ban User Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Provide a detailed reason for banning this user. This action will
              notify the user via email.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="banMotive">
                Reason for Ban (minimum 100 characters)
              </Label>
              <Textarea
                id="banMotive"
                placeholder="Provide a detailed explanation for the ban..."
                value={banMotive}
                onChange={(e) => setBanMotive(e.target.value)}
                rows={4}
              />
              <p className="text-sm text-gray-500">
                {banMotive.length}/100 characters minimum
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBanUser}
              disabled={banLoading || banMotive.length < 100}
            >
              {banLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message User Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>
              Send a message to this user via email.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Message subject..."
                value={messageData.mail_subject}
                onChange={(e) =>
                  setMessageData({
                    ...messageData,
                    mail_subject: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Message</Label>
              <Textarea
                id="content"
                placeholder="Your message..."
                value={messageData.mail_content}
                onChange={(e) =>
                  setMessageData({
                    ...messageData,
                    mail_content: e.target.value,
                  })
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMessageDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={messageLoading}>
              {messageLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
