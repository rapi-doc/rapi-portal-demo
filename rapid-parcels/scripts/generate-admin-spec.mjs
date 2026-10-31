#!/usr/bin/env node
/**
 * Writes specs/admin.json: the Rapid Parcels Admin API, a deliberately large spec (about 150 operations)
 * for performance, search and navigation tests. Deterministic: the same input always gives the same file.
 *
 *   node scripts/generate-admin-spec.mjs
 *
 * Every resource gets list/create/get/update/delete (read-only resources: list/get), plus an optional action
 * and, for some, a deprecated PUT that PATCH replaced. GET needs admin:read, everything else admin:write.
 */

import fs from 'node:fs';

const field = {
  id: (prefix) => ({ type: 'string', pattern: `^${prefix}_[A-Z0-9]{8}$`, readOnly: true, example: `${prefix}_7K2M4Q9X` }),
  name: (example) => ({ type: 'string', minLength: 1, maxLength: 120, example }),
  email: { type: 'string', format: 'email', example: 'jane.doe@rapidparcels.example' },
  url: { type: 'string', format: 'uri', example: 'https://shop.rapidparcels.example/hooks' },
  bool: (example = true) => ({ type: 'boolean', example }),
  int: (min, max, example) => ({ type: 'integer', minimum: min, maximum: max, example }),
  enum: (values) => ({ type: 'string', enum: values, example: values[0] }),
  time: { type: 'string', format: 'date-time', readOnly: true, example: '2026-11-02T08:15:00Z' },
  date: { type: 'string', format: 'date', example: '2026-12-31' },
  tags: { type: 'array', items: { type: 'string' }, example: ['eu', 'priority'] },
  ip: { type: 'string', format: 'ipv4', example: '203.0.113.10' },
  cidr: { type: 'string', pattern: '^\\d{1,3}(\\.\\d{1,3}){3}/\\d{1,2}$', example: '203.0.113.0/24' },
  ref: (name) => ({ $ref: `#/components/schemas/${name}` }),
};

