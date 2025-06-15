// src/index.ts
import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

// Paths
const postsDir = path.join(process.cwd(), 'src', 'posts');
const distDir = path.join(process.cwd(), 'dist');
const articlesDir = path.join(distDir, 'articles');

// Setup output directories
fs.mkdirSync(articlesDir, { recursive: true });

// Collect metadata
type PostMeta = {
  slug: string;
  title: string;
  date: string;
};

const posts: PostMeta[] = [];

const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));

files.forEach(file => {
  const filePath = path.join(postsDir, file);
  const markdown = fs.readFileSync(filePath, 'utf-8');

  const htmlContent = marked.parse(markdown);
  const slug = path.basename(file, '.md');

  // Extract date/title from filename and content
  const [date, ...nameParts] = slug.split('-');
  const titleMatch = markdown.match(/^# (.+)/);
  const title = titleMatch ? titleMatch[1] : slug;
  const dateFormatted = date; // Improve this later if needed

  posts.push({ slug, title, date: dateFormatted });

  // Write article page
  const articleHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
</head>
<body>
  <a href="../index.html">← Back to Home</a>
  ${htmlContent}
</body>
</html>
  `.trim();

  fs.writeFileSync(path.join(articlesDir, `${slug}.html`), articleHtml);
});

// Generate index.html
const listHtml = posts
  .sort((a, b) => b.date.localeCompare(a.date))
  .map(
    post => `
    <li>
      <a href="articles/${post.slug}.html">${post.title}</a>
      <small>(${post.date})</small>
    </li>`
  )
  .join('\n');

const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Blog</title>
  <style>
    body { font-family: sans-serif; padding: 2rem; max-width: 800px; margin: auto; }
    input { width: 100%; padding: 0.5rem; margin-bottom: 1rem; }
    li { margin-bottom: 0.5rem; }
  </style>
</head>
<body>
  <h1>My Blog</h1>
  <input type="text" id="search" placeholder="Search posts..." />
  <ul id="post-list">
    ${listHtml}
  </ul>

  <script>
    const input = document.getElementById('search');
    const list = document.getElementById('post-list');
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase();
      [...list.children].forEach(li => {
        li.style.display = li.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  </script>
</body>
</html>
`.trim();

fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml);

// Create 404.html
const errorHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Page Not Found</title>
</head>
<body>
  <h1>404 - Page Not Found</h1>
  <p>Sorry, we couldn't find that page.</p>
  <a href="index.html">← Back to Home</a>
</body>
</html>
`.trim();

fs.writeFileSync(path.join(distDir, '404.html'), errorHtml);

// Create robots.txt
fs.writeFileSync(path.join(distDir, 'robots.txt'), 'User-agent: *\nDisallow:');

// (Optional) Copy favicon.ico if you have one in /src
const faviconSrc = path.join(process.cwd(), 'src', 'favicon.ico');
const faviconDest = path.join(distDir, 'favicon.ico');
if (fs.existsSync(faviconSrc)) {
  fs.copyFileSync(faviconSrc, faviconDest);
}