import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContestantWithBio, ContestantGroup } from '@/types/admin';
import { Pencil, Save, X, Trash2, Eye, Camera } from 'lucide-react';
// Remove useEvictedContestants - using contestant.isActive prop

interface ContestantCardProps {
  contestant: ContestantWithBio;
  groups: ContestantGroup[];
  isEditing: boolean;
  editForm: Partial<ContestantWithBio>;
  onEdit: (contestant: ContestantWithBio) => void;
  onSave: () => void;
  onCancel: () => void;
  onFormChange: (updates: Partial<ContestantWithBio>) => void;
  onDelete: (id: string) => void;
  onView?: (contestant: ContestantWithBio) => void;
}

export const ContestantCard: React.FC<ContestantCardProps> = ({
  contestant,
  groups,
  isEditing,
  editForm,
  onEdit,
  onSave,
  onCancel,
  onFormChange,
  onDelete,
  onView,
}) => {
  // Using contestant.isActive prop instead of separate evicted hook
  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`name-${contestant.id}`}>Name</Label>
                <Input
                  id={`name-${contestant.id}`}
                  value={editForm.name || ''}
                  onChange={(e) => onFormChange({ name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor={`group-${contestant.id}`}>Group Assignment</Label>
                <Select 
                  value={editForm.group_id || 'unassigned'} 
                  onValueChange={(value) => onFormChange({ group_id: value === 'unassigned' ? null : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">No Group</SelectItem>
                    {groups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.group_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`age-${contestant.id}`}>Age</Label>
                <Input
                  id={`age-${contestant.id}`}
                  type="number"
                  value={editForm.age || ''}
                  onChange={(e) => onFormChange({ age: parseInt(e.target.value) || null })}
                  placeholder="Age"
                />
              </div>
              <div>
                <Label htmlFor={`hometown-${contestant.id}`}>Hometown</Label>
                <Input
                  id={`hometown-${contestant.id}`}
                  value={editForm.hometown || ''}
                  onChange={(e) => onFormChange({ hometown: e.target.value })}
                  placeholder="Hometown"
                />
              </div>
              <div>
                <Label htmlFor={`occupation-${contestant.id}`}>Occupation</Label>
                <Input
                  id={`occupation-${contestant.id}`}
                  value={editForm.occupation || ''}
                  onChange={(e) => onFormChange({ occupation: e.target.value })}
                  placeholder="Occupation"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor={`photo-${contestant.id}`}>Photo URL</Label>
              <Input
                id={`photo-${contestant.id}`}
                value={editForm.photo_url || ''}
                onChange={(e) => onFormChange({ photo_url: e.target.value })}
                placeholder="Photo URL"
              />
            </div>

            <div>
              <Label htmlFor={`bio-${contestant.id}`}>Bio</Label>
              <Textarea
                id={`bio-${contestant.id}`}
                value={editForm.bio || ''}
                onChange={(e) => onFormChange({ bio: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={true}
                  disabled
                />
                <Label>Active (Always)</Label>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={onSave}>
                  <Save className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={onCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="relative">
              {contestant.photo_url ? (
                <img 
                  src={contestant.photo_url} 
                  alt={contestant.name}
                  className="w-16 h-16 rounded-full object-cover object-top border-2 border-border"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div>
              <h3 className={`font-semibold text-lg ${!contestant.isActive ? 'text-red-600' : 'text-primary'}`}>
                {contestant.name}
                {!contestant.isActive && <span className="text-red-500 text-sm ml-1">(Evicted)</span>}
              </h3>
              <p className="text-sm text-muted-foreground mb-1">
                {contestant.isActive ? 'Active' : 'Evicted'} • Order: {contestant.sort_order}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Group: {groups.find(g => g.id === contestant.group_id)?.group_name || 'Unassigned'}
              </p>
              {(contestant.age || contestant.hometown || contestant.occupation) && (
                <p className="text-sm text-gray-600 mb-2">
                  {contestant.age && `${contestant.age} years old`}
                  {contestant.age && (contestant.hometown || contestant.occupation) && ' • '}
                  {contestant.hometown}
                  {contestant.hometown && contestant.occupation && ' • '}
                  {contestant.occupation}
                </p>
              )}
              {contestant.bio && (
                <p className="text-sm text-gray-600 max-w-md">{contestant.bio}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {onView && (
              <Button size="sm" variant="outline" onClick={() => onView(contestant)}>
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => onEdit(contestant)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onDelete(contestant.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};