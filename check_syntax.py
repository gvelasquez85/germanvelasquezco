import re
with open('blog.html') as f:
    content = f.read()

scripts = re.findall(r'<script>(.*?)</script>', content, re.DOTALL)
for i, script in enumerate(scripts):
    try:
        compile(script, f'script{i}', 'exec')
        print(f'Script {i}: OK')
    except SyntaxError as e:
        print(f'Script {i} SYNTAX ERROR: {e}')
        print(f'Line {e.lineno}: {e.text}')