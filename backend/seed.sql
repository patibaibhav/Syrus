-- ============================================
-- Autonomous Developer Onboarding Agent
-- Seed Data
-- ============================================

-- ============================================
-- PERSONAS (4 predefined role profiles)
-- ============================================
INSERT INTO personas (id, name, role, experience_level, tech_stack, onboarding_focus, learning_objectives)
VALUES
(
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Backend Intern (Node.js)',
    'backend',
    'intern',
    '["Node.js", "Express", "JavaScript", "PostgreSQL"]',
    'Core backend fundamentals, API development, database basics, and testing practices',
    'Learn company coding standards, set up local dev environment, understand the monorepo structure, write first API endpoint, complete a small bug fix ticket'
),
(
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'Junior Backend Engineer (Python)',
    'backend',
    'junior',
    '["Python", "FastAPI", "PostgreSQL", "Docker", "Redis"]',
    'Python service architecture, containerized development, CI/CD pipelines',
    'Set up Python dev environment with Docker, understand microservice boundaries, learn deployment pipeline, complete a service integration ticket'
),
(
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'Junior Frontend Engineer (React)',
    'frontend',
    'junior',
    '["React", "TypeScript", "TailwindCSS", "Vite", "Jest"]',
    'Component architecture, design system usage, state management, and frontend testing',
    'Set up frontend toolchain, learn the component library, understand state management patterns, fix a UI bug, implement a small feature'
),
(
    'd4e5f6a7-b8c9-0123-defa-234567890123',
    'Senior Backend Engineer (Node.js)',
    'backend',
    'senior',
    '["Node.js", "TypeScript", "PostgreSQL", "Redis", "Docker", "Kubernetes", "AWS"]',
    'System architecture deep-dive, infrastructure access, production monitoring, and mentorship responsibilities',
    'Understand full system architecture, gain production access, review deployment pipelines, complete a cross-service feature ticket, set up monitoring dashboards'
);

