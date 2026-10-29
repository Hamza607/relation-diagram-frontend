export type Role = 'platform_admin' | 'owner' | 'editor' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  workspaceId: string;
}

export interface WorkspaceBranding {
  name: string;
  tagline: string;
  logoIcon: string;
  primaryColor: string;
  accentColor: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  branding: WorkspaceBranding;
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  status: 'active' | 'invited';
  joinedAt: string;
}

export interface Invitation {
  id: string;
  workspaceId: string;
  projectId: string;
  email: string;
  role: Role;
  expiresAt: string;
  tokenHash: string;
  status: 'pending' | 'accepted' | 'revoked';
  invitedBy: string;
}

export type FieldType =
  | 'text'
  | 'long_text'
  | 'number'
  | 'decimal'
  | 'datetime'
  | 'boolean'
  | 'enum'
  | 'email'
  | 'url'
  | 'file'
  | 'reference';

export interface FieldDefinition {
  id: string;
  key: string;
  name: string;
  type: FieldType;
  required: boolean;
  unique: boolean;
  defaultValue?: any;
  enumOptions?: string[];
  referenceTargetObjectId?: string; // If type === 'reference'
  order: number;
  isActive: boolean;
  isPrimary?: boolean; // Label preview in records
  description?: string;
}

export interface ObjectDefinition {
  id: string;
  projectId: string;
  key: string;
  singularLabel: string;
  pluralLabel: string;
  description: string;
  icon: string;
  color: string;
  position: { x: number; y: number };
  status: 'active' | 'deprecated';
  revision: number; // for conflict detection (FR-12)
  updatedBy?: string;
  updatedAt?: string;
  fields: FieldDefinition[];
}

export type Cardinality = '1:1' | '1:N' | 'N:N';
export type DeletePolicy = 'restrict' | 'cascade' | 'nullify';

export interface RelationshipDefinition {
  id: string;
  projectId: string;
  fromObjectId: string; // Source object ID
  toObjectId: string; // Target object ID
  cardinality: Cardinality;
  label: string;
  sourceRoleLabel?: string;
  targetRoleLabel?: string;
  deletePolicy: DeletePolicy;
  createdAt: string;
}

export interface RecordItem {
  id: string;
  objectId: string;
  projectId: string;
  values: Record<string, any>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentItem {
  id: string;
  projectId: string;
  targetType: 'object' | 'field' | 'relationship';
  targetId: string;
  targetName: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  body: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  entityType: 'object' | 'field' | 'relationship' | 'record' | 'version' | 'member';
  entityName: string;
  timestamp: string;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  versionNumber: string;
  label: string;
  notes: string;
  publishedBy: string;
  publishedAt: string;
  snapshot: {
    objects: ObjectDefinition[];
    relationships: RelationshipDefinition[];
  };
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  status: 'draft' | 'published';
  currentVersion: string;
  updatedAt: string;
  createdAt: string;
}

export interface PresenceUser {
  id: string;
  name: string;
  avatar: string;
  color: string;
  currentAction: string;
}
