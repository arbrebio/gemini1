#!/usr/bin/env python3
"""
Fix i18n.ts structural errors - remove progressive indentation and fix object structure
"""
import re
from pathlib import Path

def fix_i18n_structure():
    file_path = Path('src/lib/i18n.ts')
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    fixed_lines = []
    in_translations = False
    base_indent = 0
    current_depth = 0
    
    for i, line in enumerate(lines):
        # Detect start of translations object
        if 'const translations' in line or 'en: {' in line:
            in_translations = True
            fixed_lines.append(line)
            continue
        
        # If not in translations, keep line as is
        if not in_translations:
            fixed_lines.append(line)
            continue
        
        # Count braces to track depth
        open_braces = line.count('{')
        close_braces = line.count('}')
        
        # Calculate correct indentation based on depth
        stripped = line.lstrip()
        
        # Adjust depth before line if it starts with }
        if stripped.startswith('}'):
            current_depth = max(0, current_depth - 1)
        
        # Calculate correct indentation (2 spaces per level)
        correct_indent = '  ' * (current_depth + 1)  # +1 for being inside translations
        
        # Apply correct indentation
        if stripped:
            fixed_line = correct_indent + stripped
        else:
            fixed_line = '\n'
        
        fixed_lines.append(fixed_line)
        
        # Adjust depth after line
        current_depth += (open_braces - close_braces)
        current_depth = max(0, current_depth)
    
    # Write fixed content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(fixed_lines)
    
    print(f"✅ Fixed indentation in {file_path}")
    print(f"   Processed {len(lines)} lines")

if __name__ == '__main__':
    fix_i18n_structure()
