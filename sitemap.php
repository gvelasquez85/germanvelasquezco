<?php
// Dynamic sitemap generator for germanvelasquez.co
// Includes all static pages + blog posts from blog/content.json

header('Content-Type: application/xml; charset=UTF-8');

$base = 'https://germanvelasquez.co';
$now = date('Y-m-d');

// Blog posts
$posts = [];
$json = file_get_contents(__DIR__ . '/blog/content.json');
if ($json) {
    $data = json_decode($json, true);
    $posts = $data['posts'] ?: [];
}

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc><?= $base ?>/</loc>
    <lastmod><?= $now ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc><?= $base ?>/blog.html</loc>
    <lastmod><?= $now ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc><?= $base ?>/labs.html</loc>
    <lastmod><?= $now ?></lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
<?php foreach ($posts as $post): $slug = htmlspecialchars($post['id']); $date = $post['date'] ?? $now; ?>
  <url>
    <loc><?= $base ?>/blog/post.html?id=<?= $slug ?></loc>
    <lastmod><?= htmlspecialchars($date) ?></lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
<?php endforeach; ?>
</urlset>
