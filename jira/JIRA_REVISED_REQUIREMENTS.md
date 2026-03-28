# Jira Clone Revised Requirements

## Audit Summary
The current app had a solid base, but it was still closer to a generic project tracker than a Jira-style management tool.

### Main gaps found
- issues looked like simple tasks, not Jira issues
- no project key or issue key model
- issue type and issue priority were missing
- backlog and board filtering were too limited
- issue detail view lacked reporter and other metadata
- project creation did not express Jira project identity well
- optional project end date handling was weak on the backend

## Revised Product Goal
Build a Jira-style management app focused on:
- project-based issue tracking
- backlog management
- Kanban board execution
- issue metadata clarity
- fast search and filtering
- real backend persistence

## Core Requirements

### 1. Project identity
Each project must have:
- unique project key, like `WEB`, `API`, `SEC`
- project name
- description
- status
- priority
- start date
- optional end date
- tags

### 2. Issue identity
Each issue must have:
- issue key, like `WEB-1`
- issue type: `story`, `task`, `bug`, `epic`
- title
- description
- workflow status
- issue priority
- reporter
- assignee
- due date
- created and updated timestamps

### 3. Backlog experience
The backlog must support:
- search by issue key, title, assignee, reporter, description
- filtering by project
- filtering by issue status
- filtering by issue type
- filtering by priority
- inline status changes
- create, edit, delete issue actions

### 4. Board experience
The board must support:
- multi-project view
- project filter
- search filter
- issue type filter
- drag and drop between workflow columns
- create and edit issue flows
- richer issue cards with issue key and metadata

### 5. Issue detail experience
Issue detail should show:
- issue key
- issue type
- priority
- project
- reporter
- assignee
- due date
- created and updated timestamps
- description

### 6. Search behavior
Global search should support:
- project key and project name
- issue key
- issue title and description
- reporter and assignee

### 7. Backend requirements
The backend should persist:
- project keys
- issue keys
- issue type
- issue priority
- reporter
- optional project end date

It should also auto-generate:
- project keys when omitted
- sequential issue keys per project

## Implementation Priority

### Phase 1
- project key support
- issue key support
- issue type support
- issue priority support
- reporter support
- board and backlog filters
- richer issue cards and detail drawer

### Phase 2
- auth protection for project and issue APIs
- sprint planning model
- saved filters
- comments and activity history
- attachments
- assignee directory instead of plain text

### Phase 3
- permissions per project
- dashboards like Jira gadgets
- notifications
- advanced reporting
- workflow administration
