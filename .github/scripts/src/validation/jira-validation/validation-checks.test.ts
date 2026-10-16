import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { JiraClient } from '../../jira-client';
import type { JiraIssue } from '../../types/index';
import { REQUIRED_COMPONENT } from '../../types/index';
import { validateTicket } from './validation-checks';

const baseIssue = (overrides: Partial<JiraIssue['fields']> = {}): JiraIssue => ({
  fields: {
    assignee: null,
    components: [{ id: '1', name: REQUIRED_COMPONENT }],
    description: null,
    fixVersions: [{ archived: false, id: '1', name: 'CNV v5.1.0', released: false }],
    issuelinks: [],
    issuetype: { id: '10001', name: 'Story', subtask: false },
    labels: [],
    priority: { id: '3', name: 'Normal' },
    reporter: null,
    status: {
      id: '1',
      name: 'New',
      statusCategory: { key: 'new', name: 'To Do' },
    },
    summary: 'Example ticket',
    customfield_10016: 3,
    customfield_10464: { value: 'Product / Portfolio Work' },
    ...overrides,
  },
  id: '1',
  key: 'CNV-1',
  self: 'https://example.test/CNV-1',
});

const mockJira = (): JiraClient =>
  ({
    discoverCustomFields: async () => ({
      activityTypeFieldId: 'customfield_10464',
      storyPointsFieldId: 'customfield_10016',
    }),
  }) as JiraClient;

describe('validateTicket priority check', () => {
  it('passes when priority is set to a real value', async () => {
    const checks = await validateTicket(mockJira(), baseIssue(), '5.1.0', 'main');
    const priorityCheck = checks.find((check) => check.name === 'Priority');
    assert.equal(priorityCheck?.passed, true);
    assert.match(priorityCheck?.message ?? '', /Priority: Normal/);
  });

  it('fails when priority is Undefined', async () => {
    const checks = await validateTicket(
      mockJira(),
      baseIssue({ priority: { id: '5', name: 'Undefined' } }),
      '5.1.0',
      'main',
    );
    const priorityCheck = checks.find((check) => check.name === 'Priority');
    assert.equal(priorityCheck?.passed, false);
    assert.match(priorityCheck?.message ?? '', /Priority is not set/);
  });

  it('fails when priority is missing', async () => {
    const checks = await validateTicket(
      mockJira(),
      baseIssue({ priority: null }),
      '5.1.0',
      'main',
    );
    const priorityCheck = checks.find((check) => check.name === 'Priority');
    assert.equal(priorityCheck?.passed, false);
  });
});
