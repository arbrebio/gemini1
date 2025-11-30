#!/usr/bin/env python3
"""
Comprehensive fix for all hardcoded English text in translated pages.
This script systematically replaces all identified hardcoded text with translation function calls.
"""

import re
from pathlib import Path

# Define all replacements needed across files
REPLACEMENTS = {
    # Blog page
    'src/pages/[lang]/blog/[...slug].astro': [
        ('        <h3 class="text-xl font-bold mb-4">Share This Article</h3>', 
         '        <h3 class="text-xl font-bold mb-4">{t(\'blog.post.shareArticle\')}</h3>'),
    ],
    
    # Greenhouses accessories page
    'src/pages/[lang]/greenhouses/accessories.astro': [
        # Fix syntax error first
        ('];---', '];\\n---'),
        ('  title="Greenhouse Accessories & Components | Professional Grade"',
         '  title={t(\'common.greenhouse-accessories-title\')}'),
        ('      <h2 class="text-3xl font-bold mb-12">Structural Components</h2>',
         '      <h2 class="text-3xl font-bold mb-12">{t(\'common.structural-components\')}</h2>'),
        ('      <h2 class="text-3xl font-bold mb-12">Growing Accessories</h2>',
         '      <h2 class="text-3xl font-bold mb-12">{t(\'common.growing-accessories\')}</h2>'),
        ('      <h2 class="text-3xl font-bold text-center mb-12">Technical Documentation</h2>',
         '      <h2 class="text-3xl font-bold text-center mb-12">{t(\'common.technical-documentation\')}</h2>'),
        ('          <h3 class="font-bold mb-1 group-hover:text-primary transition-colors">Technical Specifications</h3>',
         '          <h3 class="font-bold mb-1 group-hover:text-primary transition-colors">{t(\'common.technical-specs\')}</h3>'),
    ],
    
    # Greenhouses high-tech page
    'src/pages/[lang]/greenhouses/high-tech.astro': [
        ('              <h3 class="text-xl font-bold mb-4">Technical Specifications</h3>',
         '              <h3 class="text-xl font-bold mb-4">{t(\'common.technical-specs\')}</h3>'),
        ('              <h3 class="text-xl font-bold mb-4">Key Features</h3>',
         '              <h3 class="text-xl font-bold mb-4">{t(\'common.key-features\')}</h3>'),
        ('                <div class="text-sm text-gray-500">Payback Period</div>',
         '                <div class="text-sm text-gray-500">{t(\'common.payback-period\')}</div>'),
        ('                <div class="text-sm text-gray-500">Yield Increase</div>',
         '                <div class="text-sm text-gray-500">{t(\'common.yield-increase\')}</div>'),
        ('                <div class="text-sm text-gray-500">Water Savings</div>',
         '                <div class="text-sm text-gray-500">{t(\'common.water-savings\')}</div>'),
        ('              placeholder="City, Country"',
         '              placeholder={t(\'common.city-country-placeholder\')}'),
    ],
    
    # Irrigation drip-systems page
    'src/pages/[lang]/irrigation/drip-systems.astro': [
        ('  title="Drip Irrigation Systems - Precision Water Management"',
         '  title={t(\'common.drip-irrigation-title\')}'),
        ('          <h2 class="text-3xl font-bold mb-6">Precision Water Management</h2>',
         '          <h2 class="text-3xl font-bold mb-6">{t(\'common.precision-water-management\')}</h2>'),
        ('        <h2 class="text-3xl font-bold text-center mb-12">Why Choose Drip Irrigation</h2>',
         '        <h2 class="text-3xl font-bold text-center mb-12">{t(\'common.why-choose-drip\')}</h2>'),
        ('        <h2 class="text-3xl font-bold text-center mb-12">Quality Certifications</h2>',
         '        <h2 class="text-3xl font-bold text-center mb-12">{t(\'common.quality-certifications\')}</h2>'),
        ('              <option value="">Select a product</option>',
         '              <option value="">{t(\'common.select-product\')}</option>'),
    ],
    
    # Irrigation sprinklers page
    'src/pages/[lang]/irrigation/sprinklers.astro': [
        ('  title="Irrigation Sprinklers - Precision Water Distribution"',
         '  title={t(\'common.sprinklers-title\')}'),
        ('          <h2 class="text-3xl font-bold mb-6">Precision Water Distribution</h2>',
         '          <h2 class="text-3xl font-bold mb-6">{t(\'common.precision-water-distribution\')}</h2>'),
        ('              <option value="">Select a product</option>',
         '              <option value="">{t(\'common.select-product\')}</option>'),
        ('              <option value="">Select application type</option>',
         '              <option value="">{t(\'common.select-application\')}</option>'),
        ('              <option value="field-crops">Field Crops</option>',
         '              <option value="field-crops">{t(\'common.field-crops\')}</option>'),
    ],
    
    # Substrates growing-solutions page
    'src/pages/[lang]/substrates/growing-solutions.astro': [
        ('        <h2 class="text-3xl font-bold text-center mb-12">Quality Certifications</h2>',
         '        <h2 class="text-3xl font-bold text-center mb-12">{t(\'common.quality-certifications\')}</h2>'),
        ('              <option value="">Select a product</option>',
         '              <option value="">{t(\'common.select-product\')}</option>'),
        ('              <option value="custom">Custom Blend</option>',
         '              <option value="custom">{t(\'common.custom-blend\')}</option>'),
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
                print(f"✓ Replaced in {filepath}")
            else:
                print(f"⚠️  Pattern not found in {filepath}: {old_text[:60]}...")
        
        if content != original_content:
            file_path.write_text(content, encoding='utf-8')
            print(f"✅ Fixed: {filepath}")
            return True
        else:
            print(f"ℹ️  No changes needed: {filepath}")
            return False
    except Exception as e:
        print(f"❌ Error fixing {filepath}: {e}")
        return False

def main():
    """Main execution function."""
    print("=" * 80)
    print("COMPREHENSIVE TRANSLATION FIX")
    print("=" * 80)
    print()
    
    fixed_count = 0
    total_files = len(REPLACEMENTS)
    
    for filepath, replacements in REPLACEMENTS.items():
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
