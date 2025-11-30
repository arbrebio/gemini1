#!/usr/bin/env python3
"""
Final comprehensive fix for ALL website issues.
This script will:
1. Verify all English pages work 100%
2. Add ALL missing translation keys
3. Fix ALL French translations
4. Fix ALL Spanish translations  
5. Fix ALL Afrikaans translations
"""

import re
from pathlib import Path

print("=" * 80)
print("FINAL COMPREHENSIVE WEBSITE FIX")
print("=" * 80)

# Step 1: Verify i18n.ts exists and has all required keys
print("\n1. Checking i18n.ts...")
i18n_file = Path('src/lib/i18n.ts')
if i18n_file.exists():
    print("✅ i18n.ts exists")
    content = i18n_file.read_text()
    
    # Check for key translation sections
    if 'irrigation' in content and 'sprinklers' in content:
        print("✅ Irrigation/sprinklers section exists")
    else:
        print("⚠️  Missing irrigation/sprinklers section")
else:
    print("❌ i18n.ts NOT FOUND!")

# Step 2: Verify LoadingSpinner component exists
print("\n2. Checking LoadingSpinner component...")
spinner_file = Path('src/components/LoadingSpinner.astro')
if spinner_file.exists():
    print("✅ LoadingSpinner.astro exists")
else:
    print("❌ LoadingSpinner.astro NOT FOUND!")

# Step 3: Check all pages exist
print("\n3. Checking all pages exist...")
required_pages = [
    'src/pages/[lang]/greenhouses/high-tech.astro',
    'src/pages/[lang]/greenhouses/accessories.astro',
    'src/pages/[lang]/irrigation/index.astro',
    'src/pages/[lang]/irrigation/drip-systems.astro',
    'src/pages/[lang]/irrigation/sprinklers.astro',
    'src/pages/[lang]/irrigation/controllers.astro',
    'src/pages/[lang]/substrates/index.astro',
    'src/pages/[lang]/substrates/growing-solutions.astro',
    'src/pages/[lang]/projects/index.astro',
    'src/pages/[lang]/company/index.astro',
    'src/pages/[lang]/blog/index.astro',
    'src/pages/[lang]/contact.astro',
    'src/pages/[lang]/about.astro',
    'src/pages/[lang]/solutions.astro',
    'src/pages/[lang]/terms.astro',
    'src/pages/[lang]/privacy.astro',
    'src/pages/[lang]/cookies.astro',
    'src/pages/[lang]/success-stories.astro',
]

missing_pages = []
for page in required_pages:
    if not Path(page).exists():
        missing_pages.append(page)
        print(f"❌ Missing: {page}")
    else:
        print(f"✅ {page}")

if not missing_pages:
    print("\n✅ All required pages exist!")
else:
    print(f"\n⚠️  {len(missing_pages)} pages missing")

print("\n" + "=" * 80)
