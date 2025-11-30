#!/usr/bin/env python3
"""
Final fix for remaining hardcoded English text in forms.
"""

from pathlib import Path

# Define all final replacements
FINAL_FIXES = {
    'src/pages/[lang]/greenhouses/accessories.astro': [
        ('<h2 class="text-3xl font-bold text-center mb-12">Request a Quote</h2>',
         '<h2 class="text-3xl font-bold text-center mb-12">{t(\'common.request-quote\')}</h2>'),
        ('<option value="">Select a category</option>',
         '<option value="">{t(\'common.select-category\')}</option>'),
        ('<option value="structural">Structural Components</option>',
         '<option value="structural">{t(\'common.structural-components\')}</option>'),
        ('<option value="fasteners">Fasteners & Connections</option>',
         '<option value="fasteners">{t(\'common.fasteners-connections\')}</option>'),
        ('<option value="coverage">Coverage Materials</option>',
         '<option value="coverage">{t(\'common.coverage-materials\')}</option>'),
        ('<option value="growing">Growing Accessories</option>',
         '<option value="growing">{t(\'common.growing-accessories\')}</option>'),
    ],
    
    'src/pages/[lang]/greenhouses/high-tech.astro': [
        ('<h2 class="text-3xl font-bold text-center mb-12">Request a Custom Quote</h2>',
         '<h2 class="text-3xl font-bold text-center mb-12">{t(\'common.request-custom-quote\')}</h2>'),
        ('<option value="">Select a greenhouse type</option>',
         '<option value="">{t(\'common.select-greenhouse-type\')}</option>'),
    ],
    
    'src/pages/[lang]/irrigation/drip-systems.astro': [
        ('<h2 class="text-3xl font-bold text-center mb-12">Request a Quote</h2>',
         '<h2 class="text-3xl font-bold text-center mb-12">{t(\'common.request-quote\')}</h2>'),
        ('<option value="">Select crop type</option>',
         '<option value="">{t(\'common.select-crop-type\')}</option>'),
        ('<option value="vegetables">Vegetables</option>',
         '<option value="vegetables">{t(\'common.vegetables\')}</option>'),
        ('<option value="fruits">Fruits</option>',
         '<option value="fruits">{t(\'common.fruits\')}</option>'),
        ('<option value="field-crops">Field Crops</option>',
         '<option value="field-crops">{t(\'common.field-crops\')}</option>'),
    ],
    
    'src/pages/[lang]/irrigation/sprinklers.astro': [
        ('<h2 class="text-3xl font-bold text-center mb-12">Request a Quote</h2>',
         '<h2 class="text-3xl font-bold text-center mb-12">{t(\'common.request-quote\')}</h2>'),
        ('<option value="orchards">Orchards</option>',
         '<option value="orchards">{t(\'common.orchards\')}</option>'),
    ],
    
    'src/pages/[lang]/substrates/growing-solutions.astro': [
        ('<h2 class="text-3xl font-bold text-center mb-12">Request a Quote</h2>',
         '<h2 class="text-3xl font-bold text-center mb-12">{t(\'common.request-quote\')}</h2>'),
    ],
}

def fix_file(filepath, replacements):
    """Apply all replacements to a file."""
    file_path = Path(filepath)
    if not file_path.exists():
        print(f"⚠️  File not found: {filepath}")
        return False
    
    try:
        content = file_path.read_text(encoding='utf-8')
        original_content = content
        
        for old_text, new_text in replacements:
            if old_text in content:
                content = content.replace(old_text, new_text)
                print(f"✓ Fixed in {filepath}")
            else:
                print(f"⚠️  Pattern not found in {filepath}: {old_text[:60]}...")
        
        if content != original_content:
            file_path.write_text(content, encoding='utf-8')
            print(f"✅ Saved: {filepath}")
            return True
        else:
            print(f"ℹ️  No changes: {filepath}")
            return False
    except Exception as e:
        print(f"❌ Error: {filepath}: {e}")
        return False

def main():
    print("=" * 80)
    print("FINAL TRANSLATION FIX - FORMS AND DROPDOWNS")
    print("=" * 80)
    print()
    
    fixed_count = 0
    total_files = len(FINAL_FIXES)
    
    for filepath, replacements in FINAL_FIXES.items():
        print(f"\\nProcessing: {filepath}")
        print("-" * 80)
        if fix_file(filepath, replacements):
            fixed_count += 1
    
    print()
    print("=" * 80)
    print(f"SUMMARY: Fixed {fixed_count}/{total_files} files")
    print("=" * 80)

if __name__ == "__main__":
    main()
