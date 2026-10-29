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
  Invitation
} from '../types/schema';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_alice',
    name: 'Alice Henderson',
    email: 'alice@acmecommerce.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'owner',
    workspaceId: 'ws_acme'
  },
  {
    id: 'usr_bob',
    name: 'Bob Martinez',
    email: 'bob.martinez@dataforge.io',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'editor',
    workspaceId: 'ws_acme'
  },
  {
    id: 'usr_charlie',
    name: 'Charlie Lin',
    email: 'charlie.stakeholder@retailgroup.org',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    role: 'viewer',
    workspaceId: 'ws_acme'
  },
  {
    id: 'usr_diana',
    name: 'Diana Prince',
    email: 'diana.admin@platformcore.net',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    role: 'platform_admin',
    workspaceId: 'ws_acme'
  }
];

export const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: 'ws_acme',
    name: 'Acme Commerce Inc.',
    ownerId: 'usr_alice',
    branding: {
      name: 'Acme Commerce',
      tagline: 'Enterprise Global Retail Architecture',
      logoIcon: 'Boxes',
      primaryColor: '#6366f1',
      accentColor: '#10b981'
    },
    createdAt: '2026-09-01T10:00:00Z'
  },
  {
    id: 'ws_apex_health',
    name: 'Apex Health Systems',
    ownerId: 'usr_alice',
    branding: {
      name: 'Apex Health Systems',
      tagline: 'Clinical Patient Record Infrastructure',
      logoIcon: 'Activity',
      primaryColor: '#0ea5e9',
      accentColor: '#06b6d4'
    },
    createdAt: '2026-09-15T14:30:00Z'
  }
];

export const INITIAL_MEMBERS: WorkspaceMember[] = [
  {
    id: 'mem_1',
    userId: 'usr_alice',
    workspaceId: 'ws_acme',
    name: 'Alice Henderson',
    email: 'alice@acmecommerce.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'owner',
    status: 'active',
    joinedAt: '2026-09-01T10:00:00Z'
  },
  {
    id: 'mem_2',
    userId: 'usr_bob',
    workspaceId: 'ws_acme',
    name: 'Bob Martinez',
    email: 'bob.martinez@dataforge.io',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'editor',
    status: 'active',
    joinedAt: '2026-09-05T11:15:00Z'
  },
  {
    id: 'mem_3',
    userId: 'usr_charlie',
    workspaceId: 'ws_acme',
    name: 'Charlie Lin',
    email: 'charlie.stakeholder@retailgroup.org',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    role: 'viewer',
    status: 'active',
    joinedAt: '2026-09-12T16:20:00Z'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_ecommerce',
    workspaceId: 'ws_acme',
    name: 'E-Commerce Unified Data Platform',
    description: 'Core domain schema for customers, orders, order items, catalog products, and multi-rail payment transactions.',
    status: 'draft',
    currentVersion: '1.2.0',
    updatedAt: '2026-10-26T12:00:00Z',
    createdAt: '2026-09-01T10:00:00Z'
  },
  {
    id: 'proj_logistics',
    workspaceId: 'ws_acme',
    name: 'Warehouse & Fulfillment Mesh',
    description: 'Inventory tracking, cross-dock facility bin allocations, and carrier dispatch manifests.',
    status: 'published',
    currentVersion: '1.0.0',
    updatedAt: '2026-10-18T09:40:00Z',
    createdAt: '2026-09-20T08:00:00Z'
  }
];

