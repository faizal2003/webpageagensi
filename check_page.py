from pathlib import Path
from html.parser import HTMLParser

page = Path('index.html')
text = page.read_text(encoding='utf-8-sig')
if '\u00e2\u20ac' in text or '\u00c2\u00ae' in text:
    text = b''.join(bytes([ord(c)]) if 0x80 <= ord(c) <= 0x9f else c.encode('cp1252') for c in text).decode('utf-8')
text = text.replace('<span class="brand-dot">®</span>', '')
page.write_text(text, encoding='utf-8')
HTMLParser().feed(text)
for filename in ['styles.css', 'tokens.css', 'script.js', 'logo.jpg']:
    assert Path(filename).is_file(), filename
for section in ['main', 'services', 'about', 'process', 'contact']:
    assert f'id="{section}"' in text, section
assert 'Small business.' in text
assert '®' not in text
print('HTML parsing, section anchors, local assets, and UTF-8 checks passed.')
