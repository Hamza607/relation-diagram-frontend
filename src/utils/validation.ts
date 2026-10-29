import {
  ObjectDefinition,
  RelationshipDefinition,
  RecordItem
} from '../types/schema';

export interface ValidationIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  targetType: 'object' | 'field' | 'relationship';
  targetId: string;
  targetName: string;
  message: string;
}

export interface DeleteImpact {
  canDelete: boolean;
  blockedReason?: string;
  targetObject: ObjectDefinition;
  incomingRelations: {
    relationship: RelationshipDefinition;
    fromObject: ObjectDefinition;
    policy: string;
  }[];
  outgoingRelations: {
    relationship: RelationshipDefinition;
    toObject: ObjectDefinition;
  }[];
  affectedRecordsCount: number;
  cascadedRecordsCount: number;
  policyNotes: string[];
}

/**
 * Validates the entire project schema for consistency and foreign key integrity.
 */
export function validateSchema(
  objects: ObjectDefinition[],
  relationships: RelationshipDefinition[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const objectKeyMap = new Map<string, string>();
  const objectIdMap = new Map<string, ObjectDefinition>();

  // Check object unique keys
  objects.forEach(obj => {
    objectIdMap.set(obj.id, obj);
    const keyLower = obj.key.toLowerCase().trim();
    if (!keyLower) {
      issues.push({
        id: `err_key_empty_${obj.id}`,
        severity: 'error',
        targetType: 'object',
        targetId: obj.id,
        targetName: obj.singularLabel || 'Unnamed Object',
        message: 'Object must have a technical key identifier.'
      });
    } else if (objectKeyMap.has(keyLower)) {
      issues.push({
        id: `err_key_dup_${obj.id}`,
        severity: 'error',
        targetType: 'object',
        targetId: obj.id,
        targetName: obj.singularLabel,
        message: `Duplicate technical key "${obj.key}". Object keys must be unique within a project.`
      });
    } else {
      objectKeyMap.set(keyLower, obj.id);
    }

    // Check fields inside object
    const fieldKeySet = new Set<string>();
    let hasPrimary = false;

    obj.fields.forEach(fld => {
      const fldKeyLower = fld.key.toLowerCase().trim();
      if (!fldKeyLower) {
        issues.push({
          id: `err_fld_empty_${fld.id}`,
          severity: 'error',
          targetType: 'field',
          targetId: fld.id,
          targetName: `${obj.singularLabel} -> [Empty Field]`,
          message: 'Field must have a unique key identifier.'
        });
      } else if (fieldKeySet.has(fldKeyLower)) {
        issues.push({
          id: `err_fld_dup_${fld.id}`,
          severity: 'error',
          targetType: 'field',
          targetId: fld.id,
          targetName: `${obj.singularLabel}.${fld.key}`,
          message: `Field key "${fld.key}" is defined more than once in ${obj.singularLabel}.`
        });
      } else {
        fieldKeySet.add(fldKeyLower);
      }

      if (fld.isPrimary) hasPrimary = true;

      // Check reference field validity
      if (fld.type === 'reference') {
        if (!fld.referenceTargetObjectId) {
          issues.push({
            id: `err_fld_ref_empty_${fld.id}`,
            severity: 'error',
            targetType: 'field',
            targetId: fld.id,
            targetName: `${obj.singularLabel}.${fld.key}`,
            message: 'Reference field is missing a target object.'
          });
        }
      }
    });

    if (obj.fields.length > 0 && !hasPrimary) {
      issues.push({
        id: `warn_no_primary_${obj.id}`,
        severity: 'info',
        targetType: 'object',
        targetId: obj.id,
        targetName: obj.singularLabel,
        message: 'No primary display field specified. The first field will be used as the record label.'
      });
    }
  });

  // Check relationship integrity
  relationships.forEach(rel => {
    const fromObj = objectIdMap.get(rel.fromObjectId);
    const toObj = objectIdMap.get(rel.toObjectId);

    if (!fromObj) {
      issues.push({
        id: `err_rel_orphan_from_${rel.id}`,
        severity: 'error',
        targetType: 'relationship',
        targetId: rel.id,
        targetName: rel.label || 'Relationship',
        message: `Relationship references a non-existent source object (ID: ${rel.fromObjectId}).`
      });
    }
    if (!toObj) {
      issues.push({
        id: `err_rel_orphan_to_${rel.id}`,
        severity: 'error',
        targetType: 'relationship',
        targetId: rel.id,
        targetName: rel.label || 'Relationship',
        message: `Relationship references a non-existent target object (ID: ${rel.toObjectId}).`
      });
    }
  });

  return issues;
}

/**
 * Calculates Delete Impact for an object (FR-11)
 */
export function calculateObjectDeleteImpact(
  targetObjectId: string,
  objects: ObjectDefinition[],
  relationships: RelationshipDefinition[],
  records: RecordItem[]
): DeleteImpact | null {
  const targetObj = objects.find(o => o.id === targetObjectId);
  if (!targetObj) return null;

  const targetRecords = records.filter(r => r.objectId === targetObjectId);
  const targetRecordIds = new Set(targetRecords.map(r => r.id));

  // Find incoming relationships (other objects pointing to this target)
  const incomingRelations = relationships
    .filter(r => r.toObjectId === targetObjectId)
    .map(r => ({
      relationship: r,
      fromObject: objects.find(o => o.id === r.fromObjectId)!,
      policy: r.deletePolicy
    }))
    .filter(item => item.fromObject !== undefined);

  // Find outgoing relationships
  const outgoingRelations = relationships
    .filter(r => r.fromObjectId === targetObjectId)
    .map(r => ({
      relationship: r,
      toObject: objects.find(o => o.id === r.toObjectId)!
    }))
    .filter(item => item.toObject !== undefined);

  let canDelete = true;
  let blockedReason: string | undefined;
  const policyNotes: string[] = [];
  let cascadedRecordsCount = 0;

  // Check policies on incoming relations
  incomingRelations.forEach(({ fromObject, relationship, policy }) => {
    // Find records in fromObject that point to targetRecords
    const dependentRecords = records.filter(r => {
      if (r.objectId !== fromObject.id) return false;
      return Object.values(r.values).some(val => targetRecordIds.has(val));
    });

    if (dependentRecords.length > 0) {
      if (policy === 'restrict') {
        canDelete = false;
        blockedReason = `Deletion blocked by RESTRICT policy on "${fromObject.singularLabel}" (${dependentRecords.length} referencing records exist). You must delete or reassign referencing records first.`;
        policyNotes.push(`RESTRICT: ${dependentRecords.length} records in "${fromObject.pluralLabel}" reference this object.`);
      } else if (policy === 'cascade') {
        cascadedRecordsCount += dependentRecords.length;
        policyNotes.push(`CASCADE: ${dependentRecords.length} records in "${fromObject.pluralLabel}" will be automatically deleted.`);
      } else if (policy === 'nullify') {
        policyNotes.push(`NULLIFY: ${dependentRecords.length} records in "${fromObject.pluralLabel}" will have their reference cleared to null.`);
      }
    }
  });

  return {
    canDelete,
    blockedReason,
    targetObject: targetObj,
    incomingRelations,
    outgoingRelations,
    affectedRecordsCount: targetRecords.length,
    cascadedRecordsCount,
    policyNotes
  };
}

/**
 * Validates a single record against the object's schema definition (FR-08, FR-15)
 */
export function validateRecordValues(
  objectDef: ObjectDefinition,
  values: Record<string, any>,
  existingRecords: RecordItem[],
  currentRecordId?: string
): Record<string, string> {
  const errors: Record<string, string> = {};

  objectDef.fields.forEach(field => {
    if (!field.isActive) return;

    const val = values[field.key];
    const isValEmpty = val === undefined || val === null || val === '';

    // Required check
    if (field.required && isValEmpty) {
      errors[field.key] = `${field.name} is required.`;
      return;
    }

    if (!isValEmpty) {
      // Type specific checks
      if (field.type === 'number' || field.type === 'decimal') {
        if (isNaN(Number(val))) {
          errors[field.key] = `${field.name} must be a valid numeric value.`;
        }
      } else if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(val))) {
          errors[field.key] = `${field.name} must be a valid email address.`;
        }
      } else if (field.type === 'url') {
        try {
          new URL(String(val));
        } catch {
          errors[field.key] = `${field.name} must be a valid URL (e.g. https://example.com).`;
        }
      }

      // Unique constraint check
      if (field.unique) {
        const hasDuplicate = existingRecords.some(r => {
          if (r.objectId !== objectDef.id) return false;
          if (currentRecordId && r.id === currentRecordId) return false;
          return String(r.values[field.key]).toLowerCase().trim() === String(val).toLowerCase().trim();
        });

        if (hasDuplicate) {
          errors[field.key] = `Value "${val}" already exists for ${field.name}. Unique constraint violated.`;
        }
      }
    }
  });

  return errors;
}
