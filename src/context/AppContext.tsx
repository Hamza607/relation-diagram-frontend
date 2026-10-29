import React, { createContext, useContext, useState } from 'react';
import {
  User,
  Workspace,
  WorkspaceMember,
  Project,
  ObjectDefinition,
  RelationshipDefinition,
  RecordItem,
  CommentItem,
  ActivityLog,
  ProjectVersion,
  Invitation,
  FieldDefinition,
  Cardinality,
  DeletePolicy
} from '../types/schema';
import {
  INITIAL_USERS,
  INITIAL_WORKSPACES,
  INITIAL_MEMBERS,
  INITIAL_PROJECTS,
  INITIAL_OBJECTS,
  INITIAL_RELATIONSHIPS,
  INITIAL_RECORDS,
  INITIAL_COMMENTS,
  INITIAL_ACTIVITY,
  INITIAL_VERSIONS,
  INITIAL_INVITATIONS
} from '../mockData/initialData';
import { calculateAutoLayout } from '../utils/autoLayout';
import { calculateObjectDeleteImpact, DeleteImpact } from '../utils/validation';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface AppContextType {
  // Auth & Roles
  currentUser: User;
  allUsers: User[];
  setCurrentUser: (user: User) => void;
  canEdit: boolean;
  canPublish: boolean;
  canManageMembers: boolean;

  // Workspace & Project
  currentWorkspace: Workspace;
  allWorkspaces: Workspace[];
  setCurrentWorkspace: (ws: Workspace) => void;
  currentProject: Project;
  allProjects: Project[];
  setCurrentProject: (proj: Project) => void;
  members: WorkspaceMember[];
  invitations: Invitation[];
  updateWorkspaceBranding: (branding: Partial<Workspace['branding']>) => void;
  inviteCollaborator: (email: string, role: User['role']) => void;
  revokeInvitation: (id: string) => void;

  // Object Designer
  objects: ObjectDefinition[];
  selectedObjectId: string | null;
  setSelectedObjectId: (id: string | null) => void;
  createObject: (data: Partial<ObjectDefinition>) => void;
  updateObject: (id: string, data: Partial<ObjectDefinition>, expectedRevision?: number) => boolean;
  deleteObject: (id: string, force?: boolean) => boolean;
  updateNodePosition: (id: string, pos: { x: number; y: number }) => void;
  applyAutoLayout: () => void;

  // Field Designer
  addField: (objectId: string, field: Omit<FieldDefinition, 'id'>) => void;
  updateField: (objectId: string, fieldId: string, updates: Partial<FieldDefinition>) => void;
  deleteField: (objectId: string, fieldId: string) => void;
  reorderFields: (objectId: string, fieldId: string, direction: 'up' | 'down') => void;

  // Relationship Designer
  relationships: RelationshipDefinition[];
  selectedRelationshipId: string | null;
  setSelectedRelationshipId: (id: string | null) => void;
  createRelationship: (
    fromObjectId: string,
    toObjectId: string,
    cardinality: Cardinality,
    label: string,
    deletePolicy: DeletePolicy
  ) => void;
  updateRelationship: (id: string, updates: Partial<RelationshipDefinition>) => void;
  deleteRelationship: (id: string) => void;

  // Records
  records: RecordItem[];
  createRecord: (objectId: string, values: Record<string, any>) => void;
  updateRecord: (recordId: string, values: Record<string, any>) => void;
  deleteRecord: (recordId: string) => void;

  // Comments
  comments: CommentItem[];
  addComment: (
    targetType: 'object' | 'field' | 'relationship',
    targetId: string,
    targetName: string,
    body: string
  ) => void;

  // Activity Log
  activityLogs: ActivityLog[];

  // Versions
  versions: ProjectVersion[];
  publishVersion: (label: string, notes: string) => void;
  restoreVersion: (versionId: string) => void;

  // Templates
  loadTemplate: (objects: ObjectDefinition[], relationships: RelationshipDefinition[], name: string) => void;

  // Canvas View & Search
  activeView: 'builder' | 'records' | 'versions' | 'access' | 'overview';
  setActiveView: (view: 'builder' | 'records' | 'versions' | 'access' | 'overview') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterFieldType: string | null;
  setFilterFieldType: (t: string | null) => void;
  zoom: number;
  setZoom: (z: number | ((prev: number) => number)) => void;
  pan: { x: number; y: number };
  setPan: (p: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;

  // Modals & UI Triggers
  isCreateObjectOpen: boolean;
  setIsCreateObjectOpen: (open: boolean) => void;
  isFieldModalOpen: boolean;
  setIsFieldModalOpen: (open: boolean) => void;
  fieldModalObjectId: string | null;
  setFieldModalObjectId: (id: string | null) => void;
  editingField: FieldDefinition | null;
  setEditingField: (fld: FieldDefinition | null) => void;

  isRelationshipModalOpen: boolean;
  setIsRelationshipModalOpen: (open: boolean) => void;
  relationshipToEdit: RelationshipDefinition | null;
  setRelationshipToEdit: (rel: RelationshipDefinition | null) => void;

  isDeleteImpactOpen: boolean;
  setIsDeleteImpactOpen: (open: boolean) => void;
  deleteImpactData: DeleteImpact | null;
  setDeleteImpactData: (impact: DeleteImpact | null) => void;

  isRecordModalOpen: boolean;
  setIsRecordModalOpen: (open: boolean) => void;
  recordModalObjectId: string | null;
  setRecordModalObjectId: (id: string | null) => void;
  recordToEdit: RecordItem | null;
  setRecordToEdit: (rec: RecordItem | null) => void;

  isCommentsDrawerOpen: boolean;
  setIsCommentsDrawerOpen: (open: boolean) => void;
  commentTarget: { type: 'object' | 'field' | 'relationship'; id: string; name: string } | null;
  setCommentTarget: (target: { type: 'object' | 'field' | 'relationship'; id: string; name: string } | null) => void;

  isActivityDrawerOpen: boolean;
  setIsActivityDrawerOpen: (open: boolean) => void;

  isVersionModalOpen: boolean;
  setIsVersionModalOpen: (open: boolean) => void;

  isDiffModalOpen: boolean;
  setIsDiffModalOpen: (open: boolean) => void;
  diffVersion: ProjectVersion | null;
  setDiffVersion: (ver: ProjectVersion | null) => void;

  isBrandingModalOpen: boolean;
  setIsBrandingModalOpen: (open: boolean) => void;

  isTemplateModalOpen: boolean;
  setIsTemplateModalOpen: (open: boolean) => void;

  // Connect helper
  connectingSourceId: string | null;
  setConnectingSourceId: (id: string | null) => void;

  // Conflict state
  conflictState: {
    isOpen: boolean;
    objectName: string;
    localChanges: any;
    remoteRevision: number;
  } | null;
  resolveConflict: (keepLocal: boolean) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Users & Roles
  const [allUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Alice (Owner)

  // Workspaces & Projects
  const [allWorkspaces, setAllWorkspaces] = useState<Workspace[]>(INITIAL_WORKSPACES);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>(INITIAL_WORKSPACES[0]);
  const [allProjects, setAllProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [currentProject, setCurrentProject] = useState<Project>(INITIAL_PROJECTS[0]);

  const [members] = useState<WorkspaceMember[]>(INITIAL_MEMBERS);
  const [invitations, setInvitations] = useState<Invitation[]>(INITIAL_INVITATIONS);

  // Entities
  const [objects, setObjects] = useState<ObjectDefinition[]>(INITIAL_OBJECTS);
  const [relationships, setRelationships] = useState<RelationshipDefinition[]>(INITIAL_RELATIONSHIPS);
  const [records, setRecords] = useState<RecordItem[]>(INITIAL_RECORDS);
  const [comments, setComments] = useState<CommentItem[]>(INITIAL_COMMENTS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY);
  const [versions, setVersions] = useState<ProjectVersion[]>(INITIAL_VERSIONS);

  // Canvas & Views
  const [activeView, setActiveView] = useState<'builder' | 'records' | 'versions' | 'access' | 'overview'>('builder');
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFieldType, setFilterFieldType] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Connect helper
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);

  // Modals state
  const [isCreateObjectOpen, setIsCreateObjectOpen] = useState(false);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [fieldModalObjectId, setFieldModalObjectId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<FieldDefinition | null>(null);

  const [isRelationshipModalOpen, setIsRelationshipModalOpen] = useState(false);
  const [relationshipToEdit, setRelationshipToEdit] = useState<RelationshipDefinition | null>(null);

  const [isDeleteImpactOpen, setIsDeleteImpactOpen] = useState(false);
  const [deleteImpactData, setDeleteImpactData] = useState<DeleteImpact | null>(null);

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordModalObjectId, setRecordModalObjectId] = useState<string | null>(null);
  const [recordToEdit, setRecordToEdit] = useState<RecordItem | null>(null);

  const [isCommentsDrawerOpen, setIsCommentsDrawerOpen] = useState(false);
  const [commentTarget, setCommentTarget] = useState<{ type: 'object' | 'field' | 'relationship'; id: string; name: string } | null>(null);

  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [diffVersion, setDiffVersion] = useState<ProjectVersion | null>(null);

  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Conflict resolution state (FR-12)
  const [conflictState, setConflictState] = useState<{
    isOpen: boolean;
    objectName: string;
    localChanges: any;
    remoteRevision: number;
  } | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const logActivity = (
    action: string,
    entityType: ActivityLog['entityType'],
    entityName: string
  ) => {
    const newLog: ActivityLog = {
      id: `act_${Date.now()}`,
      projectId: currentProject.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      action,
      entityType,
      entityName,
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Permissions
  const canEdit = currentUser.role === 'owner' || currentUser.role === 'editor' || currentUser.role === 'platform_admin';
  const canPublish = currentUser.role === 'owner' || currentUser.role === 'platform_admin';
  const canManageMembers = currentUser.role === 'owner' || currentUser.role === 'platform_admin';

  // Branding & Workspace
  const updateWorkspaceBranding = (brandingUpdates: Partial<Workspace['branding']>) => {
    setAllWorkspaces(prev =>
      prev.map(ws =>
        ws.id === currentWorkspace.id
          ? { ...ws, branding: { ...ws.branding, ...brandingUpdates } }
          : ws
      )
    );
    setCurrentWorkspace(prev => ({
      ...prev,
      branding: { ...prev.branding, ...brandingUpdates }
    }));
    logActivity('Updated workspace branding and theme colors', 'object', currentWorkspace.name);
    addToast({ type: 'success', title: 'Branding Saved', message: 'Workspace styles successfully updated.' });
  };

  // Invitations (FR-02)
  const inviteCollaborator = (email: string, role: User['role']) => {
    if (!canManageMembers) {
      addToast({ type: 'error', title: 'Permission Denied', message: 'Only workspace owners can send invitations.' });
      return;
    }
    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + 7);

    const newInv: Invitation = {
      id: `inv_${Date.now()}`,
      workspaceId: currentWorkspace.id,
      projectId: currentProject.id,
      email,
      role,
      expiresAt: expiresDate.toISOString(),
      tokenHash: `tok_${Math.random().toString(36).substring(2, 12)}`,
      status: 'pending',
      invitedBy: currentUser.name
    };
    setInvitations(prev => [newInv, ...prev]);
    logActivity(`Invited collaborator ${email} as ${role}`, 'member', email);
    addToast({ type: 'success', title: 'Invitation Sent', message: `Revocable invite link dispatched to ${email}.` });
  };

  const revokeInvitation = (id: string) => {
    setInvitations(prev =>
      prev.map(inv => (inv.id === id ? { ...inv, status: 'revoked' } : inv))
    );
    addToast({ type: 'info', title: 'Invitation Revoked', message: 'The invite token has been disabled.' });
  };

  // Object Designer (FR-03)
  const createObject = (data: Partial<ObjectDefinition>) => {
    if (!canEdit) {
      addToast({ type: 'error', title: 'Permission Denied', message: 'Viewer accounts cannot create objects.' });
      return;
    }

    const key = data.key?.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || `object_${Date.now().toString().slice(-4)}`;
    
    // Check duplicate key
    if (objects.some(o => o.key.toLowerCase() === key)) {
      addToast({ type: 'error', title: 'Key Conflict', message: `An object with technical key "${key}" already exists.` });
      return;
    }

    const newObj: ObjectDefinition = {
      id: `obj_${Date.now()}`,
      projectId: currentProject.id,
      key,
      singularLabel: data.singularLabel?.trim() || 'Custom Object',
      pluralLabel: data.pluralLabel?.trim() || `${data.singularLabel || 'Custom'} Items`,
      description: data.description?.trim() || '',
      icon: data.icon || 'Box',
      color: data.color || '#6366f1',
      position: data.position || { x: 200 + Math.random() * 200, y: 150 + Math.random() * 200 },
      status: 'active',
      revision: 1,
      updatedBy: currentUser.id,
      updatedAt: new Date().toISOString(),
      fields: data.fields || [
        {
          id: `fld_${Date.now()}_id`,
          key: 'id',
          name: 'Identifier',
          type: 'text',
          required: true,
          unique: true,
          order: 1,
          isActive: true,
          isPrimary: true
        }
      ]
    };

    setObjects(prev => [...prev, newObj]);
    setSelectedObjectId(newObj.id);
    logActivity(`Created object definition "${newObj.singularLabel}"`, 'object', newObj.singularLabel);
    addToast({ type: 'success', title: 'Object Created', message: `Object "${newObj.singularLabel}" added to schema.` });
  };

  const updateObject = (id: string, updates: Partial<ObjectDefinition>, expectedRevision?: number): boolean => {
    if (!canEdit) {
      addToast({ type: 'error', title: 'Permission Denied', message: 'Viewers cannot modify schema definitions.' });
      return false;
    }

    const target = objects.find(o => o.id === id);
    if (!target) return false;

    // FR-12: Conflict detection
    if (expectedRevision !== undefined && target.revision !== expectedRevision) {
      setConflictState({
        isOpen: true,
        objectName: target.singularLabel,
        localChanges: updates,
        remoteRevision: target.revision
      });
      addToast({
        type: 'warning',
        title: 'Concurrent Edit Conflict Detected',
        message: `Object was modified by another user (rev ${target.revision}). Resolve conflict.`
      });
      return false;
    }

    setObjects(prev =>
      prev.map(obj =>
        obj.id === id
          ? {
              ...obj,
              ...updates,
              revision: (obj.revision || 1) + 1,
              updatedBy: currentUser.id,
              updatedAt: new Date().toISOString()
            }
          : obj
      )
    );

    logActivity(`Updated object "${target.singularLabel}"`, 'object', target.singularLabel);
    return true;
  };

  const resolveConflict = (keepLocal: boolean) => {
    if (!conflictState) return;
    if (keepLocal && selectedObjectId) {
      setObjects(prev =>
        prev.map(obj =>
          obj.id === selectedObjectId
            ? {
                ...obj,
                ...conflictState.localChanges,
                revision: (obj.revision || 1) + 1,
                updatedBy: currentUser.id,
                updatedAt: new Date().toISOString()
              }
            : obj
        )
      );
      addToast({ type: 'info', title: 'Conflict Resolved', message: 'Forced local changes over remote revision.' });
    } else {
      addToast({ type: 'info', title: 'Conflict Discarded', message: 'Discarded local changes in favor of remote revision.' });
    }
    setConflictState(null);
  };

  // Safe Deletion & Impact Confirmation (FR-11)
  const deleteObject = (id: string, force = false): boolean => {
    if (!canEdit) {
      addToast({ type: 'error', title: 'Permission Denied', message: 'Viewers cannot delete definitions.' });
      return false;
    }

    const target = objects.find(o => o.id === id);
    if (!target) return false;

    const impact = calculateObjectDeleteImpact(id, objects, relationships, records);

    if (!force) {
      // Show Impact Preview Dialog
      setDeleteImpactData(impact);
      setIsDeleteImpactOpen(true);
      return false;
    }

    if (impact && !impact.canDelete) {
      addToast({
        type: 'error',
        title: 'Deletion Prevented by Foreign Key Policy',
        message: impact.blockedReason || 'Dependent records exist under RESTRICT policy.'
      });
      return false;
    }

    // Cascade or nullify dependent records
    if (impact) {
      const targetRecordIds = new Set(records.filter(r => r.objectId === id).map(r => r.id));

      setRecords(prev =>
        prev
          .filter(r => r.objectId !== id) // Remove target records
          .filter(r => {
            // Check CASCADE
            const isCascaded = impact.incomingRelations.some(inc => {
              if (inc.policy !== 'cascade') return false;
              if (r.objectId !== inc.fromObject.id) return false;
              return Object.values(r.values).some(v => targetRecordIds.has(v));
            });
            return !isCascaded;
          })
          .map(r => {
            // Check NULLIFY
            let modified = false;
            const updatedVals = { ...r.values };
            impact.incomingRelations.forEach(inc => {
              if (inc.policy === 'nullify' && r.objectId === inc.fromObject.id) {
                Object.keys(updatedVals).forEach(k => {
                  if (targetRecordIds.has(updatedVals[k])) {
                    updatedVals[k] = null;
                    modified = true;
                  }
                });
              }
            });
            return modified ? { ...r, values: updatedVals } : r;
          })
      );
    }

    // Remove relationships connected to this object
    setRelationships(prev => prev.filter(r => r.fromObjectId !== id && r.toObjectId !== id));

    // Remove the object itself
    setObjects(prev => prev.filter(o => o.id !== id));
    if (selectedObjectId === id) setSelectedObjectId(null);

    logActivity(`Safely deleted object "${target.singularLabel}"`, 'object', target.singularLabel);
    addToast({ type: 'success', title: 'Object Deleted', message: `"${target.singularLabel}" and associated links were removed.` });
    return true;
  };

  const updateNodePosition = (id: string, pos: { x: number; y: number }) => {
    setObjects(prev =>
      prev.map(o => (o.id === id ? { ...o, position: pos } : o))
    );
  };

  const applyAutoLayout = () => {
    const arranged = calculateAutoLayout(objects, relationships);
    setObjects(arranged);
    addToast({ type: 'info', title: 'Auto Layout Applied', message: 'Nodes rearranged in an optimal hierarchical layout.' });
  };

  // Field Designer (FR-04)
  const addField = (objectId: string, fieldData: Omit<FieldDefinition, 'id'>) => {
    if (!canEdit) return;
    const newField: FieldDefinition = {
      ...fieldData,
      id: `fld_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    };

    setObjects(prev =>
      prev.map(obj => {
        if (obj.id !== objectId) return obj;
        return {
          ...obj,
          fields: [...obj.fields, newField],
          revision: (obj.revision || 1) + 1,
          updatedAt: new Date().toISOString()
        };
      })
    );

    const parentObj = objects.find(o => o.id === objectId);
    logActivity(`Added field "${newField.name}" to ${parentObj?.singularLabel || 'object'}`, 'field', newField.name);
    addToast({ type: 'success', title: 'Field Added', message: `Added "${newField.name}" (${newField.type}).` });
  };

  const updateField = (objectId: string, fieldId: string, updates: Partial<FieldDefinition>) => {
    if (!canEdit) return;
    setObjects(prev =>
      prev.map(obj => {
        if (obj.id !== objectId) return obj;
        return {
          ...obj,
          fields: obj.fields.map(f => (f.id === fieldId ? { ...f, ...updates } : f)),
          revision: (obj.revision || 1) + 1,
          updatedAt: new Date().toISOString()
        };
      })
    );
    addToast({ type: 'success', title: 'Field Updated', message: 'Field configuration saved.' });
  };

  const deleteField = (objectId: string, fieldId: string) => {
    if (!canEdit) return;
    setObjects(prev =>
      prev.map(obj => {
        if (obj.id !== objectId) return obj;
        return {
          ...obj,
          fields: obj.fields.filter(f => f.id !== fieldId),
          revision: (obj.revision || 1) + 1,
          updatedAt: new Date().toISOString()
        };
      })
    );
    addToast({ type: 'info', title: 'Field Removed', message: 'Field deleted from schema.' });
  };

  const reorderFields = (objectId: string, fieldId: string, direction: 'up' | 'down') => {
    if (!canEdit) return;
    setObjects(prev =>
      prev.map(obj => {
        if (obj.id !== objectId) return obj;
        const index = obj.fields.findIndex(f => f.id === fieldId);
        if (index === -1) return obj;
        if (direction === 'up' && index === 0) return obj;
        if (direction === 'down' && index === obj.fields.length - 1) return obj;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const newFields = [...obj.fields];
        const [moved] = newFields.splice(index, 1);
        newFields.splice(targetIndex, 0, moved);

        return {
          ...obj,
          fields: newFields.map((f, i) => ({ ...f, order: i + 1 })),
          revision: (obj.revision || 1) + 1
        };
      })
    );
  };

  // Relationship Designer (FR-05)
  const createRelationship = (
    fromObjectId: string,
    toObjectId: string,
    cardinality: Cardinality,
    label: string,
    deletePolicy: DeletePolicy
  ) => {
    if (!canEdit) return;
    if (fromObjectId === toObjectId) {
      addToast({ type: 'warning', title: 'Self-Reference', message: 'Creating self-referencing relationship.' });
    }

    const fromObj = objects.find(o => o.id === fromObjectId);
    const toObj = objects.find(o => o.id === toObjectId);

    const newRel: RelationshipDefinition = {
      id: `rel_${Date.now()}`,
      projectId: currentProject.id,
      fromObjectId,
      toObjectId,
      cardinality,
      label: label || `${fromObj?.singularLabel} to ${toObj?.singularLabel}`,
      sourceRoleLabel: fromObj?.singularLabel,
      targetRoleLabel: toObj?.pluralLabel,
      deletePolicy,
      createdAt: new Date().toISOString()
    };

    setRelationships(prev => [...prev, newRel]);
    logActivity(`Created ${cardinality} relation "${newRel.label}"`, 'relationship', newRel.label);
    addToast({ type: 'success', title: 'Relationship Created', message: `${newRel.label} (${cardinality})` });
  };

  const updateRelationship = (id: string, updates: Partial<RelationshipDefinition>) => {
    if (!canEdit) return;
    setRelationships(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updates } : r))
    );
    addToast({ type: 'success', title: 'Relationship Updated', message: 'Relationship constraints saved.' });
  };

  const deleteRelationship = (id: string) => {
    if (!canEdit) return;
    const target = relationships.find(r => r.id === id);
    setRelationships(prev => prev.filter(r => r.id !== id));
    if (selectedRelationshipId === id) setSelectedRelationshipId(null);
    logActivity(`Removed relation "${target?.label || id}"`, 'relationship', target?.label || id);
    addToast({ type: 'info', title: 'Relationship Removed', message: 'Relationship edge disconnected.' });
  };

  // Record Entry (FR-08)
  const createRecord = (objectId: string, values: Record<string, any>) => {
    if (!canEdit) {
      addToast({ type: 'error', title: 'Permission Denied', message: 'Viewers cannot create records.' });
      return;
    }
    const newRecord: RecordItem = {
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      objectId,
      projectId: currentProject.id,
      values,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setRecords(prev => [newRecord, ...prev]);
    const objDef = objects.find(o => o.id === objectId);
    logActivity(`Created new record in "${objDef?.singularLabel}"`, 'record', objDef?.singularLabel || 'record');
    addToast({ type: 'success', title: 'Record Saved', message: 'New entity record added successfully.' });
  };

  const updateRecord = (recordId: string, values: Record<string, any>) => {
    if (!canEdit) return;
    setRecords(prev =>
      prev.map(r =>
        r.id === recordId
          ? { ...r, values: { ...r.values, ...values }, updatedAt: new Date().toISOString() }
          : r
      )
    );
    addToast({ type: 'success', title: 'Record Updated', message: 'Entity values saved.' });
  };

  const deleteRecord = (recordId: string) => {
    if (!canEdit) return;
    setRecords(prev => prev.filter(r => r.id !== recordId));
    addToast({ type: 'info', title: 'Record Removed', message: 'Record deleted.' });
  };

  // Comments (FR-07)
  const addComment = (
    targetType: 'object' | 'field' | 'relationship',
    targetId: string,
    targetName: string,
    body: string
  ) => {
    const newComment: CommentItem = {
      id: `cmt_${Date.now()}`,
      projectId: currentProject.id,
      targetType,
      targetId,
      targetName,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      body,
      createdAt: new Date().toISOString()
    };
    setComments(prev => [newComment, ...prev]);
    logActivity(`Commented on ${targetType} "${targetName}"`, 'object', targetName);
    addToast({ type: 'success', title: 'Comment Posted', message: 'Collaborator notification sent.' });
  };

  // Versioning & Snapshotting (FR-09, FR-14)
  const publishVersion = (label: string, notes: string) => {
    if (!canPublish) {
      addToast({ type: 'error', title: 'Unauthorized', message: 'Only workspace owners can publish versions.' });
      return;
    }

    const nextVer = `1.${versions.length}.0`;
    const newVersion: ProjectVersion = {
      id: `ver_${Date.now()}`,
      projectId: currentProject.id,
      versionNumber: nextVer,
      label: label.trim() || `Release v${nextVer}`,
      notes: notes.trim() || 'Published immutable snapshot of data model.',
      publishedBy: currentUser.name,
      publishedAt: new Date().toISOString(),
      snapshot: {
        objects: JSON.parse(JSON.stringify(objects)),
        relationships: JSON.parse(JSON.stringify(relationships))
      }
    };

    setVersions(prev => [newVersion, ...prev]);
    setCurrentProject(prev => ({ ...prev, currentVersion: nextVer, status: 'published' }));
    logActivity(`Published immutable version v${nextVer}`, 'version', newVersion.label);
    addToast({ type: 'success', title: `Published Version v${nextVer}!`, message: 'Snapshot frozen and archived.' });
  };

  const restoreVersion = (versionId: string) => {
    if (!canPublish) {
      addToast({ type: 'error', title: 'Unauthorized', message: 'Only workspace owners can restore historical versions.' });
      return;
    }

    const targetVer = versions.find(v => v.id === versionId);
    if (!targetVer) return;

    setObjects(JSON.parse(JSON.stringify(targetVer.snapshot.objects)));
    setRelationships(JSON.parse(JSON.stringify(targetVer.snapshot.relationships)));
    logActivity(`Restored model to version v${targetVer.versionNumber}`, 'version', targetVer.label);
    addToast({ type: 'info', title: `Restored to v${targetVer.versionNumber}`, message: 'Schema canvas synchronized to snapshot.' });
  };

  // Templates
  const loadTemplate = (
    tplObjects: ObjectDefinition[],
    tplRelationships: RelationshipDefinition[],
    name: string
  ) => {
    setObjects(tplObjects);
    setRelationships(tplRelationships);
    setSelectedObjectId(null);
    setSelectedRelationshipId(null);
    logActivity(`Loaded "${name}" architecture template`, 'object', name);
    addToast({ type: 'success', title: 'Template Loaded', message: `Initialized workspace with "${name}".` });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        setCurrentUser,
        canEdit,
        canPublish,
        canManageMembers,
        currentWorkspace,
        allWorkspaces,
        setCurrentWorkspace,
        currentProject,
        allProjects,
        setCurrentProject,
        members,
        invitations,
        updateWorkspaceBranding,
        inviteCollaborator,
        revokeInvitation,
        objects,
        selectedObjectId,
        setSelectedObjectId,
        createObject,
        updateObject,
        deleteObject,
        updateNodePosition,
        applyAutoLayout,
        addField,
        updateField,
        deleteField,
        reorderFields,
        relationships,
        selectedRelationshipId,
        setSelectedRelationshipId,
        createRelationship,
        updateRelationship,
        deleteRelationship,
        records,
        createRecord,
        updateRecord,
        deleteRecord,
        comments,
        addComment,
        activityLogs,
        versions,
        publishVersion,
        restoreVersion,
        loadTemplate,
        activeView,
        setActiveView,
        searchQuery,
        setSearchQuery,
        filterFieldType,
        setFilterFieldType,
        zoom,
        setZoom,
        pan,
        setPan,
        isCreateObjectOpen,
        setIsCreateObjectOpen,
        isFieldModalOpen,
        setIsFieldModalOpen,
        fieldModalObjectId,
        setFieldModalObjectId,
        editingField,
        setEditingField,
        isRelationshipModalOpen,
        setIsRelationshipModalOpen,
        relationshipToEdit,
        setRelationshipToEdit,
        isDeleteImpactOpen,
        setIsDeleteImpactOpen,
        deleteImpactData,
        setDeleteImpactData,
        isRecordModalOpen,
        setIsRecordModalOpen,
        recordModalObjectId,
        setRecordModalObjectId,
        recordToEdit,
        setRecordToEdit,
        isCommentsDrawerOpen,
        setIsCommentsDrawerOpen,
        commentTarget,
        setCommentTarget,
        isActivityDrawerOpen,
        setIsActivityDrawerOpen,
        isVersionModalOpen,
        setIsVersionModalOpen,
        isDiffModalOpen,
        setIsDiffModalOpen,
        diffVersion,
        setDiffVersion,
        isBrandingModalOpen,
        setIsBrandingModalOpen,
        isTemplateModalOpen,
        setIsTemplateModalOpen,
        connectingSourceId,
        setConnectingSourceId,
        conflictState,
        resolveConflict,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
