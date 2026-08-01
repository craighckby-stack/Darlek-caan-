/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/app/api/github/write-file/route.ts
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import { NextRequest, NextResponse } from 'next/server';
import type { WriteFileBody } from '@/lib/types';

// Helper to fetch the actual file SHA from GitHub if not provided or to ensure it is accurate
async function getFileSha(token: string, owner: string, repo: string, branch: string, filePath: string): Promise<string | null> {
  try {
    const cleanPath = filePath.replace(/^\/+|\/+$/g, '');
    const encodedPath = cleanPath.split('/').map(encodeURIComponent).join('/');
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      return data.sha || null;
    }
    return null;
  } catch {
    return null;
  }
}

// Helper to ensure target branch exists on GitHub, creating it from default branch if needed
async function ensureBranchExists(token: string, owner: string, repo: string, branch: string): Promise<boolean> {
  try {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    const refUrl = `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`;
    const refRes = await fetch(refUrl, { headers });
    if (refRes.ok) return true;

    // Branch not found, fetch repo info for default_branch
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) return false;

    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || 'main';

    const defRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(defaultBranch)}`, { headers });
    if (!defRefRes.ok) return false;

    const defRefData = await defRefRes.json();
    const defaultSha = defRefData.object?.sha;
    if (!defaultSha) return false;

    // Create branch
    const createRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ref: `refs/heads/${branch}`,
        sha: defaultSha,
      }),
    });

    return createRes.ok;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: WriteFileBody = await req.json();
    const { token, owner, repo, branch, path: filePath, content, sha, commitMessage } = body;

    if (!token || !owner || !repo || !branch || !filePath || content === undefined || content === null) {
      return NextResponse.json(
        { error: 'All fields are required: token, owner, repo, branch, path, content.' },
        { status: 400 }
      );
    }

    // Ensure branch exists before writing
    await ensureBranchExists(token, owner, repo, branch);

    // Resolve accurate live SHA from GitHub to eliminate stale SHA mismatches
    let finalSha = await getFileSha(token, owner, repo, branch, filePath) || sha || null;

    const cleanPath = filePath.replace(/^\/+|\/+$/g, '');
    const encodedPath = cleanPath.split('/').map(encodeURIComponent).join('/');
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`;

    const bodyPayload: Record<string, unknown> = {
      message: commitMessage || `[DARLEK CANN] Mutate ${filePath}`,
      content: Buffer.from(content, 'utf-8').toString('base64'),
      branch,
    };

    if (finalSha) {
      bodyPayload.sha = finalSha;
    }

    let res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyPayload),
    });

    // Self-healing retry: If status is 409, 422, or 400 (SHA conflict/missing branch), re-check branch/SHA and retry once
    if (!res.ok && (res.status === 409 || res.status === 422 || res.status === 400 || res.status === 404)) {
      console.warn(`[Write File] Issue (${res.status}) on ${filePath}. Re-verifying branch & live SHA...`);
      await ensureBranchExists(token, owner, repo, branch);
      const liveSha = await getFileSha(token, owner, repo, branch, filePath);
      if (liveSha) {
        bodyPayload.sha = liveSha;
      } else {
        delete bodyPayload.sha;
      }
      res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });
    }

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `GitHub API error: ${err}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    return NextResponse.json({
      success: true,
      commitSha: data.commit?.sha,
      contentSha: data.content?.sha,
      commitUrl: data.commit?.html_url,
    });
  } catch (error) {
    console.error('Write file error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

