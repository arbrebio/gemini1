import os
import re

def update_file(filepath):
    print(f"Processing {filepath}")
    with open(filepath, 'r') as f:
        content = f.read()

    if 'export { getStaticPaths }' in content:
        print(f"Skipping {filepath} (already updated)")
        return

    # Determine depth relative to src/pages/[lang]
    # src/pages/[lang]/about.astro -> depth 0
    # src/pages/[lang]/projects/index.astro -> depth 1
    
    rel_path = os.path.relpath(filepath, 'src/pages/[lang]')
    depth = 0
    if rel_path != '.':
        depth = len(rel_path.split(os.sep)) - 1
        
    # We need to adjust imports.
    # If depth is 0 (root of [lang]), we need to add one '../' to existing imports (which were relative to src/pages).
    # If depth is 1 (nested), we need to add one '../' to existing imports (which were relative to src/pages/nested).
    # Wait.
    # Original: src/pages/projects/index.astro. Import `../../layouts`.
    # New: src/pages/[lang]/projects/index.astro. Import `../../../layouts`.
    # So we ALWAYS add one `../` to relative imports that go up.
    
    def replace_import(match):
        quote = match.group(1)
        path = match.group(2)
        if path.startswith('..'):
            return f'from {quote}../{path}{quote}'
        elif path.startswith('./'):
            return match.group(0) # Sibling imports stay same
        # What if it is `from '../components/...'`?
        # src/pages/about.astro -> `../components`
        # src/pages/[lang]/about.astro -> `../../components`
        # Yes, add one `../`.
        return match.group(0)

    new_content = re.sub(r'from (["\'])(\.\./.*)(["\'])', replace_import, content)
    
    # Add i18n imports
    # Path to lib/i18n.
    # src/pages/[lang] -> ../../lib/i18n
    # src/pages/[lang]/projects -> ../../../lib/i18n
    
    # Base path to lib from [lang] root is ../../lib/i18n
    # For each level of depth, add another ../
    
    i18n_prefix = '../../' + ('../' * depth)
    i18n_path = f'{i18n_prefix}lib/i18n'
    
    # Prepare new imports block
    new_imports = f"\nimport {{ useTranslations, getStaticPaths }} from '{i18n_path}';\n\nexport {{ getStaticPaths }};\n\nconst {{ lang }} = Astro.params;\nconst t = useTranslations(lang as any);\n"
    
    # Remove old lang definition if exists
    new_content = re.sub(r'const lang = defaultLang;', '', new_content)
    new_content = re.sub(r'const t = useTranslations\(lang\);', '', new_content)
    # Also remove old imports of i18n if they exist
    new_content = re.sub(r'import .* from .*lib/i18n.*;', '', new_content)

    # Insert new imports
    parts = new_content.split('---', 2)
    if len(parts) >= 3:
        frontmatter = parts[1]
        last_import_idx = frontmatter.rfind('import ')
        if last_import_idx != -1:
            end_of_line = frontmatter.find('\n', last_import_idx)
            frontmatter = frontmatter[:end_of_line+1] + new_imports + frontmatter[end_of_line+1:]
        else:
            frontmatter = new_imports + frontmatter
        
        new_content = parts[0] + '---' + frontmatter + '---' + parts[2]
        
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")
    else:
        print(f"Skipping {filepath} (no frontmatter)")

# Walk through src/pages/[lang]
start_dir = 'src/pages/[lang]'
print(f"Walking {start_dir}")
for root, dirs, files in os.walk(start_dir):
    for file in files:
        if file.endswith('.astro'):
            update_file(os.path.join(root, file))
