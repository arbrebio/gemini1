import os
import re

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Skip if already updated (check for getStaticPaths export)
    if 'export { getStaticPaths }' in content:
        print(f"Skipping {filepath} (already updated)")
        return

    # Calculate depth to adjust imports
    # src/pages/[lang]/folder/file.astro -> depth from [lang] is 1 (folder)
    # We need to know how many '../' to add.
    # Original: src/pages/folder/file.astro. Imports were relative to that.
    # New: src/pages/[lang]/folder/file.astro. We added one level '[lang]'.
    # So we need to add one '../' to all relative imports starting with '..'
    
    # Regex to find imports starting with ..
    # import ... from '../...'
    # import ... from "../../..."
    
    def replace_import(match):
        quote = match.group(1)
        path = match.group(2)
        if path.startswith('.'):
            return f'from {quote}../{path}{quote}'
        return match.group(0)

    new_content = re.sub(r'from (["\'])(\.\./.*)(["\'])', replace_import, content)
    
    # Also update imports that might be './' if they refer to something outside? 
    # No, './' refers to same dir, which moved with it. So './' stays './'.
    
    # Now add the i18n logic
    # Find the frontmatter fence '---'
    parts = new_content.split('---', 2)
    if len(parts) >= 3:
        frontmatter = parts[1]
        
        # Add i18n imports
        # We need to find the path to lib/i18n.
        # filepath is absolute or relative to cwd.
        # Let's assume we are running from project root.
        # src/pages/[lang]/folder/file.astro
        # Path to lib/i18n is ../../../lib/i18n (from folder)
        # or ../../lib/i18n (from [lang] root)
        
        # Count segments after src/pages
        rel_path = os.path.relpath(filepath, 'src/pages')
        # e.g. [lang]/about.astro -> 2 segments.
        # [lang]/projects/index.astro -> 3 segments.
        
        depth = len(rel_path.split(os.sep)) - 1 # -1 because we are inside the file
        # Actually, simpler:
        # src/pages/[lang]/about.astro -> needs ../../lib/i18n
        # src/pages/[lang]/projects/index.astro -> needs ../../../lib/i18n
        
        # Let's just look at the existing imports to guess the path to lib?
        # Or just calculate it.
        # src/pages/[lang] is base.
        # If file is in src/pages/[lang]/about.astro, it is 0 dirs deep from [lang].
        # It needs ../../lib/i18n (up to [lang], up to pages, then lib is sibling of pages? No, lib is in src/lib).
        # src/pages -> ../lib
        # src/pages/[lang] -> ../../lib
        # src/pages/[lang]/projects -> ../../../lib
        
        # Count directories in rel_path
        # [lang]/projects/index.astro -> 2 dirs ([lang], projects).
        # So we need '../' * (num_dirs + 1) ?
        # src/pages is root.
        # ../lib is from src/pages.
        # So we need one more ../ for each level down from src/pages.
        
        num_dirs = len(rel_path.split(os.sep)) - 1
        i18n_path = '../' * (num_dirs + 1) + 'lib/i18n'
        
        # Replace existing i18n import if present, or add new one
        if 'lib/i18n' in frontmatter:
             frontmatter = re.sub(r'import .* from .*lib/i18n.*;', '', frontmatter)
        
        # Add new imports
        new_imports = f"\nimport {{ useTranslations, getStaticPaths }} from '{i18n_path}';\n\nexport {{ getStaticPaths }};\n\nconst {{ lang }} = Astro.params;\nconst t = useTranslations(lang as any);\n"
        
        # Remove old lang definition if exists
        frontmatter = re.sub(r'const lang = defaultLang;', '', frontmatter)
        frontmatter = re.sub(r'const t = useTranslations\(lang\);', '', frontmatter)
        
        # Insert new imports after the last import
        last_import_idx = frontmatter.rfind('import ')
        if last_import_idx != -1:
            # Find end of that line
            end_of_line = frontmatter.find('\n', last_import_idx)
            frontmatter = frontmatter[:end_of_line+1] + new_imports + frontmatter[end_of_line+1:]
        else:
            frontmatter = new_imports + frontmatter
            
        new_content = parts[0] + '---' + frontmatter + '---' + parts[2]
        
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

# Walk through src/pages/[lang]
start_dir = 'src/pages/[lang]'
for root, dirs, files in os.walk(start_dir):
    for file in files:
        if file.endswith('.astro'):
            update_file(os.path.join(root, file))
