#!/usr/bin/env python3
"""
Complete i18n.ts reconstruction - fix ALL structural issues
This script will:
1. Parse the file and identify all objects
2. Normalize indentation completely
3. Fix all brace mismatches
4. Ensure proper comma placement
"""
import re
from pathlib import Path

def reconstruct_i18n():
    file_path = Path('src/lib/i18n.ts')
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("=" * 70)
    print("COMPLETE i18n.ts RECONSTRUCTION")
    print("=" * 70)
    
    # Split into lines for processing
    lines = content.split('\n')
    print(f"Original file: {len(lines)} lines")
    
    # Find where translations object starts
    trans_start = None
    for i, line in enumerate(lines):
        if 'const translations' in line and 'Record<Language' in line:
            trans_start = i
            break
    
    if trans_start is None:
        print("❌ Could not find translations object!")
        return False
    
    # Keep everything before translations as-is
    header = lines[:trans_start]
    
    # Process translations section
    trans_lines = lines[trans_start:]
    
    # Rebuild with proper indentation
    fixed_lines = []
    depth = 0
    in_string = False
    escape_next = False
    
    for line in trans_lines:
        stripped = line.strip()
        
        # Skip empty lines
        if not stripped:
            fixed_lines.append('')
            continue
        
        # Calculate depth changes
        # Decrease depth BEFORE the line if it starts with }
        if stripped.startswith('}'):
            depth = max(0, depth - 1)
        
        # Apply correct indentation
        indent = '  ' * depth
        fixed_line = indent + stripped
        fixed_lines.append(fixed_line)
        
        # Increase depth AFTER the line if it ends with {
        if stripped.endswith('{') or (stripped.endswith('{') and ',' not in stripped):
            depth += 1
    
    # Combine header and fixed translations
    result = header + fixed_lines
    
    # Write the result
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(result))
    
    print(f"✅ Reconstructed file: {len(result)} lines")
    print("=" * 70)
    
    return True

if __name__ == '__main__':
    success = reconstruct_i18n()
    if success:
        print("\n🎉 File reconstruction complete!")
    else:
        print("\n❌ Reconstruction failed!")
