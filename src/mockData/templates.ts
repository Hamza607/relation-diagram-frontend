import { ObjectDefinition, RelationshipDefinition } from '../types/schema';

export interface SchemaTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  objects: ObjectDefinition[];
  relationships: RelationshipDefinition[];
}

export const SCHEMA_TEMPLATES: SchemaTemplate[] = [
  {
    id: 'tpl_ecommerce',
    name: 'E-Commerce Retail Mesh',
    description: 'Customers, Orders, Order Items, Product Catalog, and Settlements with 1:N relations.',
    category: 'Retail & FinTech',
    icon: 'ShoppingCart',
    objects: [], // loaded from initialData
    relationships: []
  },
  {
    id: 'tpl_realestate',
    name: 'Property & Real Estate Leasing',
    description: 'Properties, Units, Tenants, Owners, Lease Contracts, and Maintenance Requests.',
    category: 'Real Estate',
    icon: 'Building',
    objects: [
      {
        id: 'obj_re_property',
        projectId: 'template',
        key: 'property',
        singularLabel: 'Property Building',
        pluralLabel: 'Property Buildings',
        description: 'Physical real estate asset, complex, or single family parcel.',
        icon: 'Building',
        color: '#0284c7',
        position: { x: 80, y: 140 },
        status: 'active',
        revision: 1,
        fields: [
          { id: 'f_p1', key: 'propertyCode', name: 'Building Code', type: 'text', required: true, unique: true, order: 1, isActive: true, isPrimary: true },
          { id: 'f_p2', key: 'address', name: 'Physical Address', type: 'text', required: true, unique: false, order: 2, isActive: true },
          { id: 'f_p3', key: 'city', name: 'City', type: 'text', required: true, unique: false, order: 3, isActive: true },
          { id: 'f_p4', key: 'totalUnits', name: 'Total Unit Count', type: 'number', required: true, unique: false, defaultValue: 1, order: 4, isActive: true }
        ]
      },
      {
        id: 'obj_re_unit',
        projectId: 'template',
        key: 'rentalUnit',
        singularLabel: 'Rental Unit',
        pluralLabel: 'Rental Units',
        description: 'Individual apartment, suite, or store inside a property building.',
        icon: 'Home',
        color: '#6366f1',
        position: { x: 480, y: 140 },
        status: 'active',
        revision: 1,
        fields: [
          { id: 'f_u1', key: 'unitNumber', name: 'Unit Number / Suite', type: 'text', required: true, unique: false, order: 1, isActive: true, isPrimary: true },
          { id: 'f_u2', key: 'propertyRef', name: 'Property Link', type: 'reference', required: true, unique: false, referenceTargetObjectId: 'obj_re_property', order: 2, isActive: true },
          { id: 'f_u3', key: 'monthlyRent', name: 'Market Rent Rate', type: 'decimal', required: true, unique: false, order: 3, isActive: true },
          { id: 'f_u4', key: 'occupancyStatus', name: 'Status', type: 'enum', required: true, unique: false, enumOptions: ['Vacant', 'Occupied', 'Maintenance Hold'], defaultValue: 'Vacant', order: 4, isActive: true }
        ]
      },
      {
        id: 'obj_re_tenant',
        projectId: 'template',
        key: 'tenant',
        singularLabel: 'Resident / Tenant',
        pluralLabel: 'Residents & Tenants',
        description: 'Individual or commercial entity leasing a property unit.',
        icon: 'User',
        color: '#10b981',
        position: { x: 880, y: 140 },
        status: 'active',
        revision: 1,
        fields: [
          { id: 'f_t1', key: 'tenantId', name: 'Tenant ID', type: 'text', required: true, unique: true, order: 1, isActive: true, isPrimary: true },
          { id: 'f_t2', key: 'legalName', name: 'Primary Lessee Name', type: 'text', required: true, unique: false, order: 2, isActive: true },
          { id: 'f_t3', key: 'contactEmail', name: 'Email Address', type: 'email', required: true, unique: true, order: 3, isActive: true },
          { id: 'f_t4', key: 'creditScore', name: 'Vetted Credit Rating', type: 'number', required: false, unique: false, order: 4, isActive: true }
        ]
      },
      {
        id: 'obj_re_lease',
        projectId: 'template',
        key: 'leaseContract',
        singularLabel: 'Lease Agreement',
        pluralLabel: 'Lease Agreements',
        description: 'Binding rental contract linking a tenant to a specific unit for a duration.',
        icon: 'FileText',
        color: '#f59e0b',
        position: { x: 680, y: 500 },
        status: 'active',
        revision: 1,
        fields: [
          { id: 'f_l1', key: 'leaseId', name: 'Contract Number', type: 'text', required: true, unique: true, order: 1, isActive: true, isPrimary: true },
          { id: 'f_l2', key: 'unitRef', name: 'Leased Unit', type: 'reference', required: true, unique: false, referenceTargetObjectId: 'obj_re_unit', order: 2, isActive: true },
          { id: 'f_l3', key: 'tenantRef', name: 'Lessee Tenant', type: 'reference', required: true, unique: false, referenceTargetObjectId: 'obj_re_tenant', order: 3, isActive: true },
          { id: 'f_l4', key: 'startDate', name: 'Start Date', type: 'datetime', required: true, unique: false, order: 4, isActive: true },
          { id: 'f_l5', key: 'depositPaid', name: 'Security Deposit', type: 'decimal', required: true, unique: false, order: 5, isActive: true }
        ]
      }
    ],
    relationships: [
      {
        id: 'rel_re_prop_units',
        projectId: 'template',
        fromObjectId: 'obj_re_property',
        toObjectId: 'obj_re_unit',
        cardinality: '1:N',
        label: 'Houses Rental Units',
        deletePolicy: 'restrict',
        createdAt: '2026-10-01T00:00:00Z'
      },
      {
        id: 'rel_re_unit_lease',
        projectId: 'template',
        fromObjectId: 'obj_re_unit',
        toObjectId: 'obj_re_lease',
        cardinality: '1:N',
        label: 'Lease History',
        deletePolicy: 'restrict',
        createdAt: '2026-10-01T00:00:00Z'
      },
      {
        id: 'rel_re_tenant_lease',
        projectId: 'template',
        fromObjectId: 'obj_re_tenant',
        toObjectId: 'obj_re_lease',
        cardinality: '1:N',
        label: 'Signed Agreements',
        deletePolicy: 'restrict',
        createdAt: '2026-10-01T00:00:00Z'
      }
    ]
  },
  {
    id: 'tpl_saas',
    name: 'SaaS Multi-Tenant Subscriptions',
    description: 'Workspaces, Subscriptions, Pricing Tiers, Invoices, and API Keys.',
    category: 'Cloud Software',
    icon: 'Layers',
    objects: [
      {
        id: 'obj_saas_org',
        projectId: 'template',
        key: 'organization',
        singularLabel: 'Organization',
        pluralLabel: 'Organizations',
        description: 'Customer company or agency account holding subscriptions.',
        icon: 'Building',
        color: '#6366f1',
        position: { x: 100, y: 150 },
        status: 'active',
        revision: 1,
        fields: [
          { id: 'f_so1', key: 'slug', name: 'Org Slug', type: 'text', required: true, unique: true, order: 1, isActive: true, isPrimary: true },
          { id: 'f_so2', key: 'companyName', name: 'Company Name', type: 'text', required: true, unique: false, order: 2, isActive: true },
          { id: 'f_so3', key: 'domain', name: 'Company Domain', type: 'url', required: false, unique: false, order: 3, isActive: true }
        ]
      },
      {
        id: 'obj_saas_plan',
        projectId: 'template',
        key: 'pricingPlan',
        singularLabel: 'Pricing Plan',
        pluralLabel: 'Pricing Plans',
        description: 'Monthly or annual tiered license (Starter, Pro, Enterprise).',
        icon: 'Zap',
        color: '#ec4899',
        position: { x: 520, y: 150 },
        status: 'active',
        revision: 1,
        fields: [
          { id: 'f_sp1', key: 'planCode', name: 'Plan SKU', type: 'text', required: true, unique: true, order: 1, isActive: true, isPrimary: true },
          { id: 'f_sp2', key: 'priceMonth', name: 'Monthly USD', type: 'decimal', required: true, unique: false, order: 2, isActive: true },
          { id: 'f_sp3', key: 'maxSeats', name: 'Allowed Seats', type: 'number', required: true, unique: false, order: 3, isActive: true }
        ]
      },
      {
        id: 'obj_saas_sub',
        projectId: 'template',
        key: 'subscription',
        singularLabel: 'Active Subscription',
        pluralLabel: 'Active Subscriptions',
        description: 'Contract binding an organization to a selected license plan.',
        icon: 'CreditCard',
        color: '#10b981',
        position: { x: 310, y: 480 },
        status: 'active',
        revision: 1,
        fields: [
          { id: 'f_ss1', key: 'subId', name: 'Subscription ID', type: 'text', required: true, unique: true, order: 1, isActive: true, isPrimary: true },
          { id: 'f_ss2', key: 'orgRef', name: 'Organization', type: 'reference', required: true, unique: false, referenceTargetObjectId: 'obj_saas_org', order: 2, isActive: true },
          { id: 'f_ss3', key: 'planRef', name: 'Selected Plan', type: 'reference', required: true, unique: false, referenceTargetObjectId: 'obj_saas_plan', order: 3, isActive: true },
          { id: 'f_ss4', key: 'status', name: 'Billing Status', type: 'enum', required: true, unique: false, enumOptions: ['Active', 'Past Due', 'Trialing', 'Canceled'], defaultValue: 'Active', order: 4, isActive: true }
        ]
      }
    ],
    relationships: [
      {
        id: 'rel_saas_org_sub',
        projectId: 'template',
        fromObjectId: 'obj_saas_org',
        toObjectId: 'obj_saas_sub',
        cardinality: '1:N',
        label: 'Owns Subscriptions',
        deletePolicy: 'cascade',
        createdAt: '2026-10-01T00:00:00Z'
      },
      {
        id: 'rel_saas_plan_sub',
        projectId: 'template',
        fromObjectId: 'obj_saas_plan',
        toObjectId: 'obj_saas_sub',
        cardinality: '1:N',
        label: 'Purchased Under Plan',
        deletePolicy: 'restrict',
        createdAt: '2026-10-01T00:00:00Z'
      }
    ]
  }
];
