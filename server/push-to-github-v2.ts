import { getUncachableGitHubClient } from './github';
import fs from 'fs';
import path from 'path';

async function getAllFiles(dir: string, baseDir: string = dir): Promise<{ path: string; content: string }[]> {
  const files: { path: string; content: string }[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === '.cache' || entry.name === 'uploads') {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...await getAllFiles(fullPath, baseDir));
    } else {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        files.push({ path: relativePath, content });
      } catch (error) {
        console.log(`Skipping binary file: ${relativePath}`);
      }
    }
  }

  return files;
}

async function pushToGitHub() {
  try {
    const octokit = await getUncachableGitHubClient();
    
    const { data: user } = await octokit.users.getAuthenticated();
    console.log(`Authenticated as: ${user.login}`);

    const repoName = 'luxe-ecommerce';
    const description = 'Modern e-commerce platform for fashion, fragrances, and accessories built with React, Express, and PostgreSQL';

    let repo;
    try {
      const { data } = await octokit.repos.get({
        owner: user.login,
        repo: repoName,
      });
      repo = data;
      console.log(`Repository ${repoName} already exists`);
    } catch (error: any) {
      if (error.status === 404) {
        const { data } = await octokit.repos.createForAuthenticatedUser({
          name: repoName,
          description,
          private: false,
          auto_init: true,
        });
        repo = data;
        console.log(`Created new repository: ${repo.html_url}`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        throw error;
      }
    }

    console.log('Collecting files...');
    const files = await getAllFiles('/home/runner/workspace');
    console.log(`Found ${files.length} files to upload`);

    const { data: ref } = await octokit.git.getRef({
      owner: user.login,
      repo: repoName,
      ref: 'heads/main',
    });
    const latestCommitSha = ref.object.sha;

    const { data: commit } = await octokit.git.getCommit({
      owner: user.login,
      repo: repoName,
      commit_sha: latestCommitSha,
    });
    const baseTreeSha = commit.tree.sha;
    console.log('Using existing main branch as base');

    console.log('Creating blobs for files...');
    const tree = await Promise.all(
      files.map(async (file, index) => {
        if (index % 20 === 0) {
          console.log(`Processing ${index}/${files.length} files...`);
        }
        const { data: blob } = await octokit.git.createBlob({
          owner: user.login,
          repo: repoName,
          content: Buffer.from(file.content).toString('base64'),
          encoding: 'base64',
        });

        return {
          path: file.path,
          mode: '100644' as const,
          type: 'blob' as const,
          sha: blob.sha,
        };
      })
    );

    console.log('Creating tree...');
    const { data: newTree } = await octokit.git.createTree({
      owner: user.login,
      repo: repoName,
      tree,
      base_tree: baseTreeSha,
    });

    console.log('Creating commit...');
    const { data: newCommit } = await octokit.git.createCommit({
      owner: user.login,
      repo: repoName,
      message: 'Push complete e-commerce application\n\nFeatures:\n- Admin panel with product CRUD operations\n- Shopping cart with confetti animations\n- Smooth page transitions using framer-motion\n- Royal blue color scheme with French UI\n- JWT authentication with role-based access\n- XAF currency support',
      tree: newTree.sha,
      parents: [latestCommitSha],
    });

    await octokit.git.updateRef({
      owner: user.login,
      repo: repoName,
      ref: 'heads/main',
      sha: newCommit.sha,
    });

    console.log('\n✅ Successfully pushed to GitHub!');
    console.log(`Repository URL: ${repo.html_url}`);
    console.log(`Commit SHA: ${newCommit.sha}`);
    
    return {
      url: repo.html_url,
      commitSha: newCommit.sha,
    };
  } catch (error: any) {
    console.error('Error pushing to GitHub:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

pushToGitHub()
  .then((result) => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
