
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bug, Lightbulb, MessageSquare, Calendar, User, Mail } from 'lucide-react';
import { format } from 'date-fns';

interface FeedbackItem {
  id: string;
  user_name: string | null;
  user_email: string | null;
  feedback_type: 'bug' | 'feature' | 'comment';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  admin_notes: string | null;
}

interface FeedbackStats {
  total_feedback: number;
  open_bugs: number;
  pending_features: number;
  general_comments: number;
  resolved_this_week: number;
}

export const FeedbackManagementTab: React.FC = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats>({
    total_feedback: 0,
    open_bugs: 0,
    pending_features: 0,
    general_comments: 0,
    resolved_this_week: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      const { data: feedbackData, error } = await supabase
        .from('user_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFeedback(feedbackData || []);

      // Calculate stats
      const total_feedback = feedbackData?.length || 0;
      const open_bugs = feedbackData?.filter(f => f.feedback_type === 'bug' && f.status !== 'resolved' && f.status !== 'closed').length || 0;
      const pending_features = feedbackData?.filter(f => f.feedback_type === 'feature' && f.status !== 'resolved' && f.status !== 'closed').length || 0;
      const general_comments = feedbackData?.filter(f => f.feedback_type === 'comment').length || 0;
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const resolved_this_week = feedbackData?.filter(f => 
        f.resolved_at && new Date(f.resolved_at) > weekAgo
      ).length || 0;

      setStats({
        total_feedback,
        open_bugs,
        pending_features,
        general_comments,
        resolved_this_week,
      });

    } catch (error: any) {
      console.error('Error loading feedback:', error);
      toast({
        title: "Error",
        description: "Failed to load feedback data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFeedbackStatus = async (feedbackId: string, status: string, notes: string) => {
    try {
      const updateData: any = {
        status,
        admin_notes: notes,
        updated_at: new Date().toISOString(),
      };

      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('user_feedback')
        .update(updateData)
        .eq('id', feedbackId);

      if (error) throw error;

      toast({
        title: "Feedback updated",
        description: "Feedback status and notes have been updated",
      });

      setSelectedFeedback(null);
      setAdminNotes('');
      setNewStatus('');
      loadFeedback();
    } catch (error: any) {
      console.error('Error updating feedback:', error);
      toast({
        title: "Error",
        description: "Failed to update feedback",
        variant: "destructive",
      });
    }
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'bug': return <Bug className="h-4 w-4" />;
      case 'feature': return <Lightbulb className="h-4 w-4" />;
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading feedback data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_feedback}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Bugs</CardTitle>
            <Bug className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.open_bugs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feature Requests</CardTitle>
            <Lightbulb className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending_features}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.general_comments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved This Week</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved_this_week}</div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <CardTitle>User Feedback</CardTitle>
          <CardDescription>
            Manage bug reports, feature requests, and general feedback from users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedback.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No feedback submitted yet
              </div>
            ) : (
              feedback.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getFeedbackIcon(item.feedback_type)}
                        <h3 className="font-semibold">{item.title}</h3>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.replace('_', ' ')}
                        </Badge>
                        {item.feedback_type === 'bug' && (
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {item.feedback_type}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {item.user_name && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {item.user_name}
                          </div>
                        )}
                        {item.user_email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {item.user_email}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(item.created_at), 'MMM d, yyyy')}
                        </div>
                      </div>

                      {item.admin_notes && (
                        <div className="mt-3 p-2 bg-muted rounded text-sm">
                          <strong>Admin Notes:</strong> {item.admin_notes}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFeedback(item);
                        setAdminNotes(item.admin_notes || '');
                        setNewStatus(item.status);
                      }}
                    >
                      Manage
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Management Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Manage Feedback</CardTitle>
              <CardDescription>{selectedFeedback.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  placeholder="Add notes about this feedback..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedFeedback(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => updateFeedbackStatus(selectedFeedback.id, newStatus, adminNotes)}
                  className="flex-1"
                >
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
