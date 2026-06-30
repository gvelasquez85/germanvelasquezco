import re
with open('blog.html') as f:
    content = f.read()
scripts = re.findall(r'<script>(.*?)</script>', content, re.DOTALL)
print(f'Found {len(scripts)} script blocks')
for i, script in enumerate(scripts):
    try:
        compile(script, f'script{i}', 'exec')
        print(f'Script {i}: OK ({len(script)} chars)')
    except SyntaxError as e:
        print(f'Script {i} SYNTAX ERROR: {e}')
        print(f'Line {e.lineno}: {e.text}')