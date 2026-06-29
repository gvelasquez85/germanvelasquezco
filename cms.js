// CMS Editor for germán.dev — reads/writes content.json via PHP API
(function() {
  const API = 'api/save.php';
  let content = {};
  let secret = '';

  // Try to load secret from sessionStorage
  secret = sessionStorage.getItem('cms-secret') || '';

  function isCMSEnabled() {
    return secret.length > 0;
  }

  function promptSecret() {
    const s = prompt('🔑 CMS Password:');
    if (s) {
      secret = s;
      sessionStorage.setItem('cms-secret', s);
      return true;
    }
    return false;
  }

  async function loadContent() {
    try {
      const res = await fetch(API);
      content = await res.json();
    } catch(e) {
      console.error('CMS: failed to load content', e);
    }
    return content;
  }

  async function saveContent(data) {
    try {
      const res = await fetch(API + '?token=' + encodeURIComponent(secret), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.ok) {
        showToast('✓ Guardado');
      } else {
        showToast('✗ Error: ' + (result.error || 'unknown'), true);
      }
    } catch(e) {
      showToast('✗ Error de conexión', true);
    }
  }

  function showToast(msg, isError) {
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, {
      position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
      background: isError ? '#dc2626' : '#166534', color: '#fff',
      padding: '12px 24px', borderRadius: '100px', fontFamily: 'Montserrat, sans-serif',
      fontSize: '14px', fontWeight: '600', zIndex: '99999',
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)', transition: 'opacity 0.3s'
    });
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2000);
  }

  // Build CMS panel
  function buildPanel() {
    // Remove existing
    const existing = document.getElementById('cms-panel');
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.id = 'cms-panel';
    Object.assign(panel.style, {
      position: 'fixed', top: '0', right: '-480px', width: '480px', height: '100vh',
      background: '#fff', boxShadow: '-8px 0 32px rgba(0,0,0,0.15)', zIndex: '9998',
      transition: 'right 0.4s cubic-bezier(0.4,0,0.2,1)', overflowY: 'auto', padding: '24px',
      fontFamily: 'Montserrat, sans-serif'
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    Object.assign(closeBtn.style, {
      position: 'absolute', top: '16px', right: '16px', background: 'none',
      border: 'none', fontSize: '24px', cursor: 'pointer', color: '#888'
    });
    closeBtn.onclick = closePanel;
    panel.appendChild(closeBtn);

    const title = document.createElement('h4');
    title.textContent = '📝 Editor de contenido';
    Object.assign(title.style, { fontSize: '16px', fontWeight: '700', margin: '0 0 20px 0', color: '#0A0A0A' });
    panel.appendChild(title);

    // Flatten content into editable fields
    const fields = flattenContent(content);
    const container = document.createElement('div');
    container.id = 'cms-fields';

    fields.forEach(f => {
      const div = document.createElement('div');
      Object.assign(div.style, { marginBottom: '12px' });

      const label = document.createElement('label');
      label.textContent = f.path;
      Object.assign(label.style, {
        display: 'block', fontSize: '11px', fontWeight: '600',
        textTransform: 'uppercase', letterSpacing: '0.5px',
        color: '#555', marginBottom: '4px'
      });
      div.appendChild(label);

      const input = f.multiline ? document.createElement('textarea') : document.createElement('input');
      if (f.multiline) input.rows = 3;
      input.value = f.value;
      input.dataset.path = f.path;
      Object.assign(input.style, {
        width: '100%', fontFamily: 'Montserrat, sans-serif', fontSize: '14px',
        padding: '10px 12px', border: '1px solid #ccc', borderRadius: '8px',
        resize: 'vertical'
      });
      div.appendChild(input);
      container.appendChild(div);
    });

    panel.appendChild(container);

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Guardar cambios';
    Object.assign(saveBtn.style, {
      display: 'block', width: '100%', padding: '12px',
      background: '#FF6B2C', color: '#fff', fontFamily: 'Montserrat, sans-serif',
      fontSize: '14px', fontWeight: '600', border: 'none', borderRadius: '8px',
      cursor: 'pointer', marginTop: '16px'
    });
    saveBtn.onclick = async () => {
      const newContent = unflattenFields(container, fields);
      await saveContent(newContent);
      // Reload page to reflect changes
      setTimeout(() => location.reload(), 500);
    };
    panel.appendChild(saveBtn);

    document.body.appendChild(panel);
    return panel;
  }

  function flattenContent(obj, prefix) {
    prefix = prefix || '';
    const result = [];
    for (const key of Object.keys(obj)) {
      const path = prefix ? prefix + '.' + key : key;
      const val = obj[key];
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        result.push(...flattenContent(val, path));
      } else if (Array.isArray(val)) {
        // Skip arrays (stats, steps, diffs, items, tags) — too complex for simple editor
        // These stay in content.json and are edited directly
      } else {
        result.push({
          path,
          value: String(val),
          multiline: String(val).length > 60
        });
      }
    }
    return result;
  }

  function unflattenFields(container, fields) {
    const result = JSON.parse(JSON.stringify(content)); // deep clone
    const inputs = container.querySelectorAll('[data-path]');
    inputs.forEach(input => {
      const path = input.dataset.path.split('.');
      let obj = result;
      for (let i = 0; i < path.length - 1; i++) {
        obj = obj[path[i]];
      }
      obj[path[path.length - 1]] = input.value;
    });
    return result;
  }

  function openPanel() {
    const panel = buildPanel();
    panel.style.right = '0';
    document.getElementById('cms-overlay').style.display = 'block';
  }

  function closePanel() {
    const panel = document.getElementById('cms-panel');
    if (panel) panel.style.right = '-480px';
    document.getElementById('cms-overlay').style.display = 'none';
  }

  // Create toggle button
  function createToggle() {
    const btn = document.createElement('button');
    btn.textContent = '✎';
    btn.title = 'Editar contenido (CMS)';
    Object.assign(btn.style, {
      position: 'fixed', bottom: '24px', right: '24px', zIndex: '9999',
      width: '48px', height: '48px', borderRadius: '50%',
      background: '#0A0A0A', color: '#fff', border: 'none',
      fontSize: '20px', cursor: 'pointer',
      boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
    });
    btn.onclick = async () => {
      if (!isCMSEnabled()) {
        if (!promptSecret()) return;
        // Verify secret works
        await loadContent();
      }
      openPanel();
    };
    document.body.appendChild(btn);

    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'cms-overlay';
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.3)',
      zIndex: '9997', display: 'none'
    });
    overlay.onclick = closePanel;
    document.body.appendChild(overlay);
  }

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    createToggle();
    loadContent();
  });
})();
