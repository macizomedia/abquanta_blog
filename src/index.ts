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
  <link rel="stylesheet" href="../styles.css" />
</head>
<body>
  <button id="theme-toggle" style="float:right; margin:0 0 1rem 1rem; font-family:var(--font-code); background:var(--color-bg-alt); color:var(--color-fg); border:1px solid var(--color-accent); border-radius:4px; padding:0.3rem 0.8rem; cursor:pointer;">🌙 Dark Mode</button>
  <a href="../index.html">← Back to Home</a>
  ${htmlContent}
  <script>
    // Dark mode toggle
    const themeBtn = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    function setTheme(theme) {
      document.body.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      themeBtn.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    }
    // Initial theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
    themeBtn.addEventListener('click', () => {
      setTheme(document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  </script>
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
  <title>Latest Articles</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <button id="theme-toggle" style="float:right; margin:0 0 1rem 1rem; font-family:var(--font-code); background:var(--color-bg-alt); color:var(--color-fg); border:1px solid var(--color-accent); border-radius:4px; padding:0.3rem 0.8rem; cursor:pointer;">🌙 Dark Mode</button>
  <h1>Latest Articles</h1>
  <input type="text" id="search" placeholder="Search posts..." />
  <ul id="post-list">
    ${listHtml}
  </ul>

  <script>
    // Search filter
    const input = document.getElementById('search');
    const list = document.getElementById('post-list');
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase();
      [...list.children].forEach(li => {
        li.style.display = li.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });

    // Dark mode toggle
    const themeBtn = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    function setTheme(theme) {
      document.body.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      themeBtn.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    }
    // Initial theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
    themeBtn.addEventListener('click', () => {
      setTheme(document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
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
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <button id="theme-toggle" style="float:right; margin:0 0 1rem 1rem; font-family:var(--font-code); background:var(--color-bg-alt); color:var(--color-fg); border:1px solid var(--color-accent); border-radius:4px; padding:0.3rem 0.8rem; cursor:pointer;">🌙 Dark Mode</button>
  <h1>404 - Page Not Found</h1>
  <p>Sorry, we couldn't find that page.</p>
  <a href="index.html">← Back to Home</a>
  <script>
    // Dark mode toggle
    const themeBtn = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    function setTheme(theme) {
      document.body.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      themeBtn.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    }
    // Initial theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
    themeBtn.addEventListener('click', () => {
      setTheme(document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  </script>
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