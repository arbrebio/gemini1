#!/usr/bin/env python3
"""
Final comprehensive fix - Replace ALL remaining hardcoded English text.
"""

from pathlib import Path

FINAL_FIXES = {
    'src/pages/[lang]/company/index.astro': [
        ('<p class="text-xl text-white mb-8">Join hundreds of successful farmers across Africa.</p>',
         '<p class="text-xl text-white mb-8">{t(\'company.cta.joinFarmers\')}</p>'),
    ],
    
    'src/pages/[lang]/cookies.astro': [
        ('<li><a href="https://support.google.com/chrome/answer/95647" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>',
         '<li><a href="https://support.google.com/chrome/answer/95647" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{t(\'cookies.browsers.chrome\')}</a></li>'),
        ('<li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>',
         '<li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{t(\'cookies.browsers.firefox\')}</a></li>'),
        ('<li><a href="https://support.microsoft.com/en-us/windows/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-c582b4e640dd" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>',
         '<li><a href="https://support.microsoft.com/en-us/windows/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-c582b4e640dd" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{t(\'cookies.browsers.edge\')}</a></li>'),
    ],
    
    'src/pages/[lang]/greenhouses/accessories.astro': [
        ('<p class="text-xl text-white mb-8">Contact us today for technical consultation and custom solutions.</p>',
         '<p class="text-xl text-white mb-8">{t(\'common.contact-today\')}</p>'),
    ],
    
    'src/pages/[lang]/greenhouses/high-tech.astro': [
        ('<p class="text-xl text-white mb-8">Contact us today for expert consultation and custom solutions.</p>',
         '<p class="text-xl text-white mb-8">{t(\'common.contact-today\')}</p>'),
    ],
    
    'src/pages/[lang]/irrigation/drip-systems.astro': [
        ('<p class="text-xl text-white mb-8">Contact us today for personalized recommendations and support.</p>',
         '<p class="text-xl text-white mb-8">{t(\'common.contact-today\')}</p>'),
    ],
    
    'src/pages/[lang]/irrigation/sprinklers.astro': [
        ('<p class="text-xl text-white mb-8">Contact us today for personalized recommendations and support.</p>',
         '<p class="text-xl text-white mb-8">{t(\'common.contact-today\')}</p>'),
    ],
    
    'src/pages/[lang]/substrates/growing-solutions.astro': [
        ('<p class="text-xl text-white mb-8">Contact us today for expert advice and custom solutions.</p>',
         '<p class="text-xl text-white mb-8">{t(\'common.contact-today\')}</p>'),
    ],
}

def fix_file(filepath, replacements):
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
                print(f"⚠️  Pattern not found: {old_text[:60]}...")
        
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
    print("FINAL HARDCODED TEXT FIX")
    print("=" * 80)
    print()
    
    fixed_count = 0
    for filepath, replacements in FINAL_FIXES.items():
        print(f"\\nProcessing: {filepath}")
        print("-" * 80)
        if fix_file(filepath, replacements):
            fixed_count += 1
    
    print()
    print("=" * 80)
    print(f"SUMMARY: Fixed {fixed_count}/{len(FINAL_FIXES)} files")
    print("=" * 80)

if __name__ == "__main__":
    main()