/** [path, tag, schema name, id prefix, fields, options] */
const RESOURCES = [
  ['users', 'Users', 'User', 'usr', { email: field.email, name: field.name('Jane Doe'), role: field.enum(['viewer', 'editor', 'owner']), mfa_enabled: field.bool(false), team_id: field.id('team') }, { action: ['suspend', 'Suspend a user'], deprecatedPut: true }],
  ['teams', 'Teams', 'Team', 'team', { name: field.name('Shipping operations'), description: { type: 'string', example: 'Runs the Berlin hub' }, member_count: field.int(0, 10000, 12) }, { action: ['archive', 'Archive a team'] }],
  ['roles', 'Roles', 'Role', 'role', { name: field.name('billing-viewer'), permissions: { type: 'array', items: { type: 'string' }, example: ['billing:read'] }, system: field.bool(false) }, { deprecatedPut: true }],
  ['invitations', 'Invitations', 'Invitation', 'inv', { email: field.email, role: field.enum(['viewer', 'editor', 'owner']), expires_on: field.date }, { action: ['resend', 'Resend an invitation'] }],
  ['organizations', 'Organizations', 'Organization', 'org', { name: field.name('Rapid Parcels Demo Shop'), settings: field.ref('OrganizationSettings'), plan: field.enum(['starter', 'business', 'enterprise']) }, { action: ['transfer', 'Transfer ownership'], deprecatedPut: true }],
  ['projects', 'Projects', 'Project', 'prj', { name: field.name('Checkout integration'), organization_id: field.id('org'), environment_ids: { type: 'array', items: field.id('env') } }, {}],
  ['environments', 'Environments', 'Environment', 'env', { name: field.enum(['production', 'staging', 'development']), project_id: field.id('prj'), region: field.enum(['eu-central', 'eu-west', 'us-east']) }, { action: ['promote', 'Promote configuration to the next environment'] }],
  ['api-keys', 'API keys', 'ApiKey', 'key', { name: field.name('Warehouse scanner'), prefix: { type: 'string', readOnly: true, example: 'rp_live_7K2M' }, scopes: { type: 'array', items: { type: 'string' }, example: ['tracking:read'] }, expires_on: field.date }, { action: ['rotate', 'Rotate an API key'], deprecatedPut: true }],
  ['service-accounts', 'Service accounts', 'ServiceAccount', 'sva', { name: field.name('nightly-export'), role: field.enum(['viewer', 'editor']), disabled: field.bool(false) }, { action: ['disable', 'Disable a service account'] }],
  ['secrets', 'Secrets', 'Secret', 'sec', { name: field.name('CARRIER_SFTP_PASSWORD'), environment_id: field.id('env'), version: field.int(1, 1000, 3) }, { action: ['rotate', 'Rotate a secret'] }],
  ['webhook-endpoints', 'Webhook endpoints', 'WebhookEndpoint', 'whe', { url: field.url, events: { type: 'array', items: field.enum(['shipment.status_changed', 'shipment.delivered', 'invoice.paid']) }, enabled: field.bool() }, { action: ['test', 'Send a test event'], deprecatedPut: true }],
  ['notifications', 'Notifications', 'NotificationRule', 'ntf', { channel: field.enum(['email', 'slack', 'sms']), target: { type: 'string', example: '#ops-alerts' }, events: field.tags }, {}],
  ['email-templates', 'Email templates', 'EmailTemplate', 'etp', { key: field.enum(['shipment_booked', 'out_for_delivery', 'delivered']), subject: field.name('Your parcel is on its way'), locale: { type: 'string', pattern: '^[a-z]{2}-[A-Z]{2}$', example: 'fr-FR' } }, { action: ['preview', 'Render a preview'] }],
  ['feature-flags', 'Feature flags', 'FeatureFlag', 'ff', { key: field.name('new-label-printer'), enabled: field.bool(false), rollout_percent: field.int(0, 100, 25) }, { deprecatedPut: true }],
  ['quotas', 'Quotas', 'Quota', 'quo', { resource: field.enum(['shipments_per_day', 'api_calls_per_minute', 'labels_per_day']), limit: field.int(1, 1000000, 5000), organization_id: field.id('org') }, {}],
  ['rate-limits', 'Rate limits', 'RateLimit', 'rlm', { route: { type: 'string', example: '/shipments' }, requests_per_minute: field.int(1, 100000, 600), burst: field.int(1, 10000, 100) }, { deprecatedPut: true }],
  ['ip-allowlists', 'IP allowlists', 'IpAllowlist', 'ipa', { name: field.name('Berlin office'), cidrs: { type: 'array', items: field.cidr } }, {}],
  ['sso-connections', 'SSO connections', 'SsoConnection', 'sso', { provider: field.enum(['oidc', 'saml']), issuer: field.url, domains: { type: 'array', items: { type: 'string' }, example: ['rapidparcels.example'] }, enforced: field.bool(false) }, { action: ['verify', 'Verify the connection'] }],
  ['scim-tokens', 'SCIM tokens', 'ScimToken', 'scm', { name: field.name('Okta provisioning'), last_used_at: field.time }, { action: ['revoke', 'Revoke a token'] }],
  ['hubs', 'Hubs', 'Hub', 'hub', { code: { type: 'string', pattern: '^HUB-[A-Z]{3}$', example: 'HUB-LIL' }, city: field.name('Lille'), country: { type: 'string', pattern: '^[A-Z]{2}$', example: 'FR' }, capacity_per_day: field.int(0, 1000000, 40000) }, { action: ['close', 'Close a hub temporarily'] }],
  ['maintenance-windows', 'Maintenance windows', 'MaintenanceWindow', 'mnt', { starts_at: { type: 'string', format: 'date-time', example: '2026-11-08T01:00:00Z' }, ends_at: { type: 'string', format: 'date-time', example: '2026-11-08T03:00:00Z' }, services: field.tags }, {}],
  ['data-exports', 'Data exports', 'DataExport', 'exp', { dataset: field.enum(['shipments', 'invoices', 'audit_logs']), format: field.enum(['csv', 'parquet']), status: { ...field.enum(['queued', 'running', 'done', 'failed']), readOnly: true } }, { action: ['cancel', 'Cancel an export'] }],
  ['retention-policies', 'Retention policies', 'RetentionPolicy', 'ret', { dataset: field.enum(['shipments', 'tracking_events', 'audit_logs']), keep_days: field.int(1, 3650, 730) }, {}],
  ['audit-logs', 'Audit logs', 'AuditLogEntry', 'aud', { actor: field.email, action: { type: 'string', example: 'api_key.rotated' }, target: { type: 'string', example: 'key_7K2M4Q9X' }, ip: field.ip, at: field.time }, { readOnly: true, action: ['export', 'Export audit log entries'] }],
  ['sessions', 'Sessions', 'Session', 'ses', { user_id: field.id('usr'), ip: field.ip, user_agent: { type: 'string', example: 'Mozilla/5.0' }, last_seen_at: field.time }, { readOnly: true, action: ['revoke', 'Revoke a session'] }],
  ['regions', 'Regions', 'Region', 'reg', { code: field.enum(['eu-central', 'eu-west', 'us-east']), status: field.enum(['operational', 'degraded', 'maintenance']) }, { readOnly: true }],
];

const singular = (tag) => tag.replace(/ies$/, 'y').replace(/s$/, '').toLowerCase();
const exampleOf = (props) =>
  Object.fromEntries(
    Object.entries(props).map(([k, v]) => [k, v.$ref ? ORG_SETTINGS_EXAMPLE : v.example ?? (v.items?.example ? [v.items.example] : undefined)])
  );