-- ============================================
-- TASKS (15 onboarding task templates)
-- ============================================
INSERT INTO tasks (id, title, description, category, order_index, verification_type, verification_params, pitfall_warning, estimated_minutes)
VALUES
-- SETUP CATEGORY (1-5)
(
    '11111111-1111-1111-1111-111111111101',
    'Google Workspace Setup',
    '## Set up your Google Workspace account\n\n1. Check your email for the Google Workspace invitation\n2. Accept the invitation and set your password\n3. Configure 2FA (mandatory)\n4. Set up your profile picture and display name\n5. Join the #engineering and #general channels on Google Chat\n\n**Verification**: Confirm you have completed setup by typing "done".',
    'Setup',
    1,
    'text_confirmation',
    '{}',
    'Make sure to enable 2FA immediately — your account will be locked after 24h without it.',
    15
),
(
    '11111111-1111-1111-1111-111111111102',
    'Slack Workspace Setup',
    '## Join the company Slack workspace\n\n1. Check your email for the Slack invitation link\n2. Create your account with your company email\n3. Set your display name to: FirstName LastName (Role)\n4. Join channels: #engineering, #dev-onboarding, #incidents, #deploys\n5. Send a hello message in #dev-onboarding\n\n**Verification**: Confirm completion by typing "done".',
    'Setup',
    2,
    'text_confirmation',
    '{}',
    'Join #incidents early — you''ll need to be aware of ongoing production issues.',
    10
),
(
    '11111111-1111-1111-1111-111111111103',
    'GitHub Organization Access',
    '## Get access to the GitHub organization\n\n1. Ensure you have a GitHub account (create one if needed)\n2. Send your GitHub username to your team lead via Slack DM\n3. Accept the organization invitation from your email\n4. Enable SSO authentication for the organization\n5. Set up a GPG key for commit signing (recommended)\n\n**Verification**: Confirm completion by typing "done".',
    'Setup',
    3,
    'text_confirmation',
    '{}',
    'You MUST enable SSO or you will not be able to clone any private repos.',
    20
),
(
    '11111111-1111-1111-1111-111111111104',
    'VPN Setup',
    '## Configure your VPN connection\n\n1. Download WireGuard from https://wireguard.com/install/\n2. Request your VPN config file from IT (Slack #it-support)\n3. Import the .conf file into WireGuard\n4. Test the connection by pinging the internal server: `ping internal.company.dev`\n5. Verify you can access the internal dashboard at https://internal.company.dev\n\n**Verification**: Confirm completion by typing "done".',
    'Setup',
    4,
    'text_confirmation',
    '{}',
    'The VPN must be active to access staging and production databases. Do NOT try to connect to DBs without it.',
    25
),
(
    '11111111-1111-1111-1111-111111111105',
    'Install Node.js (v18+)',
    '## Install Node.js v18 or later\n\n1. We recommend using `nvm` (Node Version Manager):\n   ```bash\n   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash\n   ```\n2. Install Node.js 18:\n   ```bash\n   nvm install 18\n   nvm use 18\n   ```\n3. Verify the installation:\n   ```bash\n   node --version\n   ```\n\n**Verification**: Paste the output of `node --version`.',
    'Setup',
    5,
    'node_version',
    '{"minVersion": "18.0.0"}',
    'Do NOT install Node.js via the system package manager — it often gives you an outdated version. Use nvm.',
    15
),
-- SETUP CATEGORY continued (6-8)
(
    '11111111-1111-1111-1111-111111111106',
    'Install Python 3.9+',
    '## Install Python 3.9 or later\n\n1. We recommend using `pyenv`:\n   ```bash\n   curl https://pyenv.run | bash\n   ```\n2. Install Python 3.11:\n   ```bash\n   pyenv install 3.11.0\n   pyenv global 3.11.0\n   ```\n3. Verify the installation:\n   ```bash\n   python --version\n   ```\n\n**Verification**: Paste the output of `python --version`.',
    'Setup',
    6,
    'python_version',
    '{"minVersion": "3.9"}',
    'Make sure to use pyenv or a virtual environment. System Python can cause permission issues and conflicts.',
    15
),
(
    '11111111-1111-1111-1111-111111111107',
    'Install Docker Desktop',
    '## Install Docker Desktop\n\n1. Download Docker Desktop from https://www.docker.com/products/docker-desktop\n2. Install and start Docker Desktop\n3. Verify Docker is running:\n   ```bash\n   docker --version\n   docker compose version\n   ```\n4. Pull the base images we use:\n   ```bash\n   docker pull node:18-alpine\n   docker pull postgres:15\n   ```\n\n**Verification**: Paste the output of `docker --version`.',
    'Setup',
    7,
    'docker_running',
    '{}',
    'Docker Desktop must be RUNNING (not just installed). Check the system tray icon. Also ensure you have at least 4GB allocated to Docker in settings.',
    20
),
(
    '11111111-1111-1111-1111-111111111108',
    'Install pnpm Package Manager',
    '## Install pnpm\n\nWe use pnpm as our package manager for faster installs and strict dependency management.\n\n1. Install pnpm globally:\n   ```bash\n   npm install -g pnpm\n   ```\n2. Verify:\n   ```bash\n   pnpm --version\n   ```\n\n**Verification**: Paste the output of `pnpm --version`.',
    'Setup',
    8,
    'pnpm_installed',
    '{}',
    'Do NOT use npm or yarn for installing dependencies. Our lockfiles are pnpm-only and using other managers will cause resolution conflicts.',
    5
),
-- TECHNICAL CATEGORY (9-12)
(
    '11111111-1111-1111-1111-111111111109',
    'Clone the Monorepo',
    '## Clone the company monorepo\n\n1. Make sure your SSH key is added to GitHub\n2. Clone the repository:\n   ```bash\n   git clone git@github.com:company/platform.git\n   cd platform\n   ```\n3. Install dependencies:\n   ```bash\n   pnpm install\n   ```\n4. Verify the repo structure:\n   ```bash\n   ls -la\n   ```\n\n**Verification**: Paste the output showing the cloned directory contents.',
    'Technical',
    9,
    'repo_cloned',
    '{}',
    'If git clone fails with "Permission denied", your SSH key is not configured correctly. Run `ssh -T git@github.com` to test.',
    15
),
(
    '11111111-1111-1111-1111-111111111110',
    'Configure Environment Variables',
    '## Set up your local environment variables\n\n1. Copy the example env file:\n   ```bash\n   cp .env.example .env.local\n   ```\n2. Request the development secrets from your team lead\n3. Fill in the following required variables:\n   - `DATABASE_URL`\n   - `REDIS_URL`\n   - `API_SECRET_KEY`\n   - `AWS_ACCESS_KEY_ID`\n   - `AWS_SECRET_ACCESS_KEY`\n4. Verify your env file has all required keys\n\n**Verification**: List the environment variable names (NOT values) you configured.',
    'Technical',
    10,
    'env_configured',
    '{"requiredKeys": ["DATABASE_URL", "REDIS_URL", "API_SECRET_KEY"]}',
    'NEVER commit .env files to git. Ensure .env.local is in your .gitignore. If you accidentally commit secrets, report it to #security immediately.',
    20
),
(
    '11111111-1111-1111-1111-111111111111',
    'Run the Service Locally',
    '## Start the development server\n\n1. Make sure Docker is running (for the database):\n   ```bash\n   docker compose up -d postgres redis\n   ```\n2. Run database migrations:\n   ```bash\n   pnpm run db:migrate\n   ```\n3. Start the dev server:\n   ```bash\n   pnpm run dev\n   ```\n4. Open http://localhost:3000 in your browser\n\n**Verification**: Paste the terminal output showing the server started successfully.',
    'Technical',
    11,
    'service_running',
    '{"expectedPort": 3000}',
    'If port 3000 is already in use, check for zombie Node processes: `lsof -i :3000` (macOS/Linux) or use `npx kill-port 3000`.',
    30
),
(
    '11111111-1111-1111-1111-111111111112',
    'Run the Test Suite',
    '## Run the automated test suite\n\n1. Ensure your local database is running\n2. Run the full test suite:\n   ```bash\n   pnpm run test\n   ```\n3. Check that all tests pass\n4. Run tests with coverage:\n   ```bash\n   pnpm run test:coverage\n   ```\n\n**Verification**: Paste the test results summary.',
    'Technical',
    12,
    'tests_passing',
    '{}',
    'If tests fail due to database issues, make sure you ran `pnpm run db:migrate:test` first to set up the test database.',
    20
),
-- COMPLIANCE & KNOWLEDGE CATEGORY (13-15)
(
    '11111111-1111-1111-1111-111111111113',
    'Review Architecture Documentation',
    '## Read the system architecture documentation\n\n1. Open the Architecture Guide in Confluence (or ask Axiom for a summary)\n2. Understand the high-level service map\n3. Identify which services your team owns\n4. Review the data flow diagrams\n5. Note any questions for your team lead\n\n**Verification**: Confirm you have reviewed the documentation by typing "done".',
    'Knowledge',
    13,
    'text_confirmation',
    '{}',
    NULL,
    45
),
(
    '11111111-1111-1111-1111-111111111114',
    'Complete Compliance Training',
    '## Complete required compliance modules\n\n1. Log into the Learning Management System (LMS) at https://learn.company.dev\n2. Complete the following modules:\n   - Information Security Awareness\n   - Data Privacy & GDPR\n   - Code of Conduct\n   - Acceptable Use Policy\n3. Download your completion certificates\n\n**Verification**: Confirm all modules are completed by typing "done".',
    'Compliance',
    14,
    'text_confirmation',
    '{}',
    'Compliance training must be completed within the first 5 business days. This is a blocker for production access.',
    60
),
(
    '11111111-1111-1111-1111-111111111115',
    'Read Coding Standards',
    '## Review the team coding standards\n\n1. Read the Coding Standards Guide (ask Axiom or check Confluence)\n2. Key areas to focus on:\n   - Naming conventions\n   - Error handling patterns\n   - Testing requirements (minimum 80% coverage for new code)\n   - PR review checklist\n   - Git commit message format (Conventional Commits)\n3. Set up your linter and formatter:\n   ```bash\n   pnpm run lint:setup\n   ```\n\n**Verification**: Confirm you have reviewed the standards by typing "done".',
    'Knowledge',
    15,
    'text_confirmation',
    '{}',
    NULL,
    30
);

