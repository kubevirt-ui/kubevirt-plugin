# Part 1 - Get a github action workflow running on an OpenShift cluster

Use GitHub Action Runner Controller (ARC) to enable "ephemeral self-hosted runners" as a workflow job `runs-on` target.

Notes:

- A two part install via helm:

  - runner scale set controller (ARC) - installed once per cluster
  - runner scale set (RSS) - installed per repo+runner, provides handling for a specific self-hosted runner

- No incoming network access is required, ARC uses a polling system

- The helm chart is patched at install time to:

  - Define the SCC, SA and RBAC bindings the ARC, RSS listener, and RSS ephemeral runner pods will be assigned
  - Define the RSS ephemeral container's image

- Authentication from the ARC and RSS to GitHub uses a GitHub App

- All of the configurations allow us to control what image runs workflows, how that deployment is managed, and the workflow's embedded permissions to interact with the cluster

# Part 2 - Control the workflow's container image

Develop an ARC runner image that includes all needed tools. This allows specific control over what tools and libraries are provided by default to the workflows.

Notes:

- Use an `ImageStream` and `BuildConfig` to build the container image directly on the Cluster itself.
- The script that sets up the `BuildConfig` can lookup the proper versions of `oc` and `virtctl`
- The build can include specific versions/locations of important tools

# Part 3 - Setup an action run specific CI environment on OpenShift cluster

Each test run needs to establish its own self-contained (as much as possible at least) environment to run tests. This comes down to creating a namespace, deploying the plugin to be tests, and deploying a dev console. When it is all running, there is a console+plugin+CI namespace easily created for each CI run.

Notes:

- A two part helm chart based install:

  - `ci-env-controller` uses a collection of ConfigMaps to control CI test environments
  - `ci-test-stack` is the deployment to be able to run and access a console, plugin and namespace

- The arc RSS only needs enough permissions to manipulate the ConfigMaps

- The controller sets up the namespace, and runs the console in "off cluster" mode with no authentication required

- Accessing the test stack's route runs with a SA that has enough permissions to do everything needed for the e2e testing

- The exact way this is all deployed and how the SA and role binding are setup could use some additional work to make the RBAC being used everywhere very obvious

- The ConfigMaps will timeout and the test stack reaped around a default of 2 hours after it is created.

# Part 4 - Run full workflow from GitHub, watch all job steps run as expected

The workflow job will run on the RSS, be able to create a `ci-test-stack` by pushing a ConfigMap to the `ci-env-controller`, get a route to the test stack and run all tests targeting that route.

Notes:

- The route can be on-cluster only, or use a publicly available route

- GitHub actions are used to request and release the test stack

- Test can run any way we want. The POC is using a slim version of the cypress gating tests and the Cypress provided github action.

# Part 5 - Updates to diagnostic and test results artifact tracking

Anything that could be useful (test reports, pod logs, cluster log) are collected and pushed to artifacts to capture all the test run details.

# Part 6 - Allow developers to manually create/remove CI environments

Since a `ci-test-stack` can be requested by creating a ConfigMap, anyone login with the permissions to ask for one can get one. This allows developers to be able to manually create a test stack with any custom build of a plugin image they want.
