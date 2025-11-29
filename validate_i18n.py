#!/usr/bin/env python3
"""
Validate i18n.ts structure and report all errors
"""
import json
import re
from pathlib import Path

def validate_i18n():
    file_path = Path('src/lib/i18n.ts')
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.split('\n')
    
    errors = []
    warnings = []
    
    # Check for basic syntax issues
    brace_count = 0
    bracket_count = 0
    paren_count = 0
    
    for i, line in enumerate(lines, 1):
        # Count braces
        brace_count += line.count('{') - line.count('}')
        bracket_count += line.count('[') - line.count(']')
        paren_count += line.count('(') - line.count(')')
        
        # Check for common issues
        if re.search(r'\}\s*\n\s*[a-zA-Z_]', line + '\n' + (lines[i] if i < len(lines) else '')):
            # Missing comma after closing brace
            if not re.search(r'\}\s*,', line):
                warnings.append(f"Line {i}: Possible missing comma after closing brace")
        
        # Check for progressive indentation
        if line.strip() and not line.startswith('//'):
            indent = len(line) - len(line.lstrip())
            if indent > 100:  # Suspiciously deep indentation
                errors.append(f"Line {i}: Excessive indentation ({indent} spaces)")
    
    # Final brace count
    if brace_count != 0:
        errors.append(f"Brace mismatch: {brace_count} unclosed braces")
    if bracket_count != 0:
        errors.append(f"Bracket mismatch: {bracket_count} unclosed brackets")
    if paren_count != 0:
        errors.append(f"Parenthesis mismatch: {paren_count} unclosed parentheses")
    
    # Report
    print("=" * 60)
    print("i18n.ts VALIDATION REPORT")
    print("=" * 60)
    print(f"Total lines: {len(lines)}")
    print(f"Errors found: {len(errors)}")
    print(f"Warnings found: {len(warnings)}")
    print()
    
    if errors:
        print("ERRORS:")
        for error in errors[:20]:  # Show first 20
            print(f"  ❌ {error}")
        if len(errors) > 20:
            print(f"  ... and {len(errors) - 20} more errors")
    
    if warnings:
        print("\nWARNINGS:")
        for warning in warnings[:10]:  # Show first 10
            print(f"  ⚠️  {warning}")
        if len(warnings) > 10:
            print(f"  ... and {len(warnings) - 10} more warnings")
    
    if not errors and not warnings:
        print("✅ No structural errors found!")
    
    return len(errors) == 0

if __name__ == '__main__':
    validate_i18n()