-- ============================================
-- PERSONA_TASKS — Map tasks to personas
-- ============================================

-- Backend Intern (Node.js) — all setup, node-specific, technical, compliance
INSERT INTO persona_tasks (persona_id, task_id, order_index) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111101', 1),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111102', 2),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111103', 3),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111104', 4),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111105', 5),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111107', 6),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111108', 7),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111109', 8),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111110', 9),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111111', 10),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111112', 11),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111113', 12),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111114', 13),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111115', 14);

-- Junior Backend Engineer (Python) — all setup, python-specific, docker, technical
INSERT INTO persona_tasks (persona_id, task_id, order_index) VALUES
('b2c3d4e5-f6a7-8901-bcde-f12345678901', '11111111-1111-1111-1111-111111111101', 1),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', '11111111-1111-1111-1111-111111111102', 2),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', '11111111-1111-1111-1111-111111111103', 3),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', '11111111-1111-1111-1111-111111111104', 4),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', '11111111-1111-1111-1111-111111111106', 5),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', '11111111-1111-1111-1111-111111111107', 6),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', '11111111-1111-1111-1111-111111111109', 7),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', '11111111-1111-1111-1111-111111111110', 8),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', '11111111-1111-1111-1111-111111111111', 9),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', '11111111-1111-1111-1111-111111111112', 10),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', '11111111-1111-1111-1111-111111111113', 11),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', '11111111-1111-1111-1111-111111111114', 12),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', '11111111-1111-1111-1111-111111111115', 13);

-- Junior Frontend Engineer (React) — general setup, node, pnpm, repo, technical
INSERT INTO persona_tasks (persona_id, task_id, order_index) VALUES
('c3d4e5f6-a7b8-9012-cdef-123456789012', '11111111-1111-1111-1111-111111111101', 1),
('c3d4e5f6-a7b8-9012-cdef-123456789012', '11111111-1111-1111-1111-111111111102', 2),
('c3d4e5f6-a7b8-9012-cdef-123456789012', '11111111-1111-1111-1111-111111111103', 3),
('c3d4e5f6-a7b8-9012-cdef-123456789012', '11111111-1111-1111-1111-111111111105', 4),
('c3d4e5f6-a7b8-9012-cdef-123456789012', '11111111-1111-1111-1111-111111111108', 5),
('c3d4e5f6-a7b8-9012-cdef-123456789012', '11111111-1111-1111-1111-111111111109', 6),
('c3d4e5f6-a7b8-9012-cdef-123456789012', '11111111-1111-1111-1111-111111111110', 7),
('c3d4e5f6-a7b8-9012-cdef-123456789012', '11111111-1111-1111-1111-111111111111', 8),
('c3d4e5f6-a7b8-9012-cdef-123456789012', '11111111-1111-1111-1111-111111111112', 9),
('c3d4e5f6-a7b8-9012-cdef-123456789012', '11111111-1111-1111-1111-111111111113', 10),
('c3d4e5f6-a7b8-9012-cdef-123456789012', '11111111-1111-1111-1111-111111111114', 11),
('c3d4e5f6-a7b8-9012-cdef-123456789012', '11111111-1111-1111-1111-111111111115', 12);

