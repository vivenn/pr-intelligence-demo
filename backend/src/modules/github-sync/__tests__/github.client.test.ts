import { Octokit } from '@octokit/rest';
import { GithubClient } from '../github.client';

/**
 * Tests the Octokit -> domain mapping in GithubClient. This is the integration boundary
 * where the comment-undercounting bugs lived, so the mapping is worth pinning down.
 */
describe('GithubClient', () => {
  function createOctokit(overrides: Record<string, unknown> = {}) {
    return {
      repos: {
        get: jest.fn().mockResolvedValue({ data: { id: 1, name: 'widgets', full_name: 'acme/widgets' } }),
      },
      pulls: {
        list: jest.fn().mockResolvedValue({ data: [{ number: 7 }] }),
        get: jest.fn().mockResolvedValue({
          data: {
            id: 100,
            number: 7,
            title: 'Add feature',
            user: { login: 'alice' },
            state: 'closed',
            merged_at: '2026-01-02T00:00:00Z',
            html_url: 'https://github.com/acme/widgets/pull/7',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-02T00:00:00Z',
            closed_at: '2026-01-02T00:00:00Z',
            additions: 10,
            deletions: 2,
            changed_files: 3,
          },
        }),
        listReviews: jest.fn().mockResolvedValue({
          data: [
            { id: 200, user: { login: 'bob' }, state: 'COMMENTED', submitted_at: '2026-01-01T06:00:00Z', body: 'Looks good' },
            { id: 201, user: { login: 'carol' }, state: 'APPROVED', submitted_at: '2026-01-01T07:00:00Z', body: '' },
          ],
        }),
        listReviewComments: jest.fn().mockResolvedValue({
          data: [{ id: 300, user: { login: 'bob' }, created_at: '2026-01-01T06:30:00Z' }],
        }),
        listCommits: jest.fn().mockResolvedValue({
          data: [{ sha: 'abc', author: { login: 'alice' }, commit: { author: { date: '2026-01-01T01:00:00Z' } } }],
        }),
        ...((overrides.pulls as object) ?? {}),
      },
      issues: {
        listComments: jest.fn().mockResolvedValue({
          data: [{ id: 400, user: { login: 'dave' }, created_at: '2026-01-01T08:00:00Z' }],
        }),
      },
    } as unknown as Octokit;
  }

  it('maps repository fields', async () => {
    const octokit = createOctokit();
    const client = new GithubClient(octokit);

    await expect(client.getRepository('acme', 'widgets')).resolves.toEqual({
      id: 1,
      name: 'widgets',
      fullName: 'acme/widgets',
    });
  });

  it('derives merged state and maps the html_url', async () => {
    const client = new GithubClient(createOctokit());

    const [result] = await client.getRepositoryPullRequests('acme', 'widgets');

    expect(result.pullRequest.state).toBe('merged');
    expect(result.pullRequest.url).toBe('https://github.com/acme/widgets/pull/7');
    expect(result.pullRequest.authorLogin).toBe('alice');
  });

  it('combines inline, conversation, and review-body comments with source-prefixed ids', async () => {
    const client = new GithubClient(createOctokit());

    const [result] = await client.getRepositoryPullRequests('acme', 'widgets');
    const ids = result.reviewComments.map((c) => c.externalId).sort();

    // inline review comment 300, issue comment 400, and review #200's body — but NOT
    // review #201 (empty body).
    expect(ids).toEqual(['issue:400', 'review:300', 'reviewbody:200']);
  });

  it('maps reviews with reviewer logins', async () => {
    const client = new GithubClient(createOctokit());

    const [result] = await client.getRepositoryPullRequests('acme', 'widgets');

    expect(result.reviews).toHaveLength(2);
    expect(result.reviews.map((r) => r.reviewerLogin).sort()).toEqual(['bob', 'carol']);
  });
});
