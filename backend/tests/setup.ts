process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/pr_intelligence_test?schema=public';
process.env.GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'test-token';
process.env.GITHUB_ORG = process.env.GITHUB_ORG || 'test-org';
process.env.GITHUB_REPOS = process.env.GITHUB_REPOS || 'test-repo';
