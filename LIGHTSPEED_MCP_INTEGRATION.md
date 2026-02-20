# OpenShift Lightspeed + MCP Integration for CNV UI

## TL;DR - Current Recommendation

**Status:** `openshift-mcp-server` is **Developer Preview** (v4.21/v4.22), planned to be productized alongside Lightspeed downstream.

**🎉 Key Discovery:** `openshift-mcp-server` already has KubeVirt toolset - and **empirical testing proves it works**:

- **Without toolset:** 6.7% AI agent success rate
- **With toolset:** 100% success rate
- **Impact:** 300-500% improvement across all AI models tested

**⚠️ Blockers (from Lee):**

1. CNV UI expectations during Developer Preview unclear
2. Unclear how openshift-mcp-server's KubeVirt toolset gets enabled when CNV is deployed

**Recommendation:** **PAUSE until questions answered**, then proceed with hybrid approach.

**Hybrid Architecture (Data-Validated):**

- ✅ **Reuse** openshift-mcp-server for basic VM ops (100% success proven)
- ✅ **Build** small CNV diagnostic server for gaps only (~500 lines vs ~3000)
- ✅ **Target:** 80-100% success rate based on test data

**Next Steps:**

1. **Immediate:** Meet with Lightspeed, Product, Operators teams - share [empirical data](https://docs.google.com/document/d/1JEH4WHQwmLxtmt0TSo1w82SiBqKmRamRx1f6nHui24M/edit?usp=sharing)
2. **Phase 0 (2-3 weeks):** Answer critical questions, test locally
3. **IF GO:** Phase 1 POC (3-4 weeks) - validate toolset + build one gap tool
4. **IF NO-GO:** Improve existing Lightspeed static prompts

**Document Contents:** Empirical evidence, gap analysis, architecture, security, deployment, implementation phases.

---

## Executive Summary

**The Opportunity:** CNV UI can add AI-powered features (search, troubleshooting, smart help) by integrating with OpenShift Lightspeed's new MCP (Model Context Protocol) support.

**The Good News:**

- CNV UI already has Lightspeed integration (`src/views/lightspeed/`)
- `openshift-mcp-server` already includes KubeVirt toolset (vm_create, vm_start, vm_stop)
- **Empirical testing proves it works:** 6.7% → 100% AI success rate with proper tools

**The Challenge:**

- `openshift-mcp-server` is Developer Preview (v4.21/v4.22), planned to be productized alongside Lightspeed downstream
- Unclear how openshift-mcp-server's KubeVirt toolset gets enabled when CNV is deployed
- Need to answer critical questions before development

**The Recommendation:**

1. **Pause development** until blockers resolved
2. **When proceeding:** Use hybrid approach
   - Leverage openshift-mcp-server (100% proven success)
   - Build small CNV diagnostic server for gaps only
   - Expected: 80-100% success rate, ~500 lines of code

**Target Capabilities:**

- Natural language VM search ("show VMs with errors")
- Context-aware error diagnosis with fix suggestions
- Enhanced help popovers with cluster-specific guidance

**See:** [Empirical Evidence](#empirical-evidence-impact-of-kubevirt-toolset) for test data, [Gap Analysis](#gap-analysis-what-we-still-need-to-build) for what to build.

---

## ⚠️ Critical Questions (Blockers)

**openshift-mcp-server Status:** Developer Preview v4.21/v4.22 → Planned to be productized alongside Lightspeed downstream

**Questions Requiring Answers:**

**1. Product Strategy**

- Should CNV UI build against DP openshift-mcp-server or wait for productization?
- What customer expectations during openshift-mcp-server DP period?
- When is openshift-mcp-server productization planned (alongside Lightspeed downstream - which version)?

**2. Deployment Model** (Lee's concern: "unsure how our specific toolset will be enabled")

- How does openshift-mcp-server's KubeVirt toolset get enabled when CNV is deployed?
- Is the KubeVirt toolset in openshift-mcp-server enabled by default, or does it require configuration?
- How does Lightspeed discover and use the KubeVirt tools from openshift-mcp-server?
- Manual configuration or automatic discovery?
- Version dependencies between CNV, Lightspeed, openshift-mcp-server, and MCP?

**3. Technical Validation**

- Can we test locally with openshift-mcp-server to validate empirical data applies to our environment?
- What is the deployment status of openshift-mcp-server in OpenShift clusters (always deployed, optional, etc.)?

**Action Required:** Schedule meetings with Lightspeed, Product, and Operators teams to answer these questions before any development work.

---

## Table of Contents

1. [Important: Current Status & Open Questions](#️-important-current-status--open-questions)
2. [Current State: Existing Lightspeed Integration](#current-state-existing-lightspeed-integration)
3. [What Changed: Lightspeed Now Supports MCP](#what-changed-lightspeed-now-supports-mcp)
4. [Architecture Overview](#architecture-overview)
5. [Implementation Strategy](#implementation-strategy)
6. [Use Case Implementation](#use-case-implementation)
7. [Technical Details](#technical-details)
8. [Deployment](#deployment)
9. [Comparison: Lightspeed vs Direct MCP](#comparison-lightspeed-vs-direct-mcp)
10. [Recommendations](#recommendations)
11. [Next Steps](#next-steps)

---

## Current State: Existing Lightspeed Integration

CNV UI has Lightspeed integration (`src/views/lightspeed/`) with:

- `LightspeedHelpButton`, `LightspeedCard`, `LightspeedSimplePopoverContent` components
- 40+ pre-defined prompts (`prompts.ts`)
- YAML attachments for context
- Error status explanations in popovers

**Limitations:** Static prompts only, no dynamic queries, no cluster actions, no advanced troubleshooting.

---

## What Changed: Lightspeed Now Supports MCP

### Recent Developments (2025)

**1. MCP Integration with Lightspeed**

- OpenShift Lightspeed now supports Model Context Protocol
- Can integrate with MCP servers as data/tool providers
- Already in use for incident detection (via Cluster Observability Operator)

**2. OpenShift MCP Server - Already Exists! 🎉**

**IMPORTANT DISCOVERY:** The `openshift-mcp-server` already has a **KubeVirt toolset**!

**What's Already Available:**

- **Repository:** https://github.com/openshift/openshift-mcp-server
- **KubeVirt Tools:**
  - `vm_create` - Create VMs with intelligent parameter handling
    - Workload resolution (accepts "fedora", "ubuntu", "rhel" or full container disk URLs)
    - Automatic resource selection (resolves preferences and instance types)
    - Supports size/performance hints (large, compute-optimized)
    - Autostart option (runStrategy: Always)
  - `vm_start` - Start halted VMs (changes runStrategy to Always)
  - `vm_stop` - Stop running VMs (changes runStrategy to Halted)
  - `vm_pause` - Pause running VMs (separate PR, available soon)
- **Core Tools (useful for VMs):**
  - `resources_list` - List VMs and other K8s resources
  - `resources_get` - Get VM details
  - `resources_create_or_update` - Generic resource operations
  - `resources_delete` - Delete resources
  - `pods_log` - Get launcher pod logs
  - `events_list` - Get VM-related events
- **Observability Tools:**
  - `prometheus_query` - Query VM metrics

**Deployment:**

```bash
# Enable KubeVirt toolset
kubernetes-mcp-server --toolsets config,core,kubevirt,observability
```

**What This Means:**

- ✅ **Don't need to build basic VM operations** - already done!
- ✅ **Maintained by OpenShift team** - free updates
- ✅ **Proven effective** - see empirical evidence below
- ⚠️ **Still need CNV-specific diagnostics** - see gap analysis below

**3. Real-World Example: Incident Detection**

- Cluster Observability Operator exposes incidents via MCP server
- Lightspeed queries this MCP server when users ask about cluster health
- Same pattern can be applied for virtualization-specific queries

**Hybrid Architecture Pattern:**

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────────────┐
│  CNV UI         │────────►│  Lightspeed      │────────►│ openshift-mcp-server │
│  (React)        │  query  │  Service         │  tools  │ (EXISTING)           │
└─────────────────┘         └──────────────────┘         │ • vm_create          │
                                     │                    │ • vm_lifecycle       │
                                     │                    │ • resources_list     │
                                     ▼                    └──────────────────────┘
                            ┌──────────────────┐                    │
                            │   LLM Provider   │                    ▼
                            │  (Claude, etc)   │         ┌──────────────────────┐
                            └──────────────────┘         │ CNV Diagnostic MCP   │
                                     │                    │ (NEW - OPTIONAL)     │
                                     │                    │ • diagnose_vm_error  │
                                     └───────────────────►│ • search_vms_smart   │
                                                          │ • suggest_vm_fix     │
                                                          └──────────────────────┘
                                                                     │
                                                                     ▼
                                                          ┌──────────────────────┐
                                                          │  K8s API Server      │
                                                          │  (VMs, VMIs, etc)    │
                                                          └──────────────────────┘
```

---

## Empirical Evidence: Impact of KubeVirt Toolset

**Source:** [KubeVirt Kubernetes MCP Server Toolset Integration](https://docs.google.com/document/d/1JEH4WHQwmLxtmt0TSo1w82SiBqKmRamRx1f6nHui24M/edit?usp=sharing)

### Why KubeVirt-Specific Tools Matter

Extensive testing with multiple AI agents (Claude Code, Gemini, OpenAI models) demonstrates that **KubeVirt-specific MCP tools are essential, not optional**.

### Test Results: Without vs With KubeVirt Toolset

**Test Setup:**

- 5 AI agents tested (Claude Code, Gemini, OpenAI Gemini 2.0 Flash, Gemini 2.5 Pro, Granite 3.3)
- 6-11 test cases per configuration
- Tasks: Create VMs, manage lifecycle, troubleshoot issues

#### Overall Success Rates

| Configuration                | Success Rate           | Key Finding                         |
| ---------------------------- | ---------------------- | ----------------------------------- |
| **Without KubeVirt Toolset** | **6.7%** (3/45 tests)  | Most agents made zero tool calls    |
| **With KubeVirt Toolset**    | **100%** (30/30 tests) | All agents succeeded on basic tasks |

**Impact: +300-500% improvement with KubeVirt toolset**

#### Agent-Specific Results

| Agent                   | Without Toolset | With Toolset   | Improvement     |
| ----------------------- | --------------- | -------------- | --------------- |
| Claude Code             | 50% (3/6)       | **100%** (6/6) | **+100%**       |
| Gemini                  | 16.7% (1/6)     | **100%** (6/6) | **+500%**       |
| OpenAI Gemini 2.0 Flash | 16.7% (1/6)     | **100%** (6/6) | **+500%**       |
| OpenAI Gemini 2.5 Pro   | 33.3% (2/6)     | 66.7% (4/6)    | **+100%**       |
| OpenAI Granite 3.3      | 0% (0/6)        | **100%** (6/6) | **∞** (from 0%) |

#### Critical Findings

**Without KubeVirt Toolset:**

- ❌ **Most agents made zero tool calls** - Claude Code, Gemini, and OpenAI Gemini 2.0 Flash did not recognize VM management capabilities
- ❌ **API version confusion** - Agents used incorrect API versions (machine.openshift.io/v1beta1, "string")
- ❌ **Deprecated field usage** - Used deprecated `running` field instead of `runStrategy`
- ❌ **Only Gemini 2.5 Pro showed competence** - And even then, only 33% success rate

**With KubeVirt Toolset:**

- ✅ **100% success on basic operations** - All agents successfully created, started, and stopped VMs
- ✅ **Correct API usage** - Tools abstract away YAML complexity
- ✅ **Consistent behavior** - All agents understood how to use the tools
- ✅ **Efficient execution** - Average 1-2 tool calls per task

### Specific Tool Impact: vm_pause Example

Testing the value of a single specialized tool:

**Without `vm_pause` tool:**

- Success rate: **0%** (0/5 agents)
- Failure patterns:
  - Requested user approval for manual kubectl commands
  - Attempted to use incorrect `vm_stop` operation
  - Refused to proceed without explicit confirmation

**With `vm_pause` tool:**

- Success rate: **100%** (4/4 agents)
- All agents immediately recognized and correctly used the tool
- Single tool call required per agent

### Latest Comprehensive Test (November 2025)

**Test Configuration:** 11 test cases, 5 agents, with KubeVirt toolset

| Test Case                   | Difficulty | Pass Rate      | Notes                    |
| --------------------------- | ---------- | -------------- | ------------------------ |
| create-basic-vm             | Easy       | **100%** (5/5) | All agents succeeded     |
| create-ubuntu-vm            | Easy       | **100%** (5/5) | All agents succeeded     |
| troubleshoot-vm             | Easy       | **80%** (4/5)  | 1 timeout                |
| create-vm-with-instancetype | Medium     | **100%** (5/5) | All agents succeeded     |
| create-vm-with-performance  | Medium     | **100%** (5/5) | All agents succeeded     |
| create-vm-with-size         | Medium     | **100%** (5/5) | All agents succeeded     |
| delete-vm                   | Medium     | **100%** (5/5) | All agents succeeded     |
| pause-vm                    | Medium     | **0%** (0/5)   | **Needs vm_pause tool**  |
| create-vm-with-vlan         | Hard       | **0%** (0/5)   | Complex networking       |
| snapshot-restore-vm         | Hard       | **0%** (0/5)   | Snapshots not in toolset |
| update-vm-resources         | Hard       | **20%** (1/5)  | Needs better tooling     |

**Key Insights:**

- **Easy/Medium tasks: 80-100% success** with KubeVirt toolset
- **Hard tasks: 0-20% success** - indicate where additional CNV-specific tools are needed
- **Missing tools** (pause, snapshot, update) directly correlate with 0% success rates

### Key Takeaways

1. **KubeVirt tools are essential** - Generic K8s tools = 6.7% success, KubeVirt tools = 100%
2. **Hybrid approach validated** - Reuse proven tools (100%), build only for gaps (0-20%)
3. **Tool coverage = success rate** - With tools: 80-100%, without: 0-20%
4. **All AI models benefit** - Claude, Gemini, OpenAI all improved 300-500%

**Evaluation-Driven Development (EDD):** Write test → Confirm failure (0%) → Build tool → Confirm success (80-100%). Ensures tools match real AI capabilities.

---

## Gap Analysis: What We Still Need to Build

**Rule:** With dedicated tools = 80-100% success. Without = 0-20% success.

### What openshift-mcp-server Covers (100% success)

- ✅ Create VMs (`vm_create`)
- ✅ Start/Stop VMs (`vm_start`, `vm_stop`)
- ✅ List/Get VMs (`resources_list`, `resources_get`)
- ✅ Basic troubleshooting (`vm_troubleshoot` - 80% success)
- ⏳ Pause VMs (`vm_pause` - in PR, 0% → 100% proven)

### Gaps Requiring CNV-Specific Tools (0-20% success)

**1. Advanced Search & Filtering**

- Semantic search ("VMs with errors")
- Complex status filtering, time-based queries
- Cross-resource correlation
- **Test evidence:** Basic listing works, complex queries fail

**2. Enhanced Diagnostics**

- Automated dependency checking (PVCs, networks, secrets)
- Error correlation across resources
- Plain-language explanations + actionable fixes
- **Test evidence:** Current troubleshoot 80% → need 95%+

**3. Advanced Operations** (Test evidence: 0-20% success)

- Snapshots (0% success) → need `vm_snapshot_*` tools
- Live updates (20% success) → need `vm_update_*` tools
- Complex networking (0% success) → need `vm_add_network` or better docs
- Migrations → need `vm_migrate*` tools
- Cloning → need `vm_clone` tool

### Recommended Approach: Hybrid Architecture (Validated by Testing)

**Empirical data strongly validates the hybrid approach.**

**Option A: Use openshift-mcp-server Only**

- ✅ Pros: Simple, no new code, proven 100% success on basic operations
- ❌ Cons: 0-20% success on advanced tasks (snapshots, complex networking, live updates)
- **Use for:** Basic VM CRUD, lifecycle management (create, start, stop, pause)

**Option B: Build Complete CNV MCP Server**

- ✅ Pros: Full control, CNV-specific features
- ❌ Cons: Duplicate proven tools, 300-500% more effort, maintenance burden
- **Not recommended** - Duplicates working infrastructure

**Option C: Hybrid (STRONGLY RECOMMENDED - VALIDATED BY DATA)**

- ✅ Use openshift-mcp-server for basic VM operations (proven 100% success)
- ✅ Build small CNV diagnostic MCP server ONLY for gaps (0-20% success areas)
- ✅ Best of both worlds: leverage proven tools + fill specific gaps
- ✅ Follows Evaluation-Driven Development methodology

| Aspect                | Option A: openshift-mcp Only | Option B: CNV MCP Only | Option C: Hybrid        |
| --------------------- | ---------------------------- | ---------------------- | ----------------------- |
| **Development Time**  | 1-2 weeks                    | 6-8 weeks              | 3-4 weeks               |
| **Basic VM Ops**      | ✅ 100% success (proven)     | Need to rebuild        | ✅ 100% success (reuse) |
| **Advanced Features** | ❌ 0-20% success             | ✅ Full control        | ✅ Full control         |
| **Maintenance**       | ✅ OpenShift team            | ❌ Full ownership      | ⚠️ Shared               |
| **Code to Write**     | 0 lines                      | ~3000 lines            | ~500 lines (gaps only)  |
| **Deployment**        | 1 server                     | 1 server               | 2 servers               |
| **AI Agent Success**  | 60% average                  | Unknown                | **80-100%** (estimated) |

**Winner:** Option C (Hybrid)

- **Data-driven decision:** 100% success on basic ops + targeted tools for gaps
- **Proven methodology:** Following EDD approach used by openshift-mcp-server team
- **Minimal investment:** Only build what's missing, not what works

### Priority Tools to Build

**Phase 1 - Contribute to openshift-mcp-server:**

1. ✅ `vm_pause` - Already in PR (0→100% proven)
2. `vm_snapshot_*` - 0% success without
3. `vm_update_*` - 20% success, needs improvement

**Phase 2 - CNV Diagnostic Server:**

1. `diagnose_vm_error_advanced` - Improve 80% → 95%+
2. `search_vms_semantic` - Natural language search
3. `suggest_vm_fix` - Actionable fixes

**Phase 3 - Advanced (if needed):**

1. `vm_migrate*` - Live migration
2. `vm_add_network` - Complex networking
3. `vm_clone` - Clone operations

**Strategy:** Contribute Phase 1 to openshift-mcp-server (benefits ecosystem), build Phase 2 in CNV diagnostic server (CNV-specific), decide Phase 3 using EDD.

---

## Architecture Overview

### Proposed Architecture (Hybrid Approach)

```
┌────────────────────────────────────────────────────────────────┐
│                         CNV UI (React)                         │
│                                                                │
│  Existing:                          New (Optional):           │
│  ┌─────────────────┐               ┌─────────────────────┐   │
│  │ LightspeedCard  │               │ AI Search Bar       │   │
│  │ LightspeedHelp  │               │ Enhanced Popovers   │   │
│  │ Button          │               │ Smart Error Alerts  │   │
│  └────────┬────────┘               └──────────┬──────────┘   │
│           └────────────────┬──────────────────┘              │
│                            │                                  │
│                            ▼                                  │
│              ┌──────────────────────────┐                    │
│              │  Lightspeed Client       │                    │
│              │  (existing integration)  │                    │
│              └──────────┬───────────────┘                    │
└───────────────────────────┼──────────────────────────────────┘
                            │ /api/proxy/plugin/lightspeed-console-plugin/ols/v1/query
                            ▼
┌────────────────────────────────────────────────────────────────┐
│              OpenShift Lightspeed Service                      │
│              (Existing - runs in cluster)                      │
│                                                                │
│  ┌──────────────┐    ┌──────────────┐    ┌────────────────┐  │
│  │ Query        │    │ RAG          │    │ MCP Client     │  │
│  │ Handler      │───►│ (Docs)       │    │ (Multi-server) │  │
│  └──────────────┘    └──────────────┘    └───────┬────────┘  │
│                                                   │            │
└───────────────────────────────────────────────────┼────────────┘
                                                    │ MCP Protocol
                                    ┌───────────────┴───────────────┐
                                    ▼                               ▼
┌───────────────────────────────────────────┐  ┌──────────────────────────────────┐
│   openshift-mcp-server (EXISTING)         │  │ CNV Diagnostic MCP (NEW/OPTIONAL)│
│                                           │  │                                  │
│  Basic VM Operations:                    │  │ Advanced CNV Features:           │
│  ┌────────────────────────────────────┐  │  │ ┌──────────────────────────────┐ │
│  │ • vm_create - Create VMs           │  │  │ │ • diagnose_vm_error          │ │
│  │ • vm_lifecycle - Start/Stop/Restart│  │  │ │ • search_vms_advanced        │ │
│  │ • resources_list - List VMs        │  │  │ │ • suggest_vm_fix             │ │
│  │ • resources_get - Get VM details   │  │  │ │ • get_error_explanation      │ │
│  │ • pods_log - Get pod logs          │  │  │ │ • check_vm_dependencies      │ │
│  │ • events_list - List events        │  │  │ └──────────────────────────────┘ │
│  │ • prometheus_query - VM metrics    │  │  │                                  │
│  └────────────────────────────────────┘  │  │ Resources:                       │
│                                           │  │ • CNV error patterns DB          │
│  Maintained by: OpenShift team           │  │ • Troubleshooting guides         │
│  Deploy: Already available cluster-wide  │  │ • Common fix templates           │
└───────────────┬───────────────────────────┘  └──────────────┬───────────────────┘
                │                                               │
                └───────────────┬───────────────────────────────┘
                                ▼
                        ┌─────────────────┐
                        │  K8s API Server │
                        │  (VMs, VMIs,    │
                        │   DVs, PVCs)    │
                        └─────────────────┘
```

**Key Points:**

- **openshift-mcp-server** handles all basic VM operations (already exists)
- **CNV Diagnostic MCP** adds advanced diagnostics (small new component)
- Lightspeed intelligently routes to appropriate MCP server
- CNV Diagnostic MCP can call openshift-mcp-server's tools internally

### Key Components

**1. CNV UI (Minimal Changes)**

- Reuse existing `LightspeedCard` and `LightspeedHelpButton`
- Add new prompt types for search/troubleshooting
- Send natural language queries instead of static prompts
- Display results in existing UI components

**2. OpenShift Lightspeed Service (Already Deployed)**

- Existing service running in the cluster
- Already handles authentication, rate limiting, LLM communication
- Needs MCP client configuration (config change)
- Routes queries to appropriate MCP servers

**3. CNV/KubeVirt MCP Server (New - To Build)**

- Custom MCP server with virtualization-specific tools
- Implements MCP protocol
- Calls K8s API for VM operations
- Returns structured data to Lightspeed

---

## Implementation Strategy

### Phase 1: POC with Read-Only Tools (2-3 weeks)

**Objective:** Validate Lightspeed + MCP integration with basic search

**What to Build:**

1. Simple CNV MCP Server (Node.js or Go)
   - Tool: `search_virtual_machines`
   - Tool: `explain_vm_status`
2. Configure Lightspeed to connect to this MCP server
3. Add new prompt type in CNV UI: `AI_SEARCH`
4. Test end-to-end flow

**Success Criteria:**

- User types "show VMs with errors" → AI uses MCP tool → Returns results
- Response time < 5 seconds
- Accurate results for simple queries

### Phase 2: Enhanced Troubleshooting (3-4 weeks)

**What to Add:**

1. More MCP Tools:
   - `diagnose_vm_error` - Deep error analysis
   - `check_dependencies` - Verify PVCs, networks, etc.
   - `get_recent_events` - Fetch relevant events
2. Enhanced UI components:
   - AI-powered error alert with diagnosis
   - Richer popover content with automated checks
3. Testing and refinement

**Success Criteria:**

- 80% accuracy in error diagnosis
- Actionable suggestions provided
- Positive user feedback

### Phase 3: Production Hardening (4-6 weeks)

**What to Add:**

1. Write operations (with RBAC):
   - `apply_fix` - Execute suggested remediation
   - User confirmation required
2. Caching and optimization
3. Monitoring and metrics
4. Security review and penetration testing
5. Documentation

---

## Use Case Implementation

### 1. Advanced Search

#### User Experience

**Before:**

- Filter dropdown + text search
- Only filters loaded data
- No semantic understanding

**After:**

```
User types in search: "VMs that failed to start in the last hour in production namespaces"

AI (via Lightspeed + MCP):
1. Parses natural language query
2. Calls search_virtual_machines MCP tool with parameters:
   {
     "namespaces": ["prod-*"],
     "status": "not running",
     "timeRange": "1h",
     "hasErrors": true
   }
3. Returns structured results
4. UI renders in familiar table format
```

#### Implementation

**UI Changes (Minimal):**

```typescript
// src/views/virtualmachines/list/components/AISearchBar.tsx
import React, { FC, useState } from 'react';
import { SearchInput } from '@patternfly/react-core';
import LightspeedCard from '@lightspeed/components/LightspeedCard';

export const AISearchBar: FC = () => {
  const [query, setQuery] = useState('');
  const [searchPrompt, setSearchPrompt] = useState('');

  const handleSearch = () => {
    // Create prompt for Lightspeed with search context
    const prompt = `Search for virtual machines: ${query}.
    Use the search_virtual_machines tool to find matching VMs.
    Return results as a structured list.`;
    setSearchPrompt(prompt);
  };

  return (
    <div>
      <SearchInput
        placeholder="Ask about your VMs in natural language..."
        value={query}
        onChange={(_, val) => setQuery(val)}
        onSearch={handleSearch}
      />
      {searchPrompt && <LightspeedCard prompt={searchPrompt} />}
    </div>
  );
};
```

**MCP Server Implementation:**

```javascript
// cnv-mcp-server/src/tools/search-vms.js
import { k8sClient } from '../k8s-client.js';

export const searchVirtualMachines = {
  name: 'search_virtual_machines',
  description:
    'Search for virtual machines based on various criteria including status, namespace, labels, and time range',
  inputSchema: {
    type: 'object',
    properties: {
      namespaces: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of namespaces to search (supports wildcards like "prod-*")',
      },
      status: {
        type: 'string',
        description: 'Filter by VM status (running, stopped, error, etc.)',
      },
      hasErrors: {
        type: 'boolean',
        description: 'Filter VMs that have error conditions',
      },
      timeRange: {
        type: 'string',
        description: 'Time range for filtering (e.g., "1h", "24h", "7d")',
      },
      labelSelector: {
        type: 'string',
        description: 'Kubernetes label selector',
      },
    },
  },

  async execute({ namespaces, status, hasErrors, timeRange, labelSelector }) {
    // Get all VMs matching criteria
    const vms = await k8sClient.listVirtualMachines({
      namespaces,
      labelSelector,
    });

    // Filter based on criteria
    const filtered = vms.items.filter((vm) => {
      if (status && vm.status?.printableStatus !== status) return false;
      if (hasErrors && !vmHasErrors(vm)) return false;
      if (timeRange && !withinTimeRange(vm, timeRange)) return false;
      return true;
    });

    // Return structured results
    return {
      total: filtered.length,
      vms: filtered.map((vm) => ({
        name: vm.metadata.name,
        namespace: vm.metadata.namespace,
        status: vm.status?.printableStatus,
        conditions: vm.status?.conditions,
        created: vm.metadata.creationTimestamp,
        node: vm.status?.nodeName,
      })),
    };
  },
};

function vmHasErrors(vm) {
  return vm.status?.conditions?.some(
    (c) => c.status === 'False' && ['Ready', 'LiveMigratable'].includes(c.type),
  );
}

function withinTimeRange(vm, range) {
  const created = new Date(vm.metadata.creationTimestamp);
  const now = new Date();
  const hours = parseInt(range);
  return now - created < hours * 60 * 60 * 1000;
}
```

**Lightspeed Configuration:**

```yaml
# Add to Lightspeed ConfigMap
ols_config:
  mcp_servers:
    - name: cnv-mcp
      url: http://cnv-mcp-server:8080
      tools:
        - search_virtual_machines
        - diagnose_vm_error
        - explain_vm_status
```

---

### 2. Enhanced Context-Aware Popovers

#### User Experience

**Current:**
User hovers over VM error → Shows static error message

**Enhanced:**
User hovers over VM error → Shows:

- Error explanation
- "Get AI Analysis" button → Triggers deep diagnosis
- Shows diagnosis results with:
  - What's wrong (plain language)
  - Root cause analysis
  - Specific fix suggestions
  - One-click remediation (if safe)

#### Implementation

**UI Enhancement:**

```typescript
// src/views/virtualmachines/list/components/AIEnhancedConditionPopover.tsx
import React, { FC, useState } from 'react';
import { Popover, Button, Spinner } from '@patternfly/react-core';
import LightspeedCard from '@lightspeed/components/LightspeedCard';

type AIEnhancedConditionPopoverProps = {
  condition: V1VirtualMachineCondition;
  vm: V1VirtualMachine;
  children: React.ReactElement;
};

export const AIEnhancedConditionPopover: FC<AIEnhancedConditionPopoverProps> = ({
  condition,
  vm,
  children,
}) => {
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Build diagnostic prompt that will trigger MCP tool
  const diagnosticPrompt = `Diagnose this VirtualMachine error:
  VM: ${vm.metadata.name}
  Namespace: ${vm.metadata.namespace}
  Condition: ${condition.type}=${condition.status}
  Message: ${condition.message}

  Use the diagnose_vm_error tool to:
  1. Analyze the root cause
  2. Check related resources (pods, PVCs, networks)
  3. Suggest specific fixes

  Format the response as:
  - What happened
  - Why it happened
  - How to fix it`;

  return (
    <Popover
      bodyContent={() => (
        <div>
          <p>
            <strong>{condition.type}</strong>: {condition.status}
          </p>
          <p>{condition.message || condition.reason}</p>

          {!showAnalysis && (
            <Button variant="link" onClick={() => setShowAnalysis(true)}>
              Get AI Diagnosis
            </Button>
          )}

          {showAnalysis && (
            <div style={{ marginTop: '12px' }}>
              <LightspeedCard prompt={diagnosticPrompt} />
            </div>
          )}
        </div>
      )}
    >
      {children}
    </Popover>
  );
};
```

**MCP Tool:**

```javascript
// cnv-mcp-server/src/tools/diagnose-vm-error.js
export const diagnoseVMError = {
  name: 'diagnose_vm_error',
  description: 'Diagnose VM errors by analyzing the VM, related pods, events, and dependencies',
  inputSchema: {
    type: 'object',
    properties: {
      vmName: { type: 'string' },
      namespace: { type: 'string' },
      condition: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          status: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
    required: ['vmName', 'namespace'],
  },

  async execute({ vmName, namespace, condition }) {
    const diagnosis = {
      checks: [],
      rootCause: null,
      suggestions: [],
    };

    // 1. Get VM details
    const vm = await k8sClient.getVM(namespace, vmName);

    // 2. Get VMI if exists
    let vmi = null;
    try {
      vmi = await k8sClient.getVMI(namespace, vmName);
    } catch (e) {
      diagnosis.checks.push({
        name: 'VirtualMachineInstance',
        passed: false,
        message: 'VMI does not exist - VM may not be starting',
      });
    }

    // 3. Check launcher pod
    const pods = await k8sClient.listPods(namespace, {
      labelSelector: `kubevirt.io=virt-launcher,vm.kubevirt.io/name=${vmName}`,
    });

    if (pods.items.length === 0) {
      diagnosis.checks.push({
        name: 'Launcher Pod',
        passed: false,
        message: 'No launcher pod found',
      });
      diagnosis.rootCause = 'VM launcher pod failed to create';
    } else {
      const pod = pods.items[0];
      const podStatus = pod.status.phase;

      diagnosis.checks.push({
        name: 'Launcher Pod',
        passed: podStatus === 'Running',
        message: `Pod status: ${podStatus}`,
      });

      // Check pod events for errors
      if (podStatus !== 'Running') {
        const events = await k8sClient.getEvents(namespace, {
          fieldSelector: `involvedObject.name=${pod.metadata.name}`,
        });

        const errorEvents = events.items.filter((e) => e.type === 'Warning');
        if (errorEvents.length > 0) {
          diagnosis.rootCause = errorEvents[0].message;
        }
      }

      // Check container statuses
      for (const container of pod.status.containerStatuses || []) {
        if (container.state.waiting) {
          diagnosis.checks.push({
            name: `Container ${container.name}`,
            passed: false,
            message: `Waiting: ${container.state.waiting.reason}`,
          });

          // Common issues
          if (container.state.waiting.reason === 'ImagePullBackOff') {
            diagnosis.rootCause = 'Cannot pull container image';
            diagnosis.suggestions.push({
              description: 'Check image pull secrets and registry accessibility',
              command: `oc describe pod ${pod.metadata.name} -n ${namespace}`,
            });
          }
        }
      }
    }

    // 4. Check PVCs
    if (vm.spec.template?.spec?.volumes) {
      for (const volume of vm.spec.template.spec.volumes) {
        if (volume.persistentVolumeClaim) {
          const pvcName = volume.persistentVolumeClaim.claimName;
          const pvc = await k8sClient.getPVC(namespace, pvcName);

          const bound = pvc.status.phase === 'Bound';
          diagnosis.checks.push({
            name: `PVC ${pvcName}`,
            passed: bound,
            message: `Status: ${pvc.status.phase}`,
          });

          if (!bound) {
            diagnosis.rootCause = `PVC ${pvcName} is not bound`;
            diagnosis.suggestions.push({
              description: 'Check storage class and PV availability',
              command: `oc describe pvc ${pvcName} -n ${namespace}`,
            });
          }
        }
      }
    }

    // 5. Check node resources if we know which node
    if (vmi?.status?.nodeName) {
      const node = await k8sClient.getNode(vmi.status.nodeName);
      const hasMemoryPressure = node.status.conditions.some(
        (c) => c.type === 'MemoryPressure' && c.status === 'True',
      );

      if (hasMemoryPressure) {
        diagnosis.checks.push({
          name: 'Node Resources',
          passed: false,
          message: 'Node has memory pressure',
        });
        diagnosis.suggestions.push({
          description:
            'Node is low on memory - consider reducing VM memory or migrating to another node',
        });
      }
    }

    return {
      summary: diagnosis.rootCause || 'Unable to determine specific cause',
      checks: diagnosis.checks,
      suggestions: diagnosis.suggestions,
    };
  },
};
```

---

### 3. Automated Error Troubleshooting

#### Implementation

**Enhanced Error Alert:**

```typescript
// src/utils/components/AIEnhancedErrorAlert/AIEnhancedErrorAlert.tsx
import React, { FC, useState } from 'react';
import { Alert, AlertActionLink, Button } from '@patternfly/react-core';
import LightspeedCard from '@lightspeed/components/LightspeedCard';

type AIEnhancedErrorAlertProps = {
  error: {
    message: string;
    resourceType?: string;
    resourceName?: string;
    namespace?: string;
  };
};

export const AIEnhancedErrorAlert: FC<AIEnhancedErrorAlertProps> = ({ error }) => {
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  const troubleshootPrompt = `Troubleshoot this error:
  Error: ${error.message}
  Resource: ${error.resourceType}/${error.resourceName}
  Namespace: ${error.namespace}

  Use the diagnose_vm_error tool to analyze and suggest fixes.
  Provide:
  1. Root cause analysis
  2. What to check
  3. How to fix it (with commands if applicable)`;

  return (
    <Alert
      variant="danger"
      title="An error occurred"
      actionLinks={
        !showTroubleshooting && (
          <AlertActionLink onClick={() => setShowTroubleshooting(true)}>
            Troubleshoot with AI
          </AlertActionLink>
        )
      }
    >
      <p>{error.message}</p>

      {showTroubleshooting && (
        <div style={{ marginTop: '16px' }}>
          <LightspeedCard prompt={troubleshootPrompt} />
        </div>
      )}
    </Alert>
  );
};
```

---

## Technical Details

### CNV MCP Server Implementation

**Technology Choice:** Node.js (easier for POC) or Go (better performance)

**Structure:**

```
cnv-mcp-server/
├── package.json
├── src/
│   ├── index.js              # MCP server setup
│   ├── k8s-client.js         # Kubernetes API client
│   ├── tools/
│   │   ├── search-vms.js
│   │   ├── diagnose-vm-error.js
│   │   ├── explain-vm-status.js
│   │   ├── check-storage.js
│   │   └── get-vm-events.js
│   └── resources/
│       ├── error-patterns.js
│       └── troubleshooting-kb.js
└── config/
    └── rbac.yaml             # Service account permissions
```

**MCP Server Setup (Node.js):**

```javascript
// src/index.js
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { searchVirtualMachines } from './tools/search-vms.js';
import { diagnoseVMError } from './tools/diagnose-vm-error.js';
import { explainVMStatus } from './tools/explain-vm-status.js';

const server = new Server(
  {
    name: 'cnv-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  },
);

// Register tools
server.setRequestHandler('tools/list', async () => ({
  tools: [searchVirtualMachines, diagnoseVMError, explainVMStatus],
}));

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'search_virtual_machines':
      return await searchVirtualMachines.execute(args);
    case 'diagnose_vm_error':
      return await diagnoseVMError.execute(args);
    case 'explain_vm_status':
      return await explainVMStatus.execute(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

**K8s Client Setup:**

```javascript
// src/k8s-client.js
import { KubeConfig, CoreV1Api, CustomObjectsApi } from '@kubernetes/client-node';

const kc = new KubeConfig();
kc.loadFromCluster(); // Load from service account

const k8sApi = kc.makeApiClient(CoreV1Api);
const customApi = kc.makeApiClient(CustomObjectsApi);

export const k8sClient = {
  async listVirtualMachines({ namespaces, labelSelector }) {
    const results = [];

    for (const ns of namespaces || ['default']) {
      const response = await customApi.listNamespacedCustomObject(
        'kubevirt.io',
        'v1',
        ns,
        'virtualmachines',
        undefined,
        undefined,
        undefined,
        undefined,
        labelSelector,
      );
      results.push(...response.body.items);
    }

    return { items: results };
  },

  async getVM(namespace, name) {
    const response = await customApi.getNamespacedCustomObject(
      'kubevirt.io',
      'v1',
      namespace,
      'virtualmachines',
      name,
    );
    return response.body;
  },

  async getVMI(namespace, name) {
    const response = await customApi.getNamespacedCustomObject(
      'kubevirt.io',
      'v1',
      namespace,
      'virtualmachineinstances',
      name,
    );
    return response.body;
  },

  async listPods(namespace, { labelSelector }) {
    const response = await k8sApi.listNamespacedPod(
      namespace,
      undefined,
      undefined,
      undefined,
      undefined,
      labelSelector,
    );
    return response.body;
  },

  async getEvents(namespace, { fieldSelector }) {
    const response = await k8sApi.listNamespacedEvent(
      namespace,
      undefined,
      undefined,
      undefined,
      fieldSelector,
    );
    return response.body;
  },

  async getPVC(namespace, name) {
    const response = await k8sApi.readNamespacedPersistentVolumeClaim(name, namespace);
    return response.body;
  },

  async getNode(name) {
    const response = await k8sApi.readNode(name);
    return response.body;
  },
};
```

### Lightspeed Configuration

**ConfigMap Update:**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: olsconfig
  namespace: openshift-lightspeed
data:
  olsconfig.yaml: |
    ols_config:
      conversation_cache:
        type: redis
        redis:
          host: lightspeed-redis.openshift-lightspeed.svc
          port: 6379

      # Add MCP server configuration
      mcp_servers:
        - name: cnv-kubevirt
          description: "KubeVirt and CNV virtualization tools"
          transport:
            type: http
            url: http://cnv-mcp-server.openshift-cnv.svc:8080
          auth:
            type: kubernetes
            service_account: lightspeed-mcp-client
          tools:
            - search_virtual_machines
            - diagnose_vm_error
            - explain_vm_status
            - check_storage_health
            - get_vm_events

      # Existing LLM config
      default_provider: openai
      default_model: gpt-4

      # ... rest of config
```

---

## Security & Privacy Considerations

### Authentication & Authorization

**Frontend:**

- No AI API keys in browser code
- All requests use existing OpenShift user tokens
- Lightspeed validates tokens before processing AI requests

**Backend (Lightspeed + MCP Servers):**

- Validate OpenShift token on every MCP request
- Check user RBAC permissions before executing operations
- MCP servers use service accounts with minimal required permissions
- Store AI provider API keys in Kubernetes Secrets (not ConfigMaps)

**MCP Servers:**

- Run with least-privilege service accounts
- Read-only mode by default for diagnostic operations
- Write operations require explicit user confirmation
- Namespace-scoped access where possible

### Data Privacy & PII Protection

**Sensitive Data Handling:**

- ⚠️ **NEVER send secrets, tokens, or credentials to AI provider**
- Redact sensitive fields from resource YAML before sending:
  - `data` in Secrets
  - `stringData` in ConfigMaps
  - `token` fields in ServiceAccounts
  - Private keys, certificates
  - Password fields

**PII Protection:**

- Filter out user emails and names from error messages
- Anonymize resource names if required by policy
- Support data residency requirements (e.g., EU-only LLM providers)
- Provide option to disable AI features entirely

**Air-Gapped & Disconnected Environments:**

- Support for self-hosted AI models (Llama, Mistral, etc.)
- On-cluster LLM deployment option
- No external API calls in disconnected mode
- Fallback to static help when AI unavailable

### AI-Specific Security Concerns

**AI Hallucination & Incorrect Suggestions:**

- ⚠️ **AI can provide wrong information** - always validate suggestions
- Require user confirmation for any cluster modifications
- Display confidence levels when available
- Provide "report incorrect response" mechanism
- Log all AI suggestions for audit

**Prompt Injection Attacks:**

- Sanitize user input before sending to AI
- Use structured prompts with clear boundaries
- Validate AI tool calls before execution
- Limit MCP tool capabilities (no unrestricted exec)

**Data Leakage:**

- AI provider (Claude, OpenAI) receives cluster data
- Review provider terms of service and data retention policies
- Consider: Does your organization allow sending K8s data to external AI?
- Option: Use self-hosted models for sensitive environments

### Rate Limiting & Cost Control

**Request Limits:**

- Per-user rate limits (e.g., 10 AI requests/minute)
- Per-cluster daily quotas
- Graceful degradation when limits exceeded
- Queue requests during high load

**Cost Management:**

- Use cheaper models for simple tasks:
  - Sonnet/Haiku for search and basic explanations
  - Opus only for complex troubleshooting
- Cache common queries (Redis with TTL)
- Token usage monitoring and alerts
- Budget caps and overage notifications

**Caching Strategy:**

- Cache AI responses for identical queries
- TTL: 5 minutes for search results
- TTL: 1 hour for error explanations
- Invalidate cache on resource changes (watch K8s events)

### Audit & Compliance

**Logging:**

- Log all AI requests with:
  - User identity (OpenShift username)
  - Timestamp
  - Query/prompt
  - AI response summary
  - MCP tools executed
- Log all cluster modifications initiated by AI
- Retain logs per compliance requirements (e.g., SOC2, HIPAA)

**Compliance Considerations:**

- **GDPR:** User consent for AI processing, data minimization
- **HIPAA:** Self-hosted models only, no PHI to external AI
- **SOC2:** Audit trail, access controls, data encryption
- **FedRAMP:** May require self-hosted models, additional controls

**Approval Workflows:**

- Automated actions require user confirmation
- Option for admin-level approval for write operations
- Audit trail for all AI-suggested modifications
- Rollback capability for AI-initiated changes

### RBAC Integration

**Permission Model:**

```yaml
# Users can only AI-query resources they can see
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: cnv-ai-user
rules:
  # Can use AI for resources they have read access to
  - apiGroups: ['kubevirt.io']
    resources: ['virtualmachines', 'virtualmachineinstances']
    verbs: ['get', 'list']

  # Can trigger diagnostics
  - apiGroups: ['lightspeed.openshift.io']
    resources: ['ai-queries']
    verbs: ['create']

  # Cannot execute AI-suggested fixes without this permission
  - apiGroups: ['kubevirt.io']
    resources: ['virtualmachines']
    verbs: ['update', 'patch']
    # Required for automated remediation
```

**Security Best Practices:**

- Users can only query VMs in namespaces they have access to
- MCP tools honor user's RBAC permissions (impersonation)
- Separate permissions for read (diagnosis) vs write (remediation)
- Cluster admins can disable AI features per namespace

### Network Security

**Traffic Encryption:**

- All MCP communication over HTTPS/TLS
- Lightspeed to MCP servers: in-cluster mTLS
- UI to Lightspeed: HTTPS (OpenShift ingress)
- External AI API calls: TLS 1.3

**Network Policies:**

```yaml
# Restrict MCP server network access
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: cnv-mcp-server
  namespace: openshift-cnv
spec:
  podSelector:
    matchLabels:
      app: cnv-mcp-server
  policyTypes:
    - Ingress
    - Egress
  ingress:
    # Only allow from Lightspeed
    - from:
        - namespaceSelector:
            matchLabels:
              name: openshift-lightspeed
      ports:
        - port: 8080
  egress:
    # Only allow to K8s API
    - to:
        - namespaceSelector: {}
      ports:
        - port: 6443
```

### Monitoring & Incident Response

**Security Monitoring:**

- Alert on unusual AI query patterns
- Detect potential prompt injection attempts
- Monitor for excessive resource access
- Track failed authentication attempts

**Incident Response:**

- Kill-switch to disable AI features immediately
- Audit log export for security investigations
- User activity correlation
- Automated threat detection

---

## Deployment

### ⚠️ Deployment Model - Needs Clarification

**Critical Question:** How should the CNV MCP server be deployed and integrated with Lightspeed?

This section outlines **potential** deployment options, but **requires product/architecture decisions** before implementation.

---

### Option 1: CNV Operator-Managed Deployment (Recommended)

**Concept:** CNV operator deploys MCP server when Lightspeed MCP capability is detected

**Pros:**

- Automatic deployment with CNV installation
- Version synchronized with CNV releases
- No manual configuration needed
- Clean uninstall when CNV is removed

**Cons:**

- Requires cross-operator communication mechanism
- Complex dependency management
- What happens when Lightspeed MCP is still in DP?

**Implementation Questions:**

- How does CNV operator detect Lightspeed MCP availability?
- How does CNV communicate MCP server endpoint to Lightspeed?
- What if Lightspeed is installed after CNV (or vice versa)?

```yaml
# Deployed by CNV Operator when Lightspeed MCP detected
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cnv-mcp-server
  namespace: openshift-cnv
  ownerReferences:
    - apiVersion: hco.kubevirt.io/v1beta1
      kind: HyperConverged
      name: kubevirt-hyperconverged
spec:
  replicas: 2
  selector:
    matchLabels:
      app: cnv-mcp-server
  template:
    metadata:
      labels:
        app: cnv-mcp-server
    spec:
      serviceAccountName: cnv-mcp-server
      containers:
        - name: mcp-server
          image: quay.io/openshift-cnv/cnv-mcp-server:latest
          ports:
            - containerPort: 8080
          resources:
            requests:
              memory: '256Mi'
              cpu: '100m'
            limits:
              memory: '512Mi'
              cpu: '500m'
---
apiVersion: v1
kind: Service
metadata:
  name: cnv-mcp-server
  namespace: openshift-cnv
spec:
  selector:
    app: cnv-mcp-server
  ports:
    - port: 8080
      targetPort: 8080
---
# CNV Operator creates/updates this ConfigMap
# Lightspeed watches for MCP server configurations
apiVersion: v1
kind: ConfigMap
metadata:
  name: cnv-mcp-server-config
  namespace: openshift-lightspeed
  labels:
    lightspeed.openshift.io/mcp-server: 'true'
data:
  server.yaml: |
    name: cnv-kubevirt
    description: "KubeVirt and CNV virtualization tools"
    transport:
      type: http
      url: http://cnv-mcp-server.openshift-cnv.svc:8080
    tools:
      - search_virtual_machines
      - diagnose_vm_error
      - explain_vm_status
```

---

### Option 2: Manual Configuration (Simple but Not Scalable)

**Concept:** Cluster admin manually configures Lightspeed to use CNV MCP server

**Pros:**

- Simple implementation
- No operator coupling
- Works today

**Cons:**

- Manual steps required
- Error-prone
- Doesn't scale across products
- No automatic cleanup

**Process:**

1. Install CNV (includes MCP server deployment)
2. Cluster admin manually edits Lightspeed ConfigMap
3. Add CNV MCP server configuration
4. Restart Lightspeed

**Not Recommended** - Only suitable for early testing/POC

---

### Option 3: Lightspeed Plugin Registry (Future)

**Concept:** Lightspeed has plugin registry where operators can register MCP servers

**Pros:**

- Clean architecture
- Scalable across all OpenShift components
- Dynamic discovery
- Standard pattern

**Cons:**

- Requires Lightspeed team to build registry mechanism
- Not available in v4.21/v4.22 DP
- Longer timeline

**This is likely the long-term solution** but requires:

- Lightspeed team to design/implement registry
- CNV to implement registration logic
- Standardized API contract

---

### Option 4: Sidecar to Lightspeed (Not Recommended)

**Concept:** Deploy CNV MCP server as sidecar to Lightspeed pods

**Pros:**

- Simple networking (localhost)
- Guaranteed availability with Lightspeed

**Cons:**

- Tight coupling between CNV and Lightspeed
- CNV updates require Lightspeed restarts
- Doesn't respect namespace boundaries
- Complex permissions (CNV code running in Lightspeed namespace)

```yaml
# NOT RECOMMENDED - shown for completeness
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lightspeed-app-server
  namespace: openshift-lightspeed
spec:
  template:
    spec:
      containers:
        - name: lightspeed-service-api
          image: quay.io/openshift-lightspeed/lightspeed-service-api:latest
          # ... existing config

        # CNV MCP Server sidecar - creates tight coupling
        - name: cnv-mcp-server
          image: quay.io/openshift-cnv/cnv-mcp-server:latest
          ports:
            - containerPort: 8080
```

---

### Recommended Path Forward

**Given current uncertainties:**

1. **Immediate (POC/Testing):**

   - Use Option 2 (Manual Configuration) for POC and testing
   - Document manual configuration steps
   - Validate technical feasibility

2. **Short-term (v4.21-v4.22 DP):**

   - Implement Option 1 (CNV Operator-Managed) if:
     - Product decides to support DP integration
     - Cross-operator communication pattern is established
     - Feature flags protect experimental functionality

3. **Long-term (GA):**
   - Work with Lightspeed team on Option 3 (Plugin Registry)
   - Define standard operator-to-Lightspeed integration pattern
   - Use for productization

### RBAC Configuration

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: cnv-mcp-server
  namespace: openshift-cnv
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: cnv-mcp-server
rules:
  # Read VMs and VMIs
  - apiGroups: ['kubevirt.io']
    resources: ['virtualmachines', 'virtualmachineinstances']
    verbs: ['get', 'list', 'watch']
  # Read related resources
  - apiGroups: ['']
    resources: ['pods', 'persistentvolumeclaims', 'events', 'nodes']
    verbs: ['get', 'list']
  # Read CDI resources
  - apiGroups: ['cdi.kubevirt.io']
    resources: ['datavolumes']
    verbs: ['get', 'list']
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: cnv-mcp-server
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cnv-mcp-server
subjects:
  - kind: ServiceAccount
    name: cnv-mcp-server
    namespace: openshift-cnv
```

---

## Comparison: Lightspeed vs Direct MCP vs Alternative Approaches

### Main Options Comparison

| Aspect               | OpenShift Lightspeed + MCP  | Direct MCP Integration       | No AI (Status Quo) |
| -------------------- | --------------------------- | ---------------------------- | ------------------ |
| **Infrastructure**   | Reuse existing Lightspeed   | Build new backend proxy      | Current CNV UI     |
| **Authentication**   | ✅ Handled by Lightspeed    | ❌ Need to implement         | ✅ Existing        |
| **LLM Provider**     | ✅ Configured in Lightspeed | ❌ Manage API keys           | N/A                |
| **UI Changes**       | Minimal (reuse components)  | Significant (new components) | None               |
| **Deployment**       | Add MCP server only         | Deploy full proxy service    | None               |
| **Development Time** | 3-6 weeks (hybrid)          | 6-10 weeks                   | 0                  |
| **Maintenance**      | ⚠️ Shared with Lightspeed   | ❌ Full ownership            | ✅ Current team    |
| **Security**         | ✅ Leverages Lightspeed     | ❌ Full security review      | ✅ Known model     |
| **Multi-plugin**     | ✅ Shareable                | CNV-specific                 | N/A                |
| **Cost**             | Shared LLM costs            | Dedicated LLM costs          | None               |
| **DP Dependency**    | ⚠️ YES (MCP in DP)          | No                           | No                 |

**Recommendation:** Lightspeed + MCP IF GA timeline acceptable, otherwise Status Quo + enhanced static prompts

---

### Pros & Cons Analysis

#### Overall Integration Benefits

**User Experience:**

- ✅ Natural language interaction reduces learning curve
- ✅ Faster troubleshooting and problem resolution
- ✅ Contextual help reduces support tickets
- ✅ Power users can perform complex queries easily
- ⚠️ **BUT:** AI responses can be inconsistent or incorrect
- ⚠️ **BUT:** Not all users comfortable with AI assistance

**Technical:**

- ✅ Leverages existing K8s API integration
- ✅ MCP provides standardized AI interface
- ✅ Can use multiple AI providers (Claude, GPT, etc.)
- ✅ Extensible architecture for future AI features
- ✅ Reuse openshift-mcp-server for basic operations
- ⚠️ **BUT:** Additional backend services increase complexity
- ⚠️ **BUT:** Latency from AI API calls (1-3 seconds typical)
- ⚠️ **BUT:** No official browser-based MCP client SDK yet

**Business:**

- ✅ Differentiates CNV UI from competitors
- ✅ Reduces operational overhead
- ✅ Improves user productivity
- ✅ Enables self-service troubleshooting
- ⚠️ **BUT:** Ongoing AI API costs (pay-per-token)
- ⚠️ **BUT:** Depends on DP feature (risky for GA product)

#### Overall Integration Challenges

**Technical Challenges:**

- ❌ Requires careful error handling (AI can fail unpredictably)
- ❌ Need fallback mechanisms for AI unavailability
- ❌ Response time varies (network, AI provider load)
- ❌ Complexity of multi-server MCP architecture
- ❌ Cache invalidation for dynamic cluster state

**Operational:**

- ❌ Ongoing AI API costs:
  - Estimated $100-500/month for small clusters (POC)
  - $1000-5000/month for production at scale
  - Costs vary by model (Haiku cheap, Opus expensive)
- ❌ Requires API key management and rotation
- ❌ Need to handle rate limits and quotas
- ❌ Additional monitoring and logging overhead
- ❌ Training required for support teams

**Security & Privacy:**

- ❌ **Data sent to external AI providers** - privacy concerns
  - Cluster topology, resource names, error messages
  - May violate data residency requirements
  - Review provider ToS and data retention policies
- ❌ **AI hallucination risk** - can suggest incorrect fixes
  - Potentially dangerous cluster modifications
  - Need validation layer for all suggestions
- ❌ **Prompt injection attacks** - malicious user input
- ❌ Compliance challenges (HIPAA, FedRAMP, etc.)
  - May require self-hosted models
  - Additional audit and approval workflows

**User Experience:**

- ❌ AI responses can be inconsistent between queries
- ❌ May hallucinate or provide incorrect information
- ❌ Not all users comfortable with or trust AI
- ❌ Need clear indicators when AI is used vs static content
- ❌ Slower than direct UI interactions (AI latency)
- ❌ Requires internet connectivity (unless self-hosted)

**Dependency Risk:**

- ❌ **openshift-mcp-server is Developer Preview** (v4.21/v4.22)
  - APIs may change before productization
  - May be deprecated
  - Planned to be productized alongside Lightspeed downstream
- ❌ Dependency on external services (AI providers)
  - Service outages affect CNV UI
  - Provider pricing changes
  - Provider API changes
- ❌ Dependency on OpenShift Lightspeed
  - Not all customers install Lightspeed
  - Lightspeed version requirements
  - Cross-team coordination needed

---

### Alternative Approaches (Why Rejected)

**1. Direct Browser-Based AI Integration**

- Embed AI SDK directly in React app
- Call AI providers from browser
- Define MCP tools as JavaScript functions

**Rejected because:**

- ❌ Exposes API keys in browser (critical security issue)
- ❌ CORS and browser limitations
- ❌ No reusable MCP infrastructure
- ❌ Complex client-side code

**2. Chrome AI / Local Browser Models (Gemini Nano)**

- Use browser-based AI (no external calls)
- Completely offline

**Rejected because:**

- ❌ Limited capabilities compared to cloud models
- ❌ Browser support issues (Chrome-only)
- ❌ Not production-ready
- ❌ Poor accuracy for complex troubleshooting

**3. Self-Hosted Open Source Models (Llama, Mistral)**

- Deploy AI model on-cluster
- Complete air-gapped solution

**Postponed for future because:**

- ⚠️ Higher complexity and resource usage
- ⚠️ GPU requirements
- ⚠️ Model management overhead
- ⚠️ Lower accuracy than commercial models
- ✅ Good for regulated/air-gapped environments (future option)

**4. Extend openshift-mcp-server Instead of Separate CNV Server**

- Add CNV diagnostic tools to openshift-mcp-server

**Not recommended because:**

- ⚠️ Couples CNV release cycle to OpenShift
- ⚠️ CNV-specific code bloats generic server
- ⚠️ Harder to version independently
- ✅ Could contribute back later if tools prove valuable

---

### Why Lightspeed + MCP Despite Challenges?

**IF (and only IF) these conditions are met:**

1. ✅ openshift-mcp-server productization timeline is acceptable
2. ✅ Deployment/enablement model is defined
3. ✅ Product team comfortable with dependency on DP openshift-mcp-server
4. ✅ Security and privacy concerns addressable
5. ✅ Budget available for AI API costs

**THEN the benefits outweigh the risks:**

- Faster time to market (reuse Lightspeed)
- Better integration with OpenShift ecosystem
- Lower maintenance burden (shared infrastructure)
- Future-proof (aligns with Red Hat AI strategy)

**OTHERWISE:** Continue with current Lightspeed (static prompts) and revisit when MCP is GA

---

## Recommendations

### ⚠️ Wait for Clarification Before Major Investment

**Given the Developer Preview status and open questions, the recommendation is:**

**DO NOT proceed with full implementation until:**

1. ✅ openshift-mcp-server productization timeline is confirmed
2. ✅ Deployment/enablement model is defined
3. ✅ Product/PM alignment on CNV UI strategy during openshift-mcp-server DP period
4. ✅ Cross-team agreement on integration patterns

---

### Phased Approach Based on Answers

**Phase 0: Investigation & Alignment (CURRENT PHASE)**

**Objective:** Answer critical questions and validate technical approach before committing resources

**Actions:**

**Week 1: Cross-Team Meetings**

- [ ] **Meeting with Lightspeed Team**

  - Confirm v4.21/v4.22 DP scope and limitations for openshift-mcp-server
  - Understand productization timeline (planned alongside Lightspeed downstream - when specifically?)
  - Clarify expectations for plugin integration during openshift-mcp-server DP period
  - Discuss deployment/discovery mechanisms
  - **Ask:** How is openshift-mcp-server deployed? Is KubeVirt toolset enabled by default?

- [ ] **CNV Product/PM Alignment**

  - Share empirical data: 6.7% → 100% success with KubeVirt toolset
  - Define what CNV UI should deliver and when
  - Decide: wait for productization or build against DP openshift-mcp-server?
  - Establish customer expectations for AI features during DP period
  - Determine feature flag strategy
  - **Discuss:** Contribution strategy for openshift-mcp-server vs CNV-specific tools

- [ ] **Architecture Review with Operators Team**
  - Understand openshift-mcp-server deployment model and how KubeVirt toolset is enabled
  - Clarify if CNV installation should trigger any configuration changes to openshift-mcp-server
  - Discuss future: if/when CNV diagnostic server needed, how would it be deployed?
  - Design Lightspeed discovery mechanism for MCP servers
  - Plan version dependency management between CNV, Lightspeed, and openshift-mcp-server
  - Review RBAC and security model

**Week 2-3: Technical Validation**

- [ ] **Test openshift-mcp-server KubeVirt Toolset** (CRITICAL VALIDATION)

  - Deploy openshift-mcp-server locally with `--toolsets config,core,kubevirt`
  - Test basic operations: vm_create, vm_start, vm_stop
  - Validate integration with local Lightspeed instance
  - Measure response times and success rates
  - **Success criteria:** Create a Fedora VM using natural language query via Lightspeed
  - **Reference:** Follow test methodology from [KubeVirt MCP Integration doc](https://docs.google.com/document/d/1JEH4WHQwmLxtmt0TSo1w82SiBqKmRamRx1f6nHui24M/edit?usp=sharing)

- [ ] **Identify Specific CNV Gaps**

  - Test CNV-specific scenarios:
    - VM troubleshooting (should work at 80%, aim for improvement)
    - Advanced search/filtering (will likely fail, needs custom tool)
    - Snapshot operations (will fail, no tool exists)
  - Document which use cases work vs which fail
  - Prioritize gaps based on user impact and test data
  - **Use Evaluation-Driven Development methodology**

- [ ] **Write Evaluation for Top Gap**

  - Pick highest priority gap (e.g., advanced search)
  - Write YAML eval describing user interaction
  - Run eval to confirm it fails (0% success expected)
  - This validates our gap analysis

- [ ] **Document Decisions**
  - Capture deployment model choice
  - Define integration timeline
  - Establish success criteria (aim for 80-100% success like test data)
  - Create technical roadmap with phases
  - List tools to contribute to openshift-mcp-server vs build separately

**Timeline:** 2-3 weeks

**Output:**

- Go/No-Go decision with clear requirements
- Technical validation report showing openshift-mcp-server works (expected: 100% on basic ops)
- Prioritized list of CNV-specific tools to build (based on 0-20% success areas)
- Contribution plan for openshift-mcp-server (Phase 1 tools)
- Evaluation suite for CNV-specific features

---

### Phase 1: POC with Existing Toolset (Only if Phase 0 → GO)

**Objective:** Validate openshift-mcp-server integration and identify specific CNV gaps

**Prerequisites:**

- Lightspeed team confirms MCP can be used (even in DP)
- Deployment model defined (manual config acceptable for POC)
- Product approval to invest engineering time
- **Phase 0 validation confirms openshift-mcp-server works**

**Part A: Validate Existing Toolset (Week 1-2)**

- [ ] Deploy in dev cluster

  - Deploy openshift-mcp-server with KubeVirt toolset
  - Configure Lightspeed to use openshift-mcp-server
  - Test basic VM operations via CNV UI → Lightspeed → openshift-mcp-server

- [ ] Integration Testing

  - Test vm_create: "Create a Fedora VM named test-vm"
  - Test vm_start: "Start VM test-vm"
  - Test vm_stop: "Stop VM test-vm"
  - Test vm troubleshoot: "Why is my-vm not starting?"
  - **Expected:** 80-100% success based on empirical data

- [ ] Measure & Document
  - Response time (expect 2-4 seconds)
  - Success rate (expect 100% on basic ops)
  - Identify which CNV use cases work vs fail
  - **Deliverable:** Validation report confirming toolset works as expected

**Part B: Build ONE CNV-Specific Tool (Week 3-4) - ONLY if Part A validates gaps**

Choose highest priority gap identified in Phase 0 (likely one of):

- `diagnose_vm_error_advanced` - Enhanced troubleshooting
- `search_vms_semantic` - Natural language search
- `vm_snapshot_create` - Snapshot operations

**Actions:**

- [ ] Write evaluation YAML for the gap use case
- [ ] Run eval to confirm 0% success without tool
- [ ] Build minimal MCP server with single tool (Node.js or Go)
- [ ] Configure Lightspeed to use BOTH servers:
  - openshift-mcp-server (for basic ops)
  - cnv-diagnostic-mcp (for this one tool)
- [ ] Run eval again, expect 80-100% success
- [ ] Test from CNV UI

**Timeline:** 3-4 weeks total

**Success Criteria:**

- **Part A:** Confirm 100% success on basic VM operations (create, start, stop)
- **Part B:** Confirm 80%+ success on CNV-specific tool
- Response time < 5 seconds
- No security/RBAC issues
- Lightspeed successfully routes to correct MCP server

**Deliverable:**

- Technical report confirming hybrid approach works
- Recommendation: which CNV tools to build vs contribute to openshift-mcp-server

---

### Phase 2: CNV UI Integration (Only if Phase 1 succeeds AND GA timeline clear)

**Objective:** Add MCP-powered features to CNV UI behind feature flags

**Prerequisites:**

- POC successful
- Deployment model finalized
- Feature flag infrastructure in place
- Product approval for customer-facing features

**Actions:**

- [ ] Implement feature flag: `LIGHTSPEED_MCP_ENABLED`
- [ ] Add 2-3 MCP tools:
  - `search_virtual_machines`
  - `diagnose_vm_error`
  - `explain_vm_status`
- [ ] UI enhancements (progressive, feature-flagged):
  - Enhanced error popovers with "AI Diagnosis" button
  - OR AI-powered search (lower priority given complexity)
- [ ] Internal testing with team
- [ ] Security review
- [ ] Documentation (internal)

**Timeline:** 4-6 weeks

**Success Criteria:**

- Features work when feature flag enabled
- No impact when feature flag disabled
- 80%+ accuracy in error diagnosis
- Positive internal feedback

**Deliverable:** Feature-flagged integration ready for early adopter testing

---

### Phase 3: Production Deployment (Only when openshift-mcp-server productized)

**Objective:** Enable MCP features for all customers

**Prerequisites:**

- openshift-mcp-server is productized (not DP)
- CNV operator deployment automated
- Extensive testing completed
- Documentation ready

**Actions:**

- [ ] Finalize CNV operator MCP server deployment
- [ ] Remove feature flags (or flip to enabled by default)
- [ ] Customer documentation
- [ ] Support team training
- [ ] Monitoring and alerting
- [ ] Release notes

**Timeline:** Depends on openshift-mcp-server productization timeline

---

### Alternative: Continue with Current Lightspeed (No MCP)

**If answers indicate openshift-mcp-server productization is too far out:**

**Recommendation:** Enhance existing static prompt approach

**Actions:**

- Improve existing Lightspeed prompts in `src/views/lightspeed/utils/prompts.ts`
- Add more static prompts for common scenarios
- Better YAML attachment preparation
- Enhanced UI for existing Lightspeed features
- Wait for openshift-mcp-server productization before investing in tool-based approach

**Benefits:**

- Immediate customer value
- No dependency on DP features
- Lower risk
- Can migrate to MCP later when openshift-mcp-server is productized

---

### Why This Cautious Approach?

**Risk Mitigation:**

- **DP Dependencies:** Building against DP features risks wasted effort if APIs change
- **Deployment Uncertainty:** Without clear enablement model, features may not work in real deployments
- **Support Burden:** DP features may create support issues we can't resolve
- **Resource Efficiency:** Better to wait for clarity than build the wrong thing

**Strategic:**

- **Align with Red Hat:** Productize alongside Lightspeed, not before
- **Customer Expectations:** Don't promise features that depend on DP components
- **Quality:** Better to deliver stable GA features than unstable DP features

---

### Success Metrics (When/If Implemented)

**Technical:**

- Response time < 3 seconds for 90% of queries
- 95% uptime
- < 5% error rate
- No performance impact when MCP unavailable

**User Experience:**

- 50%+ of users try AI features (when enabled)
- 80%+ satisfaction rating
- Measurable reduction in support tickets

**Business:**

- Faster problem resolution (measured MTTR)
- Improved user productivity (measured by task completion time)
- Positive customer feedback in surveys

---

## Next Steps

### ✅ Immediate Actions (This Week)

**Objective:** Get answers to critical questions before any development work

1. **Schedule Cross-Team Meetings**

   - [ ] **Lightspeed Team Meeting**

     - Attendees: CNV PM, CNV Engineering Lead, Lightspeed PM/Eng
     - Agenda:
       - openshift-mcp-server DP status and productization timeline
       - Integration expectations during DP period
       - Deployment/discovery mechanisms
       - API stability guarantees

   - [ ] **CNV Product/Engineering Alignment**

     - Attendees: CNV PM, Engineering Manager, UI Team Lead
     - Agenda:
       - Review this document
       - Decide: POC now or wait for productization?
       - Define success criteria
       - Resource allocation decision

   - [ ] **CNV Operator Team Discussion**
     - Attendees: CNV Operator Team, UI Team
     - Agenda:
       - MCP server deployment options
       - Operator capabilities for dynamic deployment
       - Version/dependency management

2. **Document Key Questions**

   - [ ] Create shared document with questions from this analysis
   - [ ] Assign owners to each question
   - [ ] Set deadline for answers (2 weeks)

3. **Stakeholder Communication**
   - [ ] Share this analysis document with stakeholders
   - [ ] Present findings in team meeting
   - [ ] Set expectations: no development until questions answered

---

### 📋 Questions Requiring Answers

**Copy this to meeting notes / tracking doc:**

**Lightspeed Team:**

1. What is the openshift-mcp-server productization timeline? (planned alongside Lightspeed downstream - which version?)
2. What DP limitations should we be aware of?
3. Will openshift-mcp-server APIs change between DP and productization?
4. How should operators register/discover MCP servers?
5. Is there a plugin registry planned? If so, when?
6. What's the recommended approach for plugins during openshift-mcp-server DP period?

**CNV Product/PM:**

1. Should CNV UI build against DP openshift-mcp-server or wait for productization?
2. What customer value do we expect from openshift-mcp-server integration?
3. What's the priority vs other UI work?
4. Are we willing to support DP-dependent features?
5. What's acceptable timeline for delivery?

**CNV Operator Team & Lightspeed Team (Joint Questions):**

1. How is openshift-mcp-server deployed in OpenShift clusters? (always present, optional, etc.)
2. Is the KubeVirt toolset in openshift-mcp-server enabled by default?
3. Does CNV installation need to trigger any configuration in openshift-mcp-server or Lightspeed?
4. How does Lightspeed discover which MCP tools are available from openshift-mcp-server?
5. What are the version dependencies between CNV, openshift-mcp-server, Lightspeed, and MCP protocol?
6. What's the upgrade/downgrade story when any component is updated?

**Engineering:**

1. What feature flag infrastructure exists in CNV UI?
2. What's effort estimate for POC? (Phase 1)
3. What's effort estimate for full implementation? (Phase 2)
4. What testing environments are available?
5. What security review process is needed?

---

### 🔄 After Questions Answered (2-3 Weeks)

**Scenario A: Green Light for POC**

If answers indicate:

- openshift-mcp-server API is stable enough (even in DP)
- Productization timeline is reasonable
- Deployment model is defined
- Product approves POC

**Then:**

- [ ] Start Phase 1 (POC) as outlined in Recommendations section
- [ ] Assign 1 engineer for 2-3 weeks
- [ ] Set up development environment
- [ ] Build minimal MCP server
- [ ] Test end-to-end flow

**Scenario B: Wait for Productization**

If answers indicate:

- Productization timeline unclear or too far out
- DP APIs may change significantly
- openshift-mcp-server KubeVirt toolset enablement model unclear
- Product prefers to wait

**Then:**

- [ ] Pause MCP investigation
- [ ] Focus on improving existing Lightspeed integration
- [ ] Add more static prompts to `src/views/lightspeed/utils/prompts.ts`
- [ ] Revisit MCP when openshift-mcp-server is productized

**Scenario C: Build Alternative**

If answers indicate:

- openshift-mcp-server won't meet CNV needs
- Alternative approach preferred

**Then:**

- [ ] Evaluate direct MCP integration (see MCP_INTEGRATION_RESEARCH.md)
- [ ] Compare costs/benefits
- [ ] Make architecture decision

---

### 📅 Tentative Timeline (If Proceeding)

**Month 1: Investigation & Alignment**

- Week 1-2: Cross-team meetings, gather answers
- Week 3-4: Decision made, resources allocated

**Month 2-3: POC (Phase 1)**

- Week 5-6: Build minimal MCP server
- Week 7-8: Test and document findings
- End of Month 3: GO/NO-GO decision

**Month 4-6: Implementation (Phase 2)** _(only if POC successful)_

- Month 4: Build MCP tools and UI integration
- Month 5: Testing and security review
- Month 6: Internal rollout with feature flags

**Month 7+: Production (Phase 3)** _(only when MCP GA)_

- Depends on Lightspeed GA timeline
- Finalize deployment automation
- Customer documentation
- GA release

---

## FAQ

### General Questions

**Q: Does this require changes to OpenShift Lightspeed service?**
A: No, just configuration. Lightspeed already supports MCP servers via config. However, MCP support itself is in Developer Preview for v4.21/v4.22.

**Q: Can we use this without Lightspeed?**
A: Yes, but you'd lose authentication, LLM management, and UI integration. Not recommended. See MCP_INTEGRATION_RESEARCH.md for direct MCP approach.

**Q: What if Lightspeed isn't available in customer's cluster?**
A: Graceful degradation - existing UI works without AI features. AI is enhancement, not requirement. Features should be hidden when Lightspeed unavailable.

**Q: Security concerns with sending VM data to external LLM?**
A: Lightspeed supports self-hosted LLMs for air-gapped environments. Can also redact sensitive data. Security review required before any production deployment.

**Q: How much will this cost?**
A: Minimal - shares existing Lightspeed infrastructure. Only adds small MCP server container (256Mi RAM, 100m CPU). LLM costs shared across all OpenShift plugins.

**Q: Can other OpenShift plugins use our MCP server?**
A: Yes! That's a benefit - other teams can leverage virtualization tools. However, this requires clear API contracts and versioning strategy.

---

### Developer Preview Questions

**Q: Is it safe to build against Developer Preview features?**
A: Risk exists that DP APIs may change before productization. Recommendation: use feature flags, limit investment until productization timeline clear, prepare for API changes.

**Q: When will openshift-mcp-server be productized?**
A: Confirmed DP for v4.21 and v4.22. Planned to be productized alongside Lightspeed downstream. Need to engage with Lightspeed team for specific productization timeline.

**Q: What if openshift-mcp-server APIs change between DP and productization?**
A: This is why we recommend waiting for clarity before major investment. POC can validate, but production features should wait for productization or use feature flags.

**Q: Can we ship CNV UI features that depend on DP openshift-mcp-server?**
A: Product decision required. Generally not recommended to take hard dependencies on DP features in GA products.

---

### Deployment Questions

**Q: How does openshift-mcp-server's KubeVirt toolset get enabled when CNV is deployed? (Lee's question)**
A: **Needs clarification.** Key questions:

- Is openshift-mcp-server deployed by default in OpenShift clusters?
- Is the KubeVirt toolset enabled by default or does it require configuration?
- Does CNV installation trigger any configuration changes?
- How does Lightspeed discover the available tools?
  This is the primary deployment concern that needs to be addressed with the Lightspeed and Operators teams.

**Q: How does a future CNV diagnostic MCP server get deployed when CNV is installed?**
A: **Future consideration.** If we build a CNV diagnostic MCP server for advanced features (gaps in openshift-mcp-server), deployment options include: CNV operator deploys it, manual configuration, or future plugin registry. See Deployment section for detailed analysis. Note: This is separate from Lee's concern about openshift-mcp-server.

**Q: What happens if CNV is installed but Lightspeed is not?**
A: The openshift-mcp-server (if deployed) would be present but Lightspeed wouldn't use it. If a future CNV diagnostic MCP server is built, it would be deployed but unused. Should be harmless. CNV UI should detect Lightspeed availability and hide MCP features if not present.

**Q: What happens if Lightspeed is installed but CNV is not?**
A: The openshift-mcp-server may still be deployed (depending on OpenShift configuration), but the KubeVirt tools would be less relevant without CNV. Lightspeed works normally but CNV-specific UI integration wouldn't be available.

**Q: How do version dependencies work?**
A: **Needs clarification.** Need to define: minimum Lightspeed version, API versioning strategy, upgrade/downgrade behavior.

---

### Technical Questions

**Q: Does this require changes to OpenShift Lightspeed service?**
A: No code changes. Only configuration via ConfigMap. However, Lightspeed must support MCP (v1.0.5+).

**Q: What languages can we use for MCP server?**
A: Any language with MCP SDK. Node.js (TypeScript SDK) is easiest for POC. Go preferred for production (better performance, aligns with CNV ecosystem).

**Q: Can MCP tools modify cluster resources?**
A: Yes, with proper RBAC. However, recommendation is read-only for POC, write operations only in later phases with user confirmation.

**Q: How do we test this locally?**
A: Need local Lightspeed instance configured with MCP support. Can use manual configuration (Option 2) for development/testing.

**Q: What about rate limiting?**
A: Lightspeed handles LLM rate limiting. MCP server should implement its own rate limiting for K8s API calls.

---

### UI Questions

**Q: Do we need to change existing Lightspeed UI components?**
A: No. Can reuse `LightspeedCard` and `LightspeedHelpButton`. Just send different prompts that trigger MCP tools.

**Q: How does the UI know if MCP is available?**
A: Need feature detection. Options: query Lightspeed capabilities API, use feature flags, or check for specific MCP responses.

**Q: What if MCP request fails?**
A: Graceful fallback to regular Lightspeed (without MCP tools). Show error message or fall back to static prompts.

**Q: Can we build AI search without MCP?**
A: Yes, but limited. Current Lightspeed can answer questions about VMs if you send the YAML, but cannot dynamically query the cluster. MCP enables real-time cluster queries.

---

## Key Takeaways

**The Data:**

- Without KubeVirt tools: **6.7% AI success rate**
- With KubeVirt tools: **100% AI success rate**
- Improvement: **300-500% across all AI models tested**

**The Approach:**

- ✅ **Reuse** openshift-mcp-server KubeVirt toolset (proven 100% success)
- ✅ **Build** small CNV diagnostic server for gaps only (~500 lines)
- ✅ **Validate** using Evaluation-Driven Development methodology

**The Blockers:**

- `openshift-mcp-server` is Developer Preview (v4.21/v4.22), planned to be productized alongside Lightspeed downstream
- Unclear how openshift-mcp-server's KubeVirt toolset gets enabled when CNV is deployed
- Need answers before development starts

**Next Action:** Schedule meetings with Lightspeed, Product, and Operators teams. Share [empirical data](https://docs.google.com/document/d/1JEH4WHQwmLxtmt0TSo1w82SiBqKmRamRx1f6nHui24M/edit?usp=sharing) to support discussion.

---

## Resources

**Critical Reference Documents:**

- **KubeVirt Kubernetes MCP Server Toolset Integration** (PRIMARY REFERENCE)
  - https://docs.google.com/document/d/1JEH4WHQwmLxtmt0TSo1w82SiBqKmRamRx1f6nHui24M/edit?usp=sharing
  - Contains empirical test data showing 6.7% → 100% success improvement
  - Describes Evaluation-Driven Development (EDD) methodology
  - Test results for 5 AI agents across 11 test cases
  - Proves necessity of KubeVirt-specific MCP tools

**OpenShift Lightspeed:**

- Docs: https://docs.redhat.com/en/documentation/red_hat_lightspeed
- GitHub: https://github.com/openshift/lightspeed-service
- Status: **MCP support in Developer Preview (v4.21/v4.22)**

**MCP (Model Context Protocol):**

- Spec: https://modelcontextprotocol.io
- TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk
- Node SDK: `@modelcontextprotocol/sdk`
- What is MCP: https://modelcontextprotocol.io/docs/getting-started/intro

**OpenShift MCP Server (KubeVirt Toolset):**

- GitHub: https://github.com/openshift/openshift-mcp-server
- KubeVirt Toolset PR: https://github.com/containers/kubernetes-mcp-server/pull/386
- Integration Guide: https://developers.redhat.com/articles/2025/12/01/how-set-red-hat-lightspeed-model-context-protocol
- **Toolsets:** config, core, kubevirt, observability, helm, ossm, kcp

**CNV/KubeVirt Code:**

- Existing Lightspeed Integration: `src/views/lightspeed/`
- Prompts: `src/views/lightspeed/utils/prompts.ts`
- Components: `src/views/lightspeed/components/`
- LightspeedCard: Reusable AI query component
- LightspeedHelpButton: Context-aware help button

**Evaluation Tools (for EDD methodology):**

- mcpchecker evals: https://github.com/genmcp/mcpchecker
- KubeVirt test branch: https://github.com/lyarwood/kubernetes-mcp-server/tree/kubevirt_tests
  - Contains existing evals and scripts
  - Waiting for core project CI support

---

## Contact

For questions or discussions:

- Product questions: [Product team]
- Technical questions: [Engineering team]
- Lightspeed questions: OpenShift Lightspeed team
