import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContestantWithBio, ContestantGroup } from '@/types/admin';

interface ContestantFormProps {
  editForm: Partial<ContestantWithBio>;
  groups: ContestantGroup[];
  onFormChange: (updates: Partial<ContestantWithBio>) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export const ContestantForm: React.FC<ContestantFormProps> = ({
  editForm,
  groups,
  onFormChange,
  onSave,
  onCancel,
  isEditing = false,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Contestant' : 'Add New Contestant'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={editForm.name || ''}
              onChange={(e) => onFormChange({ name: e.target.value })}
              placeholder="Contestant name"
            />
          </div>
          <div>
            <Label htmlFor="group_assignment">Group Assignment</Label>
            <Select 
              value={editForm.group_id || ''} 
              onValueChange={(value) => onFormChange({ group_id: value || null })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Group</SelectItem>
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
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={editForm.age || ''}
              onChange={(e) => onFormChange({ age: parseInt(e.target.value) || null })}
              placeholder="Age"
            />
          </div>
          <div>
            <Label htmlFor="hometown">Hometown</Label>
            <Input
              id="hometown"
              value={editForm.hometown || ''}
              onChange={(e) => onFormChange({ hometown: e.target.value })}
              placeholder="Hometown"
            />
          </div>
          <div>
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              value={editForm.occupation || ''}
              onChange={(e) => onFormChange({ occupation: e.target.value })}
              placeholder="Occupation"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="photo_url">Photo URL</Label>
          <Input
            id="photo_url"
            value={editForm.photo_url || ''}
            onChange={(e) => onFormChange({ photo_url: e.target.value })}
            placeholder="Photo URL"
          />
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={editForm.bio || ''}
            onChange={(e) => onFormChange({ bio: e.target.value })}
            placeholder="Contestant bio"
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={editForm.isActive ?? true}
            onCheckedChange={(checked) => onFormChange({ isActive: checked })}
          />
          <Label>Active</Label>
        </div>

        <div className="flex gap-2">
          <Button onClick={onSave}>
            {isEditing ? 'Update Contestant' : 'Add Contestant'}
          </Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
};