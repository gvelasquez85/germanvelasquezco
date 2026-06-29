# Germán Velásquez — Sitio personal

Sitio web personal con CMS basado en archivos JSON.

## Estructura

- `index.html` — Sitio público (lee de content.json)
- `admin.html` — Panel CMS (requiere password)
- `content.json` — Toda la data del sitio
- `api/save.php` — API para guardar cambios
- `cms.secret` — Password del CMS
- `blog/` — Artículos del blog (HTML individuales)

## CMS

1. Ir a `/admin.html`
2. Password por defecto: `dev2026` (cambiar en `cms.secret`)
3. Editar secciones, guardar, previsualizar

## Deploy

Push a `main` → GitHub Actions despliega automáticamente a GitHub Pages.

## Desarrollo local

```bash
cd germanvelasquez-co
php -S localhost:8080
# Abrir http://localhost:8080
```