-- Senior Backend Engineer (Node.js) — fewer basics, more technical depth
INSERT INTO persona_tasks (persona_id, task_id, order_index) VALUES
('d4e5f6a7-b8c9-0123-defa-234567890123', '11111111-1111-1111-1111-111111111101', 1),
('d4e5f6a7-b8c9-0123-defa-234567890123', '11111111-1111-1111-1111-111111111102', 2),
('d4e5f6a7-b8c9-0123-defa-234567890123', '11111111-1111-1111-1111-111111111103', 3),
('d4e5f6a7-b8c9-0123-defa-234567890123', '11111111-1111-1111-1111-111111111104', 4),
('d4e5f6a7-b8c9-0123-defa-234567890123', '11111111-1111-1111-1111-111111111105', 5),
('d4e5f6a7-b8c9-0123-defa-234567890123', '11111111-1111-1111-1111-111111111107', 6),
('d4e5f6a7-b8c9-0123-defa-234567890123', '11111111-1111-1111-1111-111111111108', 7),
('d4e5f6a7-b8c9-0123-defa-234567890123', '11111111-1111-1111-1111-111111111109', 8),
('d4e5f6a7-b8c9-0123-defa-234567890123', '11111111-1111-1111-1111-111111111110', 9),
('d4e5f6a7-b8c9-0123-defa-234567890123', '11111111-1111-1111-1111-111111111111', 10),
('d4e5f6a7-b8c9-0123-defa-234567890123', '11111111-1111-1111-1111-111111111112', 11),
('d4e5f6a7-b8c9-0123-defa-234567890123', '11111111-1111-1111-1111-111111111113', 12),
('d4e5f6a7-b8c9-0123-defa-234567890123', '11111111-1111-1111-1111-111111111114', 13),
('d4e5f6a7-b8c9-0123-defa-234567890123', '11111111-1111-1111-1111-111111111115', 14);

