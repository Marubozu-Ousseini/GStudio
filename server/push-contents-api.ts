// Replit GitHub integration removed
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

    console.log('\nChecking repository status...');
    let repo;
    try {
      const { data } = await octokit.repos.get({
        owner: user.login,
        repo: repoName,
      });
      repo = data;
      console.log(`Using existing repository: ${repo.html_url}`);
    } catch (error: any) {
      console.log('Repository not found. Please create it on GitHub first.');
      return;
    }

    console.log('\nCollecting project files...');
    const files = await getAllFiles('/home/runner/workspace');
    console.log(`Found ${files.length} files to upload`);

    console.log('\nPushing files using Contents API...');
    let uploaded = 0;
    let failed = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (i % 10 === 0 && i > 0) {
        console.log(`  Progress: ${i}/${files.length} files (${uploaded} uploaded, ${failed} failed)`);
      }

      try {
        const contentBase64 = Buffer.from(file.content).toString('base64');
        
        await octokit.repos.createOrUpdateFileContents({
          owner: user.login,
          repo: repoName,
          path: file.path,
          message: `Add ${file.path}`,
          content: contentBase64,
          branch: 'main',
        });
        
        uploaded++;
      } catch (error: any) {
        failed++;
        if (error.status !== 409) {
          console.error(`  Failed to upload ${file.path}: ${error.message}`);
        }
      }
    }

    console.log(`\n✅ Push complete!`);
    console.log(`   Uploaded: ${uploaded} files`);
    console.log(`   Failed: ${failed} files`);
    console.log(`\n🎉 Repository: ${repo.html_url}`);
    
    return {
      url: repo.html_url,
      uploaded,
      failed,
    };
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    throw error;
  }
}

pushToGitHub()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
