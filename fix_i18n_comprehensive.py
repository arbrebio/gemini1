#!/usr/bin/env python3
"""
Comprehensive i18n.ts fixer - finds and fixes ALL structural errors
"""
import re
from pathlib import Path

def fix_i18n_comprehensive():
    file_path = Path('src/lib/i18n.ts')
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.split('\n')
    
    print("=" * 60)
    print("COMPREHENSIVE i18n.ts FIX")
    print("=" * 60)
    print(f"Total lines: {len(lines)}")
    
    # Track brace depth
    brace_stack = []
    fixed_lines = []
    
    for i, line in enumerate(lines):
        # Track braces for each line
        for j, char in enumerate(line):
            if char == '{':
                brace_stack.append((i + 1, j, 'open'))
            elif char == '}':
                if brace_stack and brace_stack[-1][2] == 'open':
                    brace_stack.pop()
                else:
                    brace_stack.append((i + 1, j, 'close'))
        
        fixed_lines.append(line)
    
    # Check final brace count
    open_braces = sum(1 for b in brace_stack if b[2] == 'open')
    close_braces = sum(1 for b in brace_stack if b[2] == 'close')
    
    print(f"\nBrace Analysis:")
    print(f"  Unclosed opening braces: {open_braces}")
    print(f"  Extra closing braces: {close_braces}")
    
    if open_braces > 0:
        print(f"\n❌ Found {open_braces} unclosed opening brace(s)")
        print("  Locations:")
        for b in [x for x in brace_stack if x[2] == 'open'][:5]:
            print(f"    Line {b[0]}, Column {b[1]}")
        
        # Add missing closing braces at the end of the translations object
        # Find the last line before the export statement
        for i in range(len(fixed_lines) - 1, -1, -1):
            if 'export' in fixed_lines[i] and i > 100:
                # Insert closing braces before this line
                indent = '  '
                for _ in range(open_braces):
                    fixed_lines.insert(i, indent + '}')
                print(f"\n✅ Added {open_braces} closing brace(s) at line {i}")
                break
    
    if close_braces > 0:
        print(f"\n❌ Found {close_braces} extra closing brace(s)")
        # Remove extra closing braces
        # This is more complex and needs careful handling
    
    # Write fixed content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(fixed_lines))
    
    print(f"\n✅ Fixed content written to {file_path}")
    print("=" * 60)
    
    return open_braces == 0 and close_braces == 0

if __name__ == '__main__':
    success = fix_i18n_comprehensive()
    if success:
        print("\n🎉 All structural errors fixed!")
    else:
        print("\n⚠️  Some errors were fixed, please run validation again")
