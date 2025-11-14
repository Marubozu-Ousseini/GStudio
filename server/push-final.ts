import { getUncachableGitHubClient } from './github';
import fs from 'fs';
import path from 'path';

async function getAllFiles(dir: string, baseDir: string = dir): Promise<{ path: string; content: string }[]> {
  const files: { path: string; content: string }[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === '.cache' || entry.name === 'uploads' || entry.name.startsWith('.')) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...await getAllFiles(fullPath, baseDir));
    } else {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        files.push({ path: relativePath, content });
      } catch (error) {
        // Skip binary files
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

    console.log(`\nDeleting existing empty repository if it exists...`);
    try {
      await octokit.repos.delete({
        owner: user.login,
        repo: repoName,
      });
      console.log(`Deleted empty repository`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error: any) {
      if (error.status === 404) {
        console.log('No existing repository to delete');
      }
    }

    console.log(`\nCreating fresh repository with README...`);
    const { data: repo } = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      description,
      private: false,
      auto_init: true,
    });
    console.log(`Created repository: ${repo.html_url}`);

    console.log('\nWaiting for repository initialization...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('Collecting project files...');
    const files = await getAllFiles('/home/runner/workspace');
    console.log(`Found ${files.length} files to upload`);

    const { data: ref } = await octokit.git.getRef({
      owner: user.login,
      repo: repoName,
      ref: 'heads/main',
    });

    const { data: commit } = await octokit.git.getCommit({
      owner: user.login,
      repo: repoName,
      commit_sha: ref.object.sha,
    });

    console.log('\nCreating blobs for all files...');
    const tree = [];
    for (let i = 0; i < files.length; i++) {
      if (i % 10 === 0) {
        console.log(`  Progress: ${i}/${files.length} files`);
      }
      const file = files[i];
      const { data: blob } = await octokit.git.createBlob({
        owner: user.login,
        repo: repoName,
        content: Buffer.from(file.content).toString('base64'),
        encoding: 'base64',
      });

      tree.push({
        path: file.path,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: blob.sha,
      });
    }
    console.log(`  Completed: ${files.length}/${files.length} files`);

    console.log('\nCreating git tree...');
    const { data: newTree } = await octokit.git.createTree({
      owner: user.login,
      repo: repoName,
      tree,
      base_tree: commit.tree.sha,
    });

    console.log('Creating commit...');
    const { data: newCommit } = await octokit.git.createCommit({
      owner: user.login,
      repo: repoName,
      message: `🎉 Initial commit: Complete e-commerce application

Features:
- 🛍️ Admin panel with full product CRUD operations
- 🛒 Shopping cart with confetti celebration animations
- ✨ Smooth page transitions using framer-motion
- 💙 Royal blue color scheme with French UI
- 🔐 JWT authentication with role-based access control
- 💰 XAF currency support
- 📱 Responsive design with luxury aesthetics

Tech Stack:
- Frontend: React, TypeScript, Tailwind CSS, shadcn/ui
- Backend: Node.js, Express, PostgreSQL (Neon)
- Auth: JWT with bcrypt
- State: TanStack Query, React Context
- Animations: framer-motion, canvas-confetti`,
      tree: newTree.sha,
      parents: [ref.object.sha],
    });

    console.log('Updating main branch...');
    await octokit.git.updateRef({
      owner: user.login,
      repo: repoName,
      ref: 'heads/main',
      sha: newCommit.sha,
    });

    console.log('\n✅ Successfully pushed to GitHub!');
    console.log(`\nRepository: ${repo.html_url}`);
    console.log(`Commit: ${newCommit.sha.substring(0, 7)}`);
    console.log(`\nView your code: ${repo.html_url}/tree/main`);
    
    return {
      url: repo.html_url,
      commitSha: newCommit.sha,
    };
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
    throw error;
  }
}

pushToGitHub()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed');
    process.exit(1);
  });