export const INITIAL_OBJECTS: ObjectDefinition[] = [
  {
    id: 'obj_customer',
    projectId: 'proj_ecommerce',
    key: 'customer',
    singularLabel: 'Customer',
    pluralLabel: 'Customers',
    description: 'Registered or guest account placing orders across web and mobile storefronts.',
    icon: 'User',
    color: '#3b82f6', // Blue
    position: { x: 60, y: 120 },
    status: 'active',
    revision: 3,
    updatedBy: 'usr_alice',
    updatedAt: '2026-10-25T14:10:00Z',
    fields: [
      {
        id: 'fld_c_id',
        key: 'id',
        name: 'Customer ID',
        type: 'text',
        required: true,
        unique: true,
        order: 1,
        isActive: true,
        isPrimary: false,
        description: 'Permanent unique synthetic customer identifier'
      },
      {
        id: 'fld_c_name',
        key: 'name',
        name: 'Full Name',
        type: 'text',
        required: true,
        unique: false,
        order: 2,
        isActive: true,
        isPrimary: true,
        description: 'Client legal name or preferred display name'
      },
      {
        id: 'fld_c_email',
        key: 'email',
        name: 'Email Address',
        type: 'email',
        required: true,
        unique: true,
        order: 3,
        isActive: true,
        isPrimary: false,
        description: 'Verified communication and login email'
      },
      {
        id: 'fld_c_phone',
        key: 'phone',
        name: 'Phone Number',
        type: 'text',
        required: false,
        unique: false,
        order: 4,
        isActive: true,
        isPrimary: false,
        description: 'International E.164 contact phone'
      },
      {
        id: 'fld_c_tier',
        key: 'tier',
        name: 'Loyalty Tier',
        type: 'enum',
        required: false,
        unique: false,
        enumOptions: ['Standard', 'Silver', 'Gold', 'Platinum VIP'],
        defaultValue: 'Standard',
        order: 5,
        isActive: true,
        isPrimary: false,
        description: 'Rewards program tier determining checkout discounts'
      }
    ]
  },
  {
    id: 'obj_order',
    projectId: 'proj_ecommerce',
    key: 'order',
    singularLabel: 'Order',
    pluralLabel: 'Orders',
    description: 'Header transaction record representing a shopping session checkout.',
    icon: 'ShoppingCart',
    color: '#8b5cf6', // Violet
    position: { x: 440, y: 120 },
    status: 'active',
    revision: 5,
    updatedBy: 'usr_bob',
    updatedAt: '2026-10-26T10:15:00Z',
    fields: [
      {
        id: 'fld_o_no',
        key: 'orderNo',
        name: 'Order Number',
        type: 'text',
        required: true,
        unique: true,
        order: 1,
        isActive: true,
        isPrimary: true,
        description: 'Human-readable invoice/order sequence (e.g. ORD-2026-9081)'
      },
      {
        id: 'fld_o_date',
        key: 'orderDate',
        name: 'Placed At',
        type: 'datetime',
        required: true,
        unique: false,
        order: 2,
        isActive: true,
        isPrimary: false,
        description: 'Timestamp when the checkout was finalized'
      },
      {
        id: 'fld_o_total',
        key: 'totalAmount',
        name: 'Gross Total',
        type: 'decimal',
        required: true,
        unique: false,
        order: 3,
        isActive: true,
        isPrimary: false,
        description: 'Final invoice sum inclusive of shipping and VAT'
      },
      {
        id: 'fld_o_custref',
        key: 'customerRef',
        name: 'Customer Reference',
        type: 'reference',
        required: true,
        unique: false,
        referenceTargetObjectId: 'obj_customer',
        order: 4,
        isActive: true,
        isPrimary: false,
        description: 'Foreign link to the placing Customer'
      },
      {
        id: 'fld_o_status',
        key: 'orderStatus',
        name: 'Fulfillment Status',
        type: 'enum',
        required: true,
        unique: false,
        enumOptions: ['Pending Payment', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'],
        defaultValue: 'Processing',
        order: 5,
        isActive: true,
        isPrimary: false
      }
    ]
  },
  {
    id: 'obj_orderitem',
    projectId: 'proj_ecommerce',
    key: 'orderItem',
    singularLabel: 'Order Line Item',
    pluralLabel: 'Order Line Items',
    description: 'Specific quantity and historical unit price breakdown inside an Order.',
    icon: 'Package',
    color: '#06b6d4', // Cyan
    position: { x: 840, y: 120 },
    status: 'active',
    revision: 2,
    updatedBy: 'usr_bob',
    updatedAt: '2026-10-24T18:00:00Z',
    fields: [
      {
        id: 'fld_oi_id',
        key: 'lineItemId',
        name: 'Item Line ID',
        type: 'text',
        required: true,
        unique: true,
        order: 1,
        isActive: true,
        isPrimary: true
      },
      {
        id: 'fld_oi_orderref',
        key: 'orderRef',
        name: 'Order Reference',
        type: 'reference',
        required: true,
        unique: false,
        referenceTargetObjectId: 'obj_order',
        order: 2,
        isActive: true,
        isPrimary: false
      },
      {
        id: 'fld_oi_prodref',
        key: 'productRef',
        name: 'Product Reference',
        type: 'reference',
        required: true,
        unique: false,
        referenceTargetObjectId: 'obj_product',
        order: 3,
        isActive: true,
        isPrimary: false
      },
      {
        id: 'fld_oi_qty',
        key: 'quantity',
        name: 'Quantity',
        type: 'number',
        required: true,
        unique: false,
        defaultValue: 1,
        order: 4,
        isActive: true,
        isPrimary: false
      },
      {
        id: 'fld_oi_price',
        key: 'unitPrice',
        name: 'Unit Price at Purchase',
        type: 'decimal',
        required: true,
        unique: false,
        order: 5,
        isActive: true,
        isPrimary: false
      }
    ]
  },
  {
    id: 'obj_product',
    projectId: 'proj_ecommerce',
    key: 'product',
    singularLabel: 'Catalog Product',
    pluralLabel: 'Catalog Products',
    description: 'Physical or digital merchandise offered in the online catalog.',
    icon: 'Box',
    color: '#10b981', // Emerald
    position: { x: 840, y: 520 },
    status: 'active',
    revision: 4,
    updatedBy: 'usr_alice',
    updatedAt: '2026-10-25T11:45:00Z',
    fields: [
      {
        id: 'fld_p_sku',
        key: 'sku',
        name: 'Stock Keeping Unit (SKU)',
        type: 'text',
        required: true,
        unique: true,
        order: 1,
        isActive: true,
        isPrimary: true
      },
      {
        id: 'fld_p_name',
        key: 'name',
        name: 'Product Name',
        type: 'text',
        required: true,
        unique: false,
        order: 2,
        isActive: true,
        isPrimary: false
      },
      {
        id: 'fld_p_price',
        key: 'price',
        name: 'Current Retail Price',
        type: 'decimal',
        required: true,
        unique: false,
        order: 3,
        isActive: true,
        isPrimary: false
      },
      {
        id: 'fld_p_stock',
        key: 'inventoryCount',
        name: 'Stock Level',
        type: 'number',
        required: true,
        unique: false,
        defaultValue: 0,
        order: 4,
        isActive: true,
        isPrimary: false
      },
      {
        id: 'fld_p_active',
        key: 'isPublished',
        name: 'Active on Storefront',
        type: 'boolean',
        required: true,
        unique: false,
        defaultValue: true,
        order: 5,
        isActive: true,
        isPrimary: false
      }
    ]
  },
  {
    id: 'obj_payment',
    projectId: 'proj_ecommerce',
    key: 'payment',
    singularLabel: 'Payment Record',
    pluralLabel: 'Payment Records',
    description: 'Financial settlement attempt against an order (Stripe, PayPal, Wire).',
    icon: 'CreditCard',
    color: '#f59e0b', // Amber
    position: { x: 440, y: 520 },
    status: 'active',
    revision: 3,
    updatedBy: 'usr_bob',
    updatedAt: '2026-10-26T08:30:00Z',
    fields: [
      {
        id: 'fld_pm_id',
        key: 'transactionId',
        name: 'Gateway Transaction ID',
        type: 'text',
        required: true,
        unique: true,
        order: 1,
        isActive: true,
        isPrimary: true
      },
      {
        id: 'fld_pm_orderref',
        key: 'orderRef',
        name: 'Order Reference',
        type: 'reference',
        required: true,
        unique: false,
        referenceTargetObjectId: 'obj_order',
        order: 2,
        isActive: true,
        isPrimary: false
      },
      {
        id: 'fld_pm_amount',
        key: 'amount',
        name: 'Amount Settled',
        type: 'decimal',
        required: true,
        unique: false,
        order: 3,
        isActive: true,
        isPrimary: false
      },
      {
        id: 'fld_pm_status',
        key: 'status',
        name: 'Settlement Status',
        type: 'enum',
        required: true,
        unique: false,
        enumOptions: ['Initiated', 'Authorized', 'Captured', 'Refunded', 'Failed'],
        defaultValue: 'Captured',
        order: 4,
        isActive: true,
        isPrimary: false
      },
      {
        id: 'fld_pm_method',
        key: 'paymentMethod',
        name: 'Payment Channel',
        type: 'enum',
        required: true,
        unique: false,
        enumOptions: ['Visa / MasterCard', 'Apple Pay', 'PayPal', 'Direct Bank Transfer', 'Klarna'],
        defaultValue: 'Visa / MasterCard',
        order: 5,
        isActive: true,
        isPrimary: false
      }
    ]
  }
];

export const INITIAL_RELATIONSHIPS: RelationshipDefinition[] = [
  {
    id: 'rel_cust_order',
    projectId: 'proj_ecommerce',
    fromObjectId: 'obj_customer',
    toObjectId: 'obj_order',
    cardinality: '1:N',
    label: 'Places Orders',
    sourceRoleLabel: 'Customer',
    targetRoleLabel: 'Orders',
    deletePolicy: 'restrict', // Cannot delete customer if they have live orders
    createdAt: '2026-09-02T10:00:00Z'
  },
  {
    id: 'rel_order_items',
    projectId: 'proj_ecommerce',
    fromObjectId: 'obj_order',
    toObjectId: 'obj_orderitem',
    cardinality: '1:N',
    label: 'Contains Line Items',
    sourceRoleLabel: 'Parent Order',
    targetRoleLabel: 'Order Items',
    deletePolicy: 'cascade', // Deleting an order cascades and removes its line items
    createdAt: '2026-09-02T10:30:00Z'
  },
  {
    id: 'rel_product_items',
    projectId: 'proj_ecommerce',
    fromObjectId: 'obj_product',
    toObjectId: 'obj_orderitem',
    cardinality: '1:N',
    label: 'Ordered As',
    sourceRoleLabel: 'Product',
    targetRoleLabel: 'Line References',
    deletePolicy: 'restrict',
    createdAt: '2026-09-02T11:00:00Z'
  },
  {
    id: 'rel_order_payment',
    projectId: 'proj_ecommerce',
    fromObjectId: 'obj_order',
    toObjectId: 'obj_payment',
    cardinality: '1:N',
    label: 'Settled By',
    sourceRoleLabel: 'Order',
    targetRoleLabel: 'Payment Records',
    deletePolicy: 'restrict',
    createdAt: '2026-09-02T11:20:00Z'
  }
];

export const INITIAL_RECORDS: RecordItem[] = [
  // Customers
  {
    id: 'rec_c_1',
    objectId: 'obj_customer',
    projectId: 'proj_ecommerce',
    values: {
      id: 'CUST-1001',
      name: 'Sarah Connor',
      email: 's.connor@cyberdyne.org',
      phone: '+1 (415) 882-9011',
      tier: 'Platinum VIP'
    },
    createdBy: 'usr_alice',
    createdAt: '2026-09-10T14:00:00Z',
    updatedAt: '2026-09-10T14:00:00Z'
  },
  {
    id: 'rec_c_2',
    objectId: 'obj_customer',
    projectId: 'proj_ecommerce',
    values: {
      id: 'CUST-1002',
      name: 'Marcus Brody',
      email: 'm.brody@museum.edu',
      phone: '+1 (212) 555-0199',
      tier: 'Gold'
    },
    createdBy: 'usr_alice',
    createdAt: '2026-09-12T09:30:00Z',
    updatedAt: '2026-09-12T09:30:00Z'
  },
  {
    id: 'rec_c_3',
    objectId: 'obj_customer',
    projectId: 'proj_ecommerce',
    values: {
      id: 'CUST-1003',
      name: 'Elena Rostova',
      email: 'elena.rostova@techcorp.io',
      phone: '+44 20 7946 0912',
      tier: 'Silver'
    },
    createdBy: 'usr_bob',
    createdAt: '2026-10-01T12:00:00Z',
    updatedAt: '2026-10-01T12:00:00Z'
  },

  // Products
  {
    id: 'rec_p_1',
    objectId: 'obj_product',
    projectId: 'proj_ecommerce',
    values: {
      sku: 'PRD-AERO-01',
      name: 'AeroPulse Wireless Studio Headphones',
      price: 249.99,
      inventoryCount: 84,
      isPublished: true
    },
    createdBy: 'usr_alice',
    createdAt: '2026-09-05T10:00:00Z',
    updatedAt: '2026-09-05T10:00:00Z'
  },
  {
    id: 'rec_p_2',
    objectId: 'obj_product',
    projectId: 'proj_ecommerce',
    values: {
      sku: 'PRD-OMNI-02',
      name: 'OmniDesk Pro Mechanical Keyboard',
      price: 189.50,
      inventoryCount: 42,
      isPublished: true
    },
    createdBy: 'usr_alice',
    createdAt: '2026-09-05T10:15:00Z',
    updatedAt: '2026-09-05T10:15:00Z'
  },
  {
    id: 'rec_p_3',
    objectId: 'obj_product',
    projectId: 'proj_ecommerce',
    values: {
      sku: 'PRD-ZEN-03',
      name: 'Zenith 4K HDR Color-Calibrated Monitor',
      price: 799.00,
      inventoryCount: 15,
      isPublished: true
    },
    createdBy: 'usr_bob',
    createdAt: '2026-09-08T11:00:00Z',
    updatedAt: '2026-09-08T11:00:00Z'
  },

  // Orders
  {
    id: 'rec_o_1',
    objectId: 'obj_order',
    projectId: 'proj_ecommerce',
    values: {
      orderNo: 'ORD-2026-1044',
      orderDate: '2026-10-20T14:32:00Z',
      totalAmount: 439.49,
      customerRef: 'rec_c_1',
      orderStatus: 'Delivered'
    },
    createdBy: 'usr_bob',
    createdAt: '2026-10-20T14:32:00Z',
    updatedAt: '2026-10-22T08:00:00Z'
  },
  {
    id: 'rec_o_2',
    objectId: 'obj_order',
    projectId: 'proj_ecommerce',
    values: {
      orderNo: 'ORD-2026-1089',
      orderDate: '2026-10-24T18:10:00Z',
      totalAmount: 799.00,
      customerRef: 'rec_c_2',
      orderStatus: 'Processing'
    },
    createdBy: 'usr_alice',
    createdAt: '2026-10-24T18:10:00Z',
    updatedAt: '2026-10-24T18:10:00Z'
  },

  // Order Items
  {
    id: 'rec_oi_1',
    objectId: 'obj_orderitem',
    projectId: 'proj_ecommerce',
    values: {
      lineItemId: 'LINE-1044-A',
      orderRef: 'rec_o_1',
      productRef: 'rec_p_1',
      quantity: 1,
      unitPrice: 249.99
    },
    createdBy: 'usr_bob',
    createdAt: '2026-10-20T14:33:00Z',
    updatedAt: '2026-10-20T14:33:00Z'
  },
  {
    id: 'rec_oi_2',
    objectId: 'obj_orderitem',
    projectId: 'proj_ecommerce',
    values: {
      lineItemId: 'LINE-1044-B',
      orderRef: 'rec_o_1',
      productRef: 'rec_p_2',
      quantity: 1,
      unitPrice: 189.50
    },
    createdBy: 'usr_bob',
    createdAt: '2026-10-20T14:33:00Z',
    updatedAt: '2026-10-20T14:33:00Z'
  },
  {
    id: 'rec_oi_3',
    objectId: 'obj_orderitem',
    projectId: 'proj_ecommerce',
    values: {
      lineItemId: 'LINE-1089-A',
      orderRef: 'rec_o_2',
      productRef: 'rec_p_3',
      quantity: 1,
      unitPrice: 799.00
    },
    createdBy: 'usr_alice',
    createdAt: '2026-10-24T18:11:00Z',
    updatedAt: '2026-10-24T18:11:00Z'
  },

  // Payments
  {
    id: 'rec_pm_1',
    objectId: 'obj_payment',
    projectId: 'proj_ecommerce',
    values: {
      transactionId: 'TXN-90921-STRIPE',
      orderRef: 'rec_o_1',
      amount: 439.49,
      status: 'Captured',
      paymentMethod: 'Apple Pay'
    },
    createdBy: 'usr_bob',
    createdAt: '2026-10-20T14:35:00Z',
    updatedAt: '2026-10-20T14:35:00Z'
  },
  {
    id: 'rec_pm_2',
    objectId: 'obj_payment',
    projectId: 'proj_ecommerce',
    values: {
      transactionId: 'TXN-91104-VISA',
      orderRef: 'rec_o_2',
      amount: 799.00,
      status: 'Captured',
      paymentMethod: 'Visa / MasterCard'
    },
    createdBy: 'usr_alice',
    createdAt: '2026-10-24T18:12:00Z',
    updatedAt: '2026-10-24T18:12:00Z'
  }
];

export const INITIAL_COMMENTS: CommentItem[] = [
  {
    id: 'cmt_1',
    projectId: 'proj_ecommerce',
    targetType: 'object',
    targetId: 'obj_customer',
    targetName: 'Customer',
    authorId: 'usr_bob',
    authorName: 'Bob Martinez',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    body: '@Alice should we add billingAddress and shippingAddress JSON or break them out into Address objects for multi-address checkout?',
    createdAt: '2026-10-25T15:20:00Z'
  },
  {
    id: 'cmt_2',
    projectId: 'proj_ecommerce',
    targetType: 'relationship',
    targetId: 'rel_cust_order',
    targetName: 'Customer -> Order (1:N)',
    authorId: 'usr_alice',
    authorName: 'Alice Henderson',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    body: 'Confirmed with legal: keep DeletePolicy as RESTRICT so audit history is never unintentionally wiped.',
    createdAt: '2026-10-26T09:00:00Z'
  },
  {
    id: 'cmt_3',
    projectId: 'proj_ecommerce',
    targetType: 'field',
    targetId: 'fld_pm_status',
    targetName: 'Payment.status',
    authorId: 'usr_charlie',
    authorName: 'Charlie Lin',
    authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    body: 'Looks solid for our Q4 payment audit compliance report.',
    createdAt: '2026-10-26T11:30:00Z'
  }
];

export const INITIAL_ACTIVITY: ActivityLog[] = [
  {
    id: 'act_1',
    projectId: 'proj_ecommerce',
    userId: 'usr_alice',
    userName: 'Alice Henderson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    action: 'Created project and initialized core entities',
    entityType: 'object',
    entityName: 'Customer & Order',
    timestamp: '2026-10-24T09:00:00Z'
  },
  {
    id: 'act_2',
    projectId: 'proj_ecommerce',
    userId: 'usr_bob',
    userName: 'Bob Martinez',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    action: 'Configured 1:N relationship with Cascade delete policy',
    entityType: 'relationship',
    entityName: 'Order -> OrderItem',
    timestamp: '2026-10-25T11:15:00Z'
  },
  {
    id: 'act_3',
    projectId: 'proj_ecommerce',
    userId: 'usr_bob',
    userName: 'Bob Martinez',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    action: 'Added enum field "tier" to Customer',
    entityType: 'field',
    entityName: 'tier',
    timestamp: '2026-10-25T14:10:00Z'
  },
  {
    id: 'act_4',
    projectId: 'proj_ecommerce',
    userId: 'usr_alice',
    userName: 'Alice Henderson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    action: 'Published snapshot version v1.0.0',
    entityType: 'version',
    entityName: 'v1.0.0 (Base E-Comm Release)',
    timestamp: '2026-10-25T18:00:00Z'
  }
];

export const INITIAL_VERSIONS: ProjectVersion[] = [
  {
    id: 'ver_1',
    projectId: 'proj_ecommerce',
    versionNumber: '1.0.0',
    label: 'Initial Architecture Baseline',
    notes: 'Established Customer, Order, Product, and Payment data structures with foreign constraints.',
    publishedBy: 'Alice Henderson',
    publishedAt: '2026-10-25T18:00:00Z',
    snapshot: {
      objects: JSON.parse(JSON.stringify(INITIAL_OBJECTS)),
      relationships: JSON.parse(JSON.stringify(INITIAL_RELATIONSHIPS))
    }
  }
];

export const INITIAL_INVITATIONS: Invitation[] = [
  {
    id: 'inv_101',
    workspaceId: 'ws_acme',
    projectId: 'proj_ecommerce',
    email: 'david.devops@externalpartner.com',
    role: 'editor',
    expiresAt: '2026-11-02T23:59:59Z',
    tokenHash: 'tok_89ab327c19',
    status: 'pending',
    invitedBy: 'Alice Henderson'
  },
  {
    id: 'inv_102',
    workspaceId: 'ws_acme',
    projectId: 'proj_ecommerce',
    email: 'sarah.analyst@finmetrics.io',
    role: 'viewer',
    expiresAt: '2026-10-31T23:59:59Z',
    tokenHash: 'tok_55dc771a2e',
    status: 'pending',
    invitedBy: 'Alice Henderson'
  }
];