const ORG_SETTINGS_EXAMPLE = {
  branding: { colors: { primary: '#0f7ae5', accent: '#ff8a00' }, logo: { light: 'https://cdn.rapidparcels.example/logo.svg', dark: 'https://cdn.rapidparcels.example/logo-dark.svg' } },
  shipping: { defaults: { service: 'economy', insurance: { enabled: true, max_value: { amount: '500.00', currency: 'EUR' } } } },
  security: { sessions: { idle_timeout_minutes: 30, mfa: { required: true, methods: ['totp', 'webauthn'] } } },
};

const security = (write) => [{ oauth2: [write ? 'admin:write' : 'admin:read'] }, { bearerAuth: [] }];
const problem = (status, description) => ({ description, content: { 'application/problem+json': { schema: { $ref: '#/components/schemas/Problem' } } } });
const errors = (...codes) => Object.fromEntries(codes.map((c) => [String(c), { $ref: `#/components/responses/E${c}` }]));

const paths = {};
const schemas = {};
let operations = 0;
const op = (o) => {
  operations++;
  return o;
};

for (const [path, tag, schemaName, prefix, props, options] of RESOURCES) {
  const one = singular(tag);
  const writable = Object.fromEntries(Object.entries(props).filter(([, v]) => !v.readOnly));
  schemas[schemaName] = { type: 'object', required: ['id'], properties: { id: field.id(prefix), ...props, created_at: field.time } };
  if (!options.readOnly) schemas[`${schemaName}Input`] = { type: 'object', properties: writable };
  const ref = { $ref: `#/components/schemas/${schemaName}` };
  const example = { id: `${prefix}_7K2M4Q9X`, ...exampleOf(props), created_at: '2026-11-02T08:15:00Z' };
  const idParam = { name: `${schemaName.charAt(0).toLowerCase()}${schemaName.slice(1)}Id`, in: 'path', required: true, schema: field.id(prefix) };
  const item = `/${path}/{${idParam.name}}`;

  paths[`/${path}`] = {
    get: op({
      operationId: `list${schemaName}s`,
      tags: [tag],
      summary: `List ${tag.toLowerCase()}`,
      security: security(false),
      parameters: [{ $ref: '#/components/parameters/Limit' }, { $ref: '#/components/parameters/Cursor' }, { $ref: '#/components/parameters/Query' }],
      responses: {
        200: {
          description: `A page of ${tag.toLowerCase()}.`,
          content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: ref }, next_cursor: { type: ['string', 'null'] } } }, example: { data: [example], next_cursor: null } } },
        },
        ...errors(401, 403),
      },
    }),
    ...(!options.readOnly && {
      post: op({
        operationId: `create${schemaName}`,
        tags: [tag],
        summary: `Create a ${one}`,
        security: security(true),
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: `#/components/schemas/${schemaName}Input` }, example: exampleOf(writable) } } },
        responses: { 201: { description: `The new ${one}.`, content: { 'application/json': { schema: ref, example } } }, ...errors(400, 401, 403, 409) },
      }),
    }),
  };
  paths[item] = {
    parameters: [idParam],
    get: op({
      operationId: `get${schemaName}`,
      tags: [tag],
      summary: `Get a ${one}`,
      security: security(false),
      responses: { 200: { description: `The ${one}.`, content: { 'application/json': { schema: ref, example } } }, ...errors(401, 403, 404) },
    }),
    ...(!options.readOnly && {
      patch: op({
        operationId: `update${schemaName}`,
        tags: [tag],
        summary: `Update a ${one}`,
        security: security(true),
        requestBody: { required: true, content: { 'application/merge-patch+json': { schema: { $ref: `#/components/schemas/${schemaName}Input` } } } },
        responses: { 200: { description: `The updated ${one}.`, content: { 'application/json': { schema: ref, example } } }, ...errors(400, 401, 403, 404) },
      }),
      delete: op({
        operationId: `delete${schemaName}`,
        tags: [tag],
        summary: `Delete a ${one}`,
        security: security(true),
        responses: { 204: { description: 'Deleted.' }, ...errors(401, 403, 404) },
      }),
    }),
    ...(options.deprecatedPut && {
      put: op({
        operationId: `replace${schemaName}`,
        tags: [tag],
        summary: `Replace a ${one}`,
        description: 'Deprecated: use PATCH, which only changes the fields you send. PUT will be removed in v3.',
        deprecated: true,
        security: security(true),
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: `#/components/schemas/${schemaName}Input` } } } },
        responses: { 200: { description: `The replaced ${one}.`, content: { 'application/json': { schema: ref } } }, ...errors(400, 401, 403, 404) },
      }),
    }),
  };
  if (options.action) {
    const [verb, summary] = options.action;
    paths[`${item}/${verb}`] = {
      parameters: [idParam],
      post: op({
        operationId: `${verb}${schemaName}`,
        tags: [tag],
        summary,
        security: security(true),
        responses: { 202: { description: 'Accepted; the change is applied in the background.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Job' } } } }, ...errors(401, 403, 404, 409) },
      }),
    };
  }
}