-- ============================================
-- DOCUMENTS — Internal knowledge base (10 docs)
-- ============================================
INSERT INTO documents (id, title, content, tags, category)
VALUES
(
    '22222222-2222-2222-2222-222222222201',
    'Company Overview',
    'Welcome to TechCorp! We are a Series B startup building the next-generation developer productivity platform. Founded in 2021, we now have 150+ engineers across 5 offices globally.\n\nOur mission: Make every developer 10x more productive.\n\nKey products:\n- Platform API: RESTful API serving 50M+ requests/day\n- Developer Dashboard: React-based internal tooling\n- CLI Tools: Command-line utilities for common workflows\n- Data Pipeline: Real-time event processing with Kafka\n\nEngineering culture:\n- We ship daily with continuous deployment\n- Code review is mandatory for all changes\n- We practice blameless post-mortems\n- Engineers own their services end-to-end\n- We use feature flags for safe rollouts\n\nTeam structure:\n- Platform Team: Core API, auth, infrastructure\n- Frontend Team: Dashboard, design system\n- Data Team: Analytics, ML, pipelines\n- DevEx Team: CI/CD, tooling, developer experience',
    ARRAY['company', 'overview', 'culture', 'teams'],
    'General'
),
(
    '22222222-2222-2222-2222-222222222202',
    'Engineering Standards & Best Practices',
    'Code Quality Standards:\n\n1. All code must pass linting (ESLint for JS/TS, Ruff for Python)\n2. Minimum 80% test coverage for new code\n3. All functions must have JSDoc/docstring comments\n4. Maximum function length: 50 lines\n5. Maximum file length: 400 lines\n\nNaming Conventions:\n- Files: kebab-case (e.g., user-service.js)\n- Classes: PascalCase (e.g., UserService)\n- Functions/variables: camelCase (e.g., getUserById)\n- Constants: UPPER_SNAKE_CASE (e.g., MAX_RETRY_COUNT)\n- Database tables: snake_case (e.g., user_sessions)\n\nError Handling:\n- Always use try/catch for async operations\n- Return structured error responses: { error: { code, message, details } }\n- Log errors with context (userId, requestId, etc.)\n- Never expose stack traces in production\n\nGit Workflow:\n- Branch naming: feature/TICKET-123-short-description\n- Commit messages: Conventional Commits (feat:, fix:, docs:, etc.)\n- PRs require at least 1 approval\n- Squash merge to main',
    ARRAY['standards', 'coding', 'best-practices', 'git'],
    'Engineering'
),
(
    '22222222-2222-2222-2222-222222222203',
    'Local Development Setup Guide',
    'Prerequisites:\n- macOS 12+ or Ubuntu 22.04+\n- Node.js 18+ (use nvm)\n- Python 3.9+ (use pyenv)\n- Docker Desktop 4.x\n- pnpm 8+\n\nStep 1: Clone the monorepo\n```bash\ngit clone git@github.com:company/platform.git\ncd platform\n```\n\nStep 2: Install dependencies\n```bash\npnpm install\n```\n\nStep 3: Start infrastructure\n```bash\ndocker compose up -d postgres redis elasticsearch\n```\n\nStep 4: Configure environment\n```bash\ncp .env.example .env.local\n# Fill in DATABASE_URL, REDIS_URL, API_SECRET_KEY\n```\n\nStep 5: Run migrations\n```bash\npnpm run db:migrate\npnpm run db:seed  # Optional: seed with test data\n```\n\nStep 6: Start the dev server\n```bash\npnpm run dev\n```\n\nThe API will be available at http://localhost:3000\nThe dashboard will be at http://localhost:5173\n\nCommon Issues:\n- Port 3000 in use: Run `npx kill-port 3000`\n- Docker not running: Start Docker Desktop first\n- pnpm not found: Run `npm install -g pnpm`',
    ARRAY['setup', 'local-dev', 'docker', 'environment'],
    'Engineering'
),
(
    '22222222-2222-2222-2222-222222222204',
    'System Architecture Overview',
    'Architecture: Microservices with API Gateway\n\nServices:\n1. API Gateway (Node.js/Express) — Port 3000\n   - Routes requests to appropriate services\n   - Handles authentication and rate limiting\n   - Serves the REST API\n\n2. User Service (Node.js) — Port 3001\n   - User registration, authentication, profiles\n   - JWT token management\n   - Team and role management\n\n3. Analytics Service (Python/FastAPI) — Port 3002\n   - Event processing and aggregation\n   - Dashboard metrics computation\n   - Report generation\n\n4. Notification Service (Node.js) — Port 3003\n   - Email, Slack, and push notifications\n   - Event-driven via Kafka consumers\n\nInfrastructure:\n- PostgreSQL 15: Primary database (RDS in prod)\n- Redis 7: Caching and session store\n- Kafka: Event streaming between services\n- S3: File storage (uploads, exports)\n- CloudFront: CDN for static assets\n\nDeployment:\n- Kubernetes (EKS) in production\n- Docker Compose for local development\n- GitHub Actions for CI/CD\n- ArgoCD for GitOps deployment',
    ARRAY['architecture', 'microservices', 'infrastructure'],
    'Engineering'
),
(
    '22222222-2222-2222-2222-222222222205',
    'Security Policy',
    'Security Requirements:\n\n1. Authentication:\n   - All API endpoints require JWT authentication\n   - Tokens expire after 24 hours\n   - Refresh tokens stored in httpOnly cookies\n   - 2FA required for production access\n\n2. Authorization:\n   - Role-based access control (RBAC)\n   - Principle of least privilege\n   - Service-to-service auth via mTLS\n\n3. Data Protection:\n   - PII must be encrypted at rest (AES-256)\n   - All API traffic over HTTPS/TLS 1.3\n   - Database connections encrypted with SSL\n   - Secrets managed via AWS Secrets Manager\n\n4. Code Security:\n   - No secrets in code or config files\n   - SQL queries must use parameterized queries\n   - Input validation on all user-supplied data\n   - Dependencies scanned weekly (Snyk)\n   - Container images scanned on build\n\n5. Incident Response:\n   - Report security issues to #security immediately\n   - Never share credentials via Slack/email\n   - If you suspect a breach, contact Security Team Lead\n   - All incidents documented in post-mortem template',
    ARRAY['security', 'policy', 'authentication', 'authorization'],
    'Compliance'
),
(
    '22222222-2222-2222-2222-222222222206',
    'Git Workflow Guide',
    'Git Branching Strategy:\n\nMain branches:\n- main: Production-ready code, deployed automatically\n- staging: Pre-production testing environment\n\nWorking branches:\n- feature/TICKET-123-description: New features\n- fix/TICKET-123-description: Bug fixes\n- hotfix/TICKET-123-description: Urgent production fixes\n\nWorkflow:\n1. Create branch from main:\n   ```bash\n   git checkout main && git pull\n   git checkout -b feature/TICKET-123-add-user-export\n   ```\n\n2. Make changes and commit:\n   ```bash\n   git add .\n   git commit -m "feat(users): add CSV export endpoint"\n   ```\n\n3. Push and create PR:\n   ```bash\n   git push origin feature/TICKET-123-add-user-export\n   ```\n\n4. PR Requirements:\n   - Descriptive title and body\n   - Link to ticket\n   - At least 1 code review approval\n   - All CI checks passing\n   - No merge conflicts\n\n5. Merge via squash merge on GitHub\n\nCommit Message Format (Conventional Commits):\n- feat: new feature\n- fix: bug fix  \n- docs: documentation change\n- style: formatting change\n- refactor: code refactor\n- test: adding tests\n- chore: maintenance task',
    ARRAY['git', 'workflow', 'branching', 'commits'],
    'Engineering'
),
(
    '22222222-2222-2222-2222-222222222207',
    'Code Review Guide',
    'Code Review Process:\n\n1. Author Responsibilities:\n   - Self-review your diff before requesting review\n   - Keep PRs small (< 400 lines changed)\n   - Write a clear PR description with context\n   - Add screenshots for UI changes\n   - Respond to all comments before re-requesting review\n\n2. Reviewer Responsibilities:\n   - Review within 4 business hours\n   - Be constructive, not critical\n   - Use "nit:" prefix for non-blocking suggestions\n   - Use "blocking:" prefix for must-fix issues\n   - Approve with comments if only nits remain\n\n3. What to Review:\n   - Logic correctness\n   - Error handling\n   - Test coverage (new code should have tests)\n   - Security implications\n   - Performance (no N+1 queries, proper indexing)\n   - Documentation updates\n   - API compatibility (breaking changes?)\n\n4. Review Checklist:\n   ☐ Code follows naming conventions\n   ☐ Functions have JSDoc comments\n   ☐ Error cases handled properly\n   ☐ Tests cover happy path and edge cases\n   ☐ No hardcoded values / magic numbers\n   ☐ No console.log statements',
    ARRAY['code-review', 'pr', 'review-process'],
    'Engineering'
),
(
    '22222222-2222-2222-2222-222222222208',
    'Deployment Guide',
    'Deployment Pipeline:\n\n1. Environments:\n   - Development: Local Docker Compose\n   - Staging: Auto-deployed on push to staging branch\n   - Production: Auto-deployed on merge to main (with approval gate)\n\n2. CI Pipeline (GitHub Actions):\n   - Lint check → Unit tests → Integration tests → Build → Deploy\n   - Average pipeline time: ~8 minutes\n   - Flaky test retries: 2 attempts\n\n3. Deploying to Staging:\n   ```bash\n   git checkout staging\n   git merge feature/your-branch\n   git push origin staging\n   ```\n   Monitor: https://grafana.internal.company.dev/staging\n\n4. Production Deploy:\n   - Merge PR to main → ArgoCD detects change → Rolling deploy\n   - Canary: 10% traffic for 5 minutes → 50% → 100%\n   - Rollback: Click "Rollback" in ArgoCD dashboard\n\n5. Feature Flags:\n   - Use LaunchDarkly for feature toggles\n   - All new features should be behind a flag\n   - Enable in staging first, then gradually in prod\n\n6. Monitoring:\n   - Grafana dashboards for metrics\n   - PagerDuty for on-call alerts\n   - Sentry for error tracking',
    ARRAY['deployment', 'ci-cd', 'pipeline', 'production'],
    'Engineering'
),
(
    '22222222-2222-2222-2222-222222222209',
    'API Style Guide',
    'REST API Conventions:\n\n1. URL Structure:\n   - Use plural nouns: /api/users, /api/teams\n   - Nested resources: /api/users/:id/sessions\n   - Use kebab-case for multi-word: /api/user-preferences\n   - API versioning in URL: /api/v1/users\n\n2. HTTP Methods:\n   - GET: Read (idempotent)\n   - POST: Create\n   - PUT: Full update\n   - PATCH: Partial update\n   - DELETE: Remove\n\n3. Response Format:\n   ```json\n   {\n     "success": true,\n     "data": { ... },\n     "error": null,\n     "meta": {\n       "page": 1,\n       "per_page": 20,\n       "total": 150\n     }\n   }\n   ```\n\n4. Error Response:\n   ```json\n   {\n     "success": false,\n     "data": null,\n     "error": {\n       "code": "VALIDATION_ERROR",\n       "message": "Email is required",\n       "details": [{ "field": "email", "message": "must be provided" }]\n     }\n   }\n   ```\n\n5. Status Codes:\n   - 200: Success\n   - 201: Created\n   - 400: Bad Request\n   - 401: Unauthorized\n   - 403: Forbidden\n   - 404: Not Found\n   - 500: Server Error\n\n6. Pagination:\n   - Use query params: ?page=1&per_page=20\n   - Return total count in meta',
    ARRAY['api', 'rest', 'style-guide', 'conventions'],
    'Engineering'
),
(
    '22222222-2222-2222-2222-222222222210',
    'Onboarding FAQ',
    'Frequently Asked Questions:\n\nQ: How long does onboarding usually take?\nA: Typically 3-5 business days to complete all tasks. Interns may take up to 7 days. Take your time — quality setup prevents headaches later.\n\nQ: What if I get stuck on a task?\nA: First, ask Axiom (your AI assistant). If Axiom can''t help, post in #dev-onboarding on Slack. Your team lead and onboarding buddy are also available.\n\nQ: When will I get my first real ticket?\nA: After completing your onboarding tasks, you''ll be assigned a starter ticket. These are small, well-defined issues designed to help you make your first contribution.\n\nQ: Do I need to do all tasks in order?\nA: The tasks are ordered by dependency. Some (like Google Workspace, Slack) can be done in any order, but technical tasks should follow the sequence.\n\nQ: Who is my onboarding buddy?\nA: Your team lead will assign you a buddy within your first day. They''re a peer on your team who can answer day-to-day questions.\n\nQ: How do I get help with VPN/IT issues?\nA: Post in #it-support on Slack. For urgent access issues, email it-help@company.dev.\n\nQ: What''s the work schedule?\nA: Core hours are 10am-4pm in your local timezone. Beyond that, flex hours. No expectation of evening/weekend work.\n\nQ: Where do I find the codebase documentation?\nA: Primary: Confluence wiki. Also check README.md files in each service directory. Ask Axiom for specific topics.\n\nQ: How do I request production access?\nA: Complete compliance training first, then request access via the Access Management Portal. Your team lead must approve.',
    ARRAY['faq', 'onboarding', 'questions', 'help'],
    'General'
);

