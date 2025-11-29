#!/usr/bin/env python3
"""
Check for TypeScript syntax errors in i18n.ts without compiling
"""
import re
from pathlib import Path

def check_typescript_syntax():
    file_path = Path('src/lib/i18n.ts')
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.split('\n')
    
    print("=" * 70)
    print("TYPESCRIPT SYNTAX CHECK")
    print("=" * 70)
    
    errors = []
    warnings = []
    
    # Check for common syntax issues
    for i, line in enumerate(lines, 1):
        # Check for unterminated strings
        if line.count("'") % 2 != 0 and line.count('"') % 2 != 0:
            # Check if it's escaped
            if not re.search(r"\\'", line):
                warnings.append(f"Line {i}: Possible unterminated string")
        
        # Check for missing commas after object properties
        if re.search(r":\s*['\"].*['\"]$", line.strip()) and i < len(lines):
            next_line = lines[i].strip() if i < len(lines) else ""
            if next_line and not next_line.startswith('}') and not line.strip().endswith(','):
                if not next_line.startswith('//'):
                    warnings.append(f"Line {i}: Possible missing comma")
    
    # Check brace balance
    brace_count = content.count('{') - content.count('}')
    bracket_count = content.count('[') - content.count(']')
    paren_count = content.count('(') - content.count(')')
    
    if brace_count != 0:
        errors.append(f"Brace mismatch: {brace_count} unclosed braces")
    if bracket_count != 0:
        errors.append(f"Bracket mismatch: {bracket_count} unclosed brackets")
    if paren_count != 0:
        errors.append(f"Parenthesis mismatch: {paren_count} unclosed parentheses")
    
    print(f"\nTotal lines: {len(lines)}")
    print(f"Errors found: {len(errors)}")
    print(f"Warnings found: {len(warnings)}")
    
    if errors:
        print("\n❌ ERRORS:")
        for error in errors:
            print(f"  {error}")
    
    if warnings and len(warnings) <= 20:
        print("\n⚠️  WARNINGS:")
        for warning in warnings[:20]:
            print(f"  {warning}")
    
    if not errors:
        print("\n✅ No critical syntax errors found!")
        print("   File structure appears valid")
    
    print("=" * 70)
    
    return len(errors) == 0

if __name__ == '__main__':
    success = check_typescript_syntax()
    exit(0 if success else 1)
