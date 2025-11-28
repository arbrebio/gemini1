#!/usr/bin/env python3
"""
Add i18n imports and t() function declaration to product pages
"""

import re

files_to_update = [
    '/Users/sydneyrolandabouna/.gemini/antigravity/scratch/project/src/pages/[lang]/irrigation/controllers.astro',
    '/Users/sydneyrolandabouna/.gemini/antigravity/scratch/project/src/pages/[lang]/greenhouses/high-tech.astro',
    '/Users/sydneyrolandabouna/.gemini/antigravity/scratch/project/src/pages/[lang]/greenhouses/accessories.astro',
    '/Users/sydneyrolandabouna/.gemini/antigravity/scratch/project/src/pages/[lang]/irrigation/drip-systems.astro',
    '/Users/sydneyrolandabouna/.gemini/antigravity/scratch/project/src/pages/[lang]/irrigation/sprinklers.astro',
    '/Users/sydneyrolandabouna/.gemini/antigravity/scratch/project/src/pages/[lang]/substrates/growing-solutions.astro',
]

i18n_imports = """import { useTranslations, getLangFromUrl } from '../../../lib/i18n';

const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);

"""

for filepath in files_to_update:
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Check if already has useTranslations
        if 'useTranslations' in content:
            print(f"✓ {filepath.split('/')[-1]} - Already has useTranslations")
            continue
        
        # Find the frontmatter section (between --- and ---)
        match = re.search(r'^---\n(.*?)\n---', content, re.DOTALL)
        if not match:
            print(f"✗ {filepath.split('/')[-1]} - No frontmatter found")
            continue
        
        frontmatter = match.group(1)
        
        # Add i18n imports after the Layout import
        if "import Layout from" in frontmatter:
            new_frontmatter = frontmatter.replace(
                "import Layout from '../../../layouts/Layout.astro';",
                f"import Layout from '../../../layouts/Layout.astro';\n{i18n_imports}"
            )
        else:
            # Add at the beginning
            new_frontmatter = i18n_imports + frontmatter
        
        # Replace the frontmatter
        new_content = content.replace(f"---\n{frontmatter}\n---", f"---\n{new_frontmatter}---")
        
        # Write back
        with open(filepath, 'w') as f:
            f.write(new_content)
        
        print(f"✓ {filepath.split('/')[-1]} - Added i18n imports and t() declaration")
    
    except Exception as e:
        print(f"✗ {filepath.split('/')[-1]} - Error: {e}")

print("\nDone! All files updated.")