-- ============================================
-- PITFALLS (12 common mistakes)
-- ============================================
INSERT INTO pitfalls (id, task_id, title, description, warning_message, condition)
VALUES
(
    '33333333-3333-3333-3333-333333333301',
    '11111111-1111-1111-1111-111111111105',
    'Wrong Node.js Version',
    'Installing Node.js via system package manager or Homebrew often gives an outdated version (v12 or v16).',
    '⚠️ Do NOT install Node.js via apt or brew. Use nvm to install v18+. Run: nvm install 18 && nvm use 18',
    '{"check": "version_below", "threshold": "18.0.0"}'
),
(
    '33333333-3333-3333-3333-333333333302',
    '11111111-1111-1111-1111-111111111105',
    'nvm Not in PATH',
    'After installing nvm, the terminal might not recognize it until you restart or source your shell config.',
    '⚠️ After installing nvm, restart your terminal or run: source ~/.bashrc (or ~/.zshrc). Then verify with: nvm --version',
    '{"check": "command_not_found", "command": "nvm"}'
),
(
    '33333333-3333-3333-3333-333333333303',
    '11111111-1111-1111-1111-111111111108',
    'Using npm Instead of pnpm',
    'Our monorepo uses pnpm workspaces. Using npm or yarn will create conflicting lockfiles and break dependency resolution.',
    '⚠️ Always use pnpm, never npm or yarn. Delete any package-lock.json or yarn.lock if created accidentally.',
    '{"check": "wrong_package_manager"}'
),
(
    '33333333-3333-3333-3333-333333333304',
    '11111111-1111-1111-1111-111111111107',
    'Docker Desktop Not Running',
    'Docker CLI commands will fail if Docker Desktop is not actually running in the background.',
    '⚠️ Docker Desktop must be RUNNING (check system tray). Just having it installed is not enough. Also allocate at least 4GB RAM in Docker settings.',
    '{"check": "docker_daemon_not_running"}'
),
(
    '33333333-3333-3333-3333-333333333305',
    '11111111-1111-1111-1111-111111111107',
    'Insufficient Docker Resources',
    'Default Docker Desktop settings may not allocate enough memory, causing containers to crash.',
    '⚠️ Go to Docker Desktop → Settings → Resources and set Memory to at least 4GB and CPUs to at least 2.',
    '{"check": "resource_limit"}'
),
(
    '33333333-3333-3333-3333-333333333306',
    '11111111-1111-1111-1111-111111111110',
    'Missing .env File',
    'The application will crash on startup if the .env.local file is missing or has missing required keys.',
    '⚠️ Make sure you copied .env.example to .env.local AND filled in all required values. The app will not start without DATABASE_URL, REDIS_URL, and API_SECRET_KEY.',
    '{"check": "missing_env_keys", "required": ["DATABASE_URL", "REDIS_URL", "API_SECRET_KEY"]}'
),
(
    '33333333-3333-3333-3333-333333333307',
    '11111111-1111-1111-1111-111111111110',
    'Committing .env to Git',
    'Accidentally committing secrets to the repository is a security incident.',
    '⚠️ NEVER commit .env files. Check .gitignore includes .env*. If you accidentally committed secrets, report to #security IMMEDIATELY.',
    '{"check": "git_tracked_env"}'
),
(
    '33333333-3333-3333-3333-333333333308',
    '11111111-1111-1111-1111-111111111109',
    'SSH Key Not Configured',
    'Git clone via SSH will fail if your key is not added to your GitHub account.',
    '⚠️ If git clone fails with "Permission denied (publickey)", you need to add your SSH key to GitHub. Run: ssh-keygen -t ed25519 && cat ~/.ssh/id_ed25519.pub, then add it at github.com/settings/keys',
    '{"check": "ssh_auth_failure"}'
),
(
    '33333333-3333-3333-3333-333333333309',
    '11111111-1111-1111-1111-111111111111',
    'Port Already in Use',
    'Another process might already be using port 3000, preventing the dev server from starting.',
    '⚠️ If you see "EADDRINUSE", another process is using the port. Run: npx kill-port 3000 (or lsof -i :3000 on macOS/Linux).',
    '{"check": "port_in_use", "port": 3000}'
),
(
    '33333333-3333-3333-3333-333333333310',
    '11111111-1111-1111-1111-111111111111',
    'Database Not Running',
    'The dev server will fail to connect if the local Postgres container is not running.',
    '⚠️ Before starting the dev server, make sure Docker containers are running: docker compose up -d postgres redis. Check with: docker compose ps',
    '{"check": "db_connection_refused"}'
),
(
    '33333333-3333-3333-3333-333333333311',
    '11111111-1111-1111-1111-111111111112',
    'Missing Test Database',
    'Tests use a separate database that needs its own migrations.',
    '⚠️ Tests use a separate database. Run: pnpm run db:migrate:test before running the test suite.',
    '{"check": "test_db_not_found"}'
),
(
    '33333333-3333-3333-3333-333333333312',
    '11111111-1111-1111-1111-111111111106',
    'System Python Conflicts',
    'Using the system-installed Python can cause permission errors and conflicts with OS packages.',
    '⚠️ Do NOT use system Python. Install pyenv and use it to manage Python versions. This prevents conflicts with OS-level Python packages.',
    '{"check": "system_python"}'
);

