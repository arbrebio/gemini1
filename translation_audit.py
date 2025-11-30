#!/usr/bin/env python3
"""
COMPREHENSIVE TRANSLATION AUDIT
Scans ALL .astro files to find any remaining hardcoded English text
in French, Spanish, and Afrikaans pages.
"""

import re
from pathlib import Path

def scan_for_hardcoded_english(filepath, lang_code):
    """Scan a file for hardcoded English text."""
    issues = []
    try:
        content = Path(filepath).read_text(encoding='utf-8')
        lines = content.split('\n')
        
        for i, line in enumerate(lines, 1):
            # Skip frontmatter, imports, scripts
            if any(x in line for x in ['---', 'import ', 'export ', '<script', 'const ', 'let ', 'var ']):
                continue
            
            # Skip if using translation function
            if '{t(' in line or 'placeholder={t' in line or 'title={t' in line:
                continue
            
            # Look for English patterns
            patterns = [
                (r'<h[1-6][^>]*>\s*([A-Z][a-z]+(?:\s+[A-Z]?[a-z]+){1,})\s*<', 'Heading'),
                (r'<p[^>]*>\s*([A-Z][a-z]+(?:\s+[a-z]+){4,})', 'Paragraph'),
                (r'<button[^>]*>\s*([A-Z][a-z]+(?:\s+[A-Z]?[a-z]+)*)\s*<', 'Button'),
                (r'<a[^>]*>\s*([A-Z][a-z]+(?:\s+[A-Z]?[a-z]+)+)\s*<', 'Link'),
                (r'<option[^>]*>\s*([A-Z][a-z]+(?:\s+[A-Z]?[a-z]+)*)\s*<', 'Option'),
                (r'<span[^>]*>\s*([A-Z][a-z]+(?:\s+[A-Z]?[a-z]+)+)\s*<', 'Span'),
                (r'placeholder="([A-Z][a-z]+[^"]*?)"', 'Placeholder'),
                (r'title="([A-Z][a-z]+[^"]*?)"', 'Title'),
            ]
            
            for pattern, issue_type in patterns:
                matches = re.finditer(pattern, line)
                for match in matches:
                    text = match.group(1) if match.groups() else match.group(0)
                    # Filter false positives
                    if not any(fp in text.lower() for fp in ['http', 'www', 'email', 'tel:', 'mailto:', 'class=', 'id=', 'src=', 'href=']):
                        issues.append({
                            'line': i,
                            'type': issue_type,
                            'text': text,
                            'lang': lang_code
                        })
                        break
        
        return issues
    except Exception as e:
        return []

def main():
    print("=" * 80)
    print("COMPREHENSIVE TRANSLATION AUDIT - ALL LANGUAGES")
    print("=" * 80)
    
    # Get all .astro files
    all_files = list(Path('src/pages/[lang]').rglob('*.astro'))
    
    # Organize by language context
    results = {
        'fr': {},
        'es': {},
        'af': {}
    }
    
    print(f"\nScanning {len(all_files)} files for hardcoded English text...\n")
    
    for file in sorted(all_files):
        # These files serve all languages, so check for hardcoded text
        for lang in ['fr', 'es', 'af']:
            issues = scan_for_hardcoded_english(file, lang)
            if issues:
                results[lang][str(file)] = issues
    
    # Report results
    for lang, files in results.items():
        print(f"\n{lang.upper()} - {len(files)} files with potential issues:")
        print("-" * 80)
        if files:
            for file, issues in list(files.items())[:5]:  # Show first 5 files
                print(f"\n{file}: {len(issues)} issues")
                for issue in issues[:3]:  # Show first 3 per file
                    print(f"  Line {issue['line']} [{issue['type']}]: {issue['text']}")
        else:
            print("✅ No hardcoded English found!")
    
    # Summary
    total_issues = sum(len(files) for files in results.values())
    print(f"\n{'=' * 80}")
    print(f"TOTAL: {total_issues} files with potential hardcoded English")
    print("=" * 80)

if __name__ == "__main__":
    main()
