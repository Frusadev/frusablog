"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPicker } from "@/components/ui/user-picker";
import { UserSelector } from "@/components/ui/user-selector";
import { Loader2, Mail, Users } from "lucide-react";
import { toast } from "sonner";
import { getUsers, mailUser, sendBroadcast, searchUsers } from "@/lib/api/requests/user";
import type { DetailedUserInfo, UserMessageSendDTO, BroadcastData } from "@/lib/api/dto/user";

export default function MessagePage() {
  const [users, setUsers] = useState<DetailedUserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  // Individual message state
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [messageData, setMessageData] = useState<UserMessageSendDTO>({
    recipient_id: "",
    mail_content: "",
    mail_subject: "",
  });

  // Broadcast message state
  const [broadcastData, setBroadcastData] = useState<BroadcastData>({
    recipients_ids: "all",
    mail_content: "",
    mail_subject: "",
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sendToAll, setSendToAll] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers(0, 100); // Get more users for selection
      setUsers(response.users.filter(user => !user.banned)); // Only show active users
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageData.recipient_id || !messageData.mail_subject.trim() || !messageData.mail_content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setMessageLoading(true);
      await mailUser(messageData);
      toast.success("Message sent successfully");
      setMessageData({
        recipient_id: "",
        mail_content: "",
        mail_subject: "",
      });
      setSelectedUser("");
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setMessageLoading(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastData.mail_subject.trim() || !broadcastData.mail_content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!sendToAll && selectedUsers.length === 0) {
      toast.error("Please select at least one user or choose to send to all users");
      return;
    }

    try {
      setBroadcastLoading(true);    const dataToSend = {
      ...broadcastData,
      recipients_ids: sendToAll ? "all" : selectedUsers.join(","),
    };
      await sendBroadcast(dataToSend);
      toast.success("Broadcast message sent successfully");
      setBroadcastData({
        recipients_ids: "all",
        mail_content: "",
        mail_subject: "",
      });
      setSelectedUsers([]);
      setSendToAll(true);
    } catch (error) {
      toast.error("Failed to send broadcast message");
      console.error(error);
    } finally {
      setBroadcastLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Send Messages</h1>

      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">Individual Message</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast Message</TabsTrigger>
        </TabsList>

        {/* Individual Message Tab */}
        <TabsContent value="individual">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Send Individual Message
              </CardTitle>
              <CardDescription>
                Send a private message to a specific user.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Select User</Label>
                <UserSelector
                  users={users}
                  value={selectedUser}
                  onValueChange={(userId) => {
                    setSelectedUser(userId);
                    setMessageData({ ...messageData, recipient_id: userId });
                  }}
                  placeholder="Choose a user..."
                  className="w-full"
                  useSearch={true}
                  onSearch={searchUsers}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="individual-subject">Subject</Label>
                <Input
                  id="individual-subject"
                  placeholder="Message subject..."
                  value={messageData.mail_subject}
                  onChange={(e) =>
                    setMessageData({ ...messageData, mail_subject: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="individual-content">Message</Label>
                <Textarea
                  id="individual-content"
                  placeholder="Your message..."
                  value={messageData.mail_content}
                  onChange={(e) =>
                    setMessageData({ ...messageData, mail_content: e.target.value })
                  }
                  rows={6}
                />
              </div>

              <Button onClick={handleSendMessage} disabled={messageLoading} className="w-full">
                {messageLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Message
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Broadcast Message Tab */}
        <TabsContent value="broadcast">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Send Broadcast Message
              </CardTitle>
              <CardDescription>
                Send a message to multiple users or all users at once.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="send-to-all"
                    checked={sendToAll}
                    onCheckedChange={(checked) => setSendToAll(checked as boolean)}
                  />
                  <Label htmlFor="send-to-all">Send to all users</Label>
                </div>

                {!sendToAll && (
                  <UserPicker
                    users={users}
                    selectedUserIds={selectedUsers}
                    onSelectionChange={setSelectedUsers}
                    multiple={true}
                    title="Select Recipients"
                    description="Choose which users should receive this message"
                    placeholder="Search users by name, username, or email..."
                    maxHeight="max-h-64"
                    itemsPerPage={8}
                    useSearch={true}
                    onSearch={searchUsers}
                  />
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="broadcast-subject">Subject</Label>
                <Input
                  id="broadcast-subject"
                  placeholder="Broadcast subject..."
                  value={broadcastData.mail_subject}
                  onChange={(e) =>
                    setBroadcastData({ ...broadcastData, mail_subject: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="broadcast-content">Message</Label>
                <Textarea
                  id="broadcast-content"
                  placeholder="Your broadcast message..."
                  value={broadcastData.mail_content}
                  onChange={(e) =>
                    setBroadcastData({ ...broadcastData, mail_content: e.target.value })
                  }
                  rows={6}
                />
              </div>

              <div className="text-sm text-gray-600">
                {sendToAll 
                  ? `This message will be sent to all ${users.length} active users.`
                  : `This message will be sent to ${selectedUsers.length} selected user(s).`
                }
              </div>

              <Button onClick={handleSendBroadcast} disabled={broadcastLoading} className="w-full">
                {broadcastLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Broadcast Message
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
