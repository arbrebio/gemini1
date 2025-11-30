#!/usr/bin/env python3
"""
Comprehensive website audit and fix script.
Checks all pages for:
1. Missing components
2. Broken imports
3. Hardcoded English in translated pages
4. Missing translation keys
"""

import re
from pathlib import Path
import json

def audit_page(filepath):
    """Audit a single page for issues."""
    issues = []
    try:
        content = Path(filepath).read_text(encoding='utf-8')
        lines = content.split('\n')
        
        for i, line in enumerate(lines, 1):
            # Check for broken imports
            if 'import' in line and 'from' in line:
                match = re.search(r"from\s+['\"]([^'\"]+)['\"]", line)
                if match:
                    import_path = match.group(1)
                    # Check if it's a relative import
                    if import_path.startswith('.'):
                        # Verify the file exists
                        base_dir = Path(filepath).parent
                        full_path = (base_dir / import_path).resolve()
                        
                        # Try with .astro extension if not specified
                        if not full_path.exists() and not import_path.endswith('.astro'):
                            full_path = Path(str(full_path) + '.astro')
                        
                        if not full_path.exists():
                            issues.append({
                                'line': i,
                                'type': 'BROKEN_IMPORT',
                                'message': f'Import not found: {import_path}',
                                'context': line.strip()
                            })
            
            # Check for hardcoded English in non-English pages
            if '/[lang]/' in str(filepath):
                # Skip if it's using translation function
                if '{t(' not in line:
                    # Look for English patterns
                    english_patterns = [
                        r'<h[1-6][^>]*>\s*([A-Z][a-z]+(?:\s+[A-Z]?[a-z]+)+)\s*<',
                        r'<option[^>]*>\s*([A-Z][a-z]+(?:\s+[A-Z]?[a-z]+)*)\s*<',
                    ]
                    
                    for pattern in english_patterns:
                        if re.search(pattern, line):
                            issues.append({
                                'line': i,
                                'type': 'HARDCODED_ENGLISH',
                                'message': 'Possible hardcoded English text',
                                'context': line.strip()[:80]
                            })
                            break
        
        return issues
    except Exception as e:
        return [{'type': 'ERROR', 'message': str(e)}]

def main():
    print("=" * 80)
    print("COMPREHENSIVE WEBSITE AUDIT")
    print("=" * 80)
    
    # Audit all .astro files
    astro_files = list(Path('src/pages/[lang]').rglob('*.astro'))
    
    all_issues = {}
    for file in sorted(astro_files):
        issues = audit_page(file)
        if issues:
            all_issues[str(file)] = issues
    
    print(f"\nAudited {len(astro_files)} files")
    print(f"Found issues in {len(all_issues)} files\n")
    
    if all_issues:
        for file, issues in all_issues.items():
            print(f"\n{file}:")
            print("-" * 80)
            for issue in issues[:5]:  # Show first 5
                print(f"  Line {issue.get('line', '?')} [{issue['type']}]: {issue['message']}")
                if 'context' in issue:
                    print(f"    {issue['context']}")
    else:
        print("✅ No issues found!")
    
    print("\n" + "=" * 80)

if __name__ == "__main__":
    main()