-- ============================================
-- TICKETS (8 starter tickets — 2 per persona)
-- ============================================
INSERT INTO tickets (id, title, description, repository, acceptance_criteria, difficulty, persona_id, status)
VALUES
-- Backend Intern tickets
(
    '44444444-4444-4444-4444-444444444401',
    'Fix: User API returns 500 on missing email parameter',
    'The POST /api/users endpoint returns a 500 error instead of a 400 when the email field is missing from the request body. Add proper input validation and return a descriptive error message.\n\nFile: services/user-service/src/controllers/users.js\nLine: ~45-60',
    'company/platform',
    '1. POST /api/users without email returns 400 with error message "Email is required"\n2. POST /api/users with invalid email format returns 400 with "Invalid email format"\n3. Existing tests still pass\n4. Add new test cases for both validation scenarios',
    'easy',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'assigned'
),
(
    '44444444-4444-4444-4444-444444444402',
    'Add: Created timestamp to user list API response',
    'The GET /api/users endpoint does not include the created_at field in the response. Add it to the SELECT query and response serializer.\n\nFile: services/user-service/src/controllers/users.js\nLine: ~20-35',
    'company/platform',
    '1. GET /api/users response includes created_at for each user\n2. created_at is formatted as ISO 8601 string\n3. Update the API documentation in docs/api.md\n4. Add a test to verify the field is present',
    'easy',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'assigned'
),
-- Junior Backend (Python) tickets
(
    '44444444-4444-4444-4444-444444444403',
    'Fix: Analytics endpoint missing rate limiting',
    'The GET /analytics/dashboard endpoint does not have rate limiting, which could cause high database load. Add rate limiting of 60 requests per minute per user.\n\nFile: services/analytics-service/src/routes/dashboard.py',
    'company/platform',
    '1. Endpoint is rate-limited to 60 req/min per user\n2. Returns 429 with Retry-After header when limit exceeded\n3. Rate limit resets correctly after the window\n4. Add integration test for rate limiting behavior',
    'medium',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'assigned'
),
(
    '44444444-4444-4444-4444-444444444404',
    'Add: Health check endpoint for analytics service',
    'The analytics service needs a /health endpoint for Kubernetes liveness probes. It should check database connectivity and return service version.\n\nFile: services/analytics-service/src/routes/health.py (new file)',
    'company/platform',
    '1. GET /health returns { status: "ok", version: "x.y.z", db: "connected" }\n2. Returns 503 if database is unreachable\n3. Response time < 200ms\n4. Add to the service router',
    'easy',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'assigned'
),
-- Junior Frontend (React) tickets
(
    '44444444-4444-4444-4444-444444444405',
    'Fix: Dashboard chart tooltip shows raw timestamp',
    'The line chart on the main dashboard shows raw ISO timestamps in tooltips instead of human-readable dates. Format the timestamp using date-fns.\n\nFile: dashboard/src/components/Charts/LineChart.tsx',
    'company/platform',
    '1. Tooltips show dates as "Mar 14, 2025 3:30 PM" format\n2. Use date-fns format function\n3. Works correctly across timezones\n4. No visual regression on the chart component',
    'easy',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'assigned'
),
(
    '44444444-4444-4444-4444-444444444406',
    'Add: Empty state illustration for user list page',
    'When there are no users matching a search filter, the page shows a blank area. Add an empty state with an illustration and helpful message.\n\nFile: dashboard/src/pages/UsersPage.tsx',
    'company/platform',
    '1. Shows an SVG illustration when no users match filter\n2. Displays message: "No users found. Try adjusting your search."\n3. Includes a "Clear filters" button that resets all filters\n4. Responsive on mobile and desktop\n5. Follow the design system empty state pattern',
    'easy',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'assigned'
),
-- Senior Backend (Node.js) tickets
(
    '44444444-4444-4444-4444-444444444407',
    'Implement: Request ID propagation across services',
    'Add X-Request-ID header propagation through the API gateway to all downstream services. This enables distributed tracing across our microservice architecture.\n\nFiles: services/api-gateway/src/middleware/request-id.js (new), services/api-gateway/src/app.js',
    'company/platform',
    '1. Generate UUID-based X-Request-ID if not present in incoming request\n2. Propagate to all downstream service calls\n3. Include in all log lines via AsyncLocalStorage\n4. Return X-Request-ID in response headers\n5. Add middleware tests\n6. Update the API gateway README',
    'medium',
    'd4e5f6a7-b8c9-0123-defa-234567890123',
    'assigned'
),
(
    '44444444-4444-4444-4444-444444444408',
    'Optimize: User query N+1 problem in team endpoint',
    'The GET /api/teams/:id/members endpoint fetches users one-by-one in a loop instead of using a single JOIN query. This causes ~50 DB queries for a team of 50.\n\nFile: services/user-service/src/controllers/teams.js',
    'company/platform',
    '1. Replace N+1 loop with single JOIN query\n2. Response time < 100ms for teams up to 100 members\n3. Include user role and last_active in response\n4. Maintain backward compatibility\n5. Add performance benchmark test',
    'medium',
    'd4e5f6a7-b8c9-0123-defa-234567890123',
    'assigned'
);