// Deep nesting: organization settings, five levels down.
schemas.OrganizationSettings = {
  type: 'object',
  description: 'Organization-wide settings. Deliberately deep, to test nested schema rendering.',
  properties: {
    branding: {
      type: 'object',
      properties: {
        colors: { type: 'object', properties: { primary: { type: 'string', pattern: '^#[0-9a-f]{6}$' }, accent: { type: 'string', pattern: '^#[0-9a-f]{6}$' } } },
        logo: { type: 'object', properties: { light: { type: 'string', format: 'uri' }, dark: { type: 'string', format: 'uri' } } },
      },
    },
    shipping: {
      type: 'object',
      properties: {
        defaults: {
          type: 'object',
          properties: {
            service: { type: 'string', enum: ['economy', 'express', 'freight'] },
            insurance: {
              type: 'object',
              properties: {
                enabled: { type: 'boolean' },
                max_value: { type: 'object', properties: { amount: { type: 'string', pattern: '^\\d+\\.\\d{2}$' }, currency: { type: 'string', pattern: '^[A-Z]{3}$' } } },
              },
            },
          },
        },
      },
    },
    security: {
      type: 'object',
      properties: {
        sessions: {
          type: 'object',
          properties: {
            idle_timeout_minutes: { type: 'integer', minimum: 5, maximum: 1440 },
            mfa: { type: 'object', properties: { required: { type: 'boolean' }, methods: { type: 'array', items: { type: 'string', enum: ['totp', 'webauthn', 'sms'] } } } },
          },
        },
      },
    },
  },
};
schemas.Job = { type: 'object', required: ['id', 'status'], properties: { id: field.id('job'), status: field.enum(['queued', 'running', 'done', 'failed']), created_at: field.time } };
schemas.Problem = { type: 'object', required: ['type', 'title', 'status'], properties: { type: { type: 'string', format: 'uri' }, title: { type: 'string' }, status: { type: 'integer' }, detail: { type: 'string' } } };

const spec = {
  openapi: '3.1.0',
  info: {
    title: 'Admin API',
    version: '2.0.0',
    summary: 'Platform administration (internal).',
    description: [
      'Everything a Rapid Parcels platform admin manages: users, teams, keys, SSO, hubs, quotas, exports and audit logs.',
      '',
      `This spec is deliberately large (${operations} operations, generated by \`scripts/generate-admin-spec.mjs\`) to test performance, search and navigation.`,
      '',
      '**Authorization.** Access tokens for `https://api.rapidocui.com`: `admin:read` for GET, `admin:write` for everything else.',
    ].join('\n'),
    contact: { name: 'Rapid Parcels Platform Team', email: 'platform@rapidparcels.example' },
  },
  servers: [
    { url: 'http://localhost:4010/admin', description: 'Mock server (rapidoc mock)' },
    { url: 'https://api.rapidparcels.example/v1/admin', description: 'Production (documentation only)' },
  ],
  tags: RESOURCES.map(([, tag]) => ({ name: tag })),
  paths,
  components: {
    securitySchemes: {
      oauth2: {
        type: 'oauth2',
        description: 'Sign in with your Rapid Parcels staff account (Auth0). Tokens are issued for `https://api.rapidocui.com`.',
        flows: {
          authorizationCode: {
            authorizationUrl: 'https://rapidocui.us.auth0.com/authorize',
            tokenUrl: 'https://rapidocui.us.auth0.com/oauth/token',
            scopes: { 'admin:read': 'Read users, keys and audit logs', 'admin:write': 'Manage users and keys' },
          },
        },
      },
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Paste an access token for `https://api.rapidocui.com` with the permission listed on the operation.' },
    },
    parameters: {
      Limit: { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
      Cursor: { name: 'cursor', in: 'query', schema: { type: 'string' } },
      Query: { name: 'q', in: 'query', description: 'Free-text filter.', schema: { type: 'string' } },
    },
    responses: {
      E400: problem(400, 'The request is invalid.'),
      E401: problem(401, 'No access token, or it is invalid or expired.'),
      E403: problem(403, 'The token lacks the permission this operation needs.'),
      E404: problem(404, 'Not found.'),
      E409: problem(409, 'The change conflicts with the current state.'),
    },
    schemas,
  },
};

const out = new URL('../specs/admin.json', import.meta.url);
fs.writeFileSync(out, `${JSON.stringify(spec, null, 2)}\n`);
console.log(`Wrote specs/admin.json: ${operations} operations, ${Object.keys(paths).length} paths, ${RESOURCES.length} tags`);