-- ============================================
-- USERS (2 sample users)
-- ============================================
-- Password for both: "password123" (bcrypt hash with 10 rounds)
INSERT INTO users (id, email, name, password_hash, role, experience_level, tech_stack, team, persona_id)
VALUES
(
    '55555555-5555-5555-5555-555555555501',
    'dev@company.dev',
    'Alex Chen',
    '$2a$10$xVqYLGUMSY1E7Ri5Z1Xpz.6h4B6eU/9lSdFzRxKYtB8VXYm7K3Wy6',
    'developer',
    'intern',
    '["Node.js", "JavaScript", "Express"]',
    'Platform',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
),
(
    '55555555-5555-5555-5555-555555555502',
    'manager@company.dev',
    'Sarah Martinez',
    '$2a$10$xVqYLGUMSY1E7Ri5Z1Xpz.6h4B6eU/9lSdFzRxKYtB8VXYm7K3Wy6',
    'manager',
    'senior',
    '["Node.js", "Python", "PostgreSQL", "AWS"]',
    'Platform',
    NULL
);

-- Create task instances for the developer user (Backend Intern persona)
INSERT INTO task_instances (id, user_id, task_id, status, order_index)
SELECT
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555501',
    pt.task_id,
    'not_started',
    pt.order_index
FROM persona_tasks pt
WHERE pt.persona_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- Assign starter tickets to the developer user
UPDATE tickets
SET assigned_to = '55555555-5555-5555-5555-555555555501'
WHERE persona_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- Initialize risk score for the developer
INSERT INTO risk_scores (user_id, score, factors, flag_for_manager)
VALUES (
    '55555555-5555-5555-5555-555555555501',
    0.15,
    '{"stuck_tasks": 0, "verification_failures": 0, "inactive_hours": 0, "low_completion": false, "no_chat_activity": true}',
    FALSE
);

-- Log initial onboarding event
INSERT INTO progress_logs (user_id, event_type, metadata)
VALUES (
    '55555555-5555-5555-5555-555555555501',
    'onboarding_started',
    '{"persona": "Backend Intern (Node.js)", "total_tasks": 14}'
);
