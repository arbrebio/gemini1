#!/usr/bin/env python3
"""
Precise i18n.ts brace fixer - removes the extra closing brace
"""
from pathlib import Path

def fix_braces_precisely():
    file_path = Path('src/lib/i18n.ts')
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    print("=" * 60)
    print("PRECISE BRACE FIX")
    print("=" * 60)
    
    # The file currently ends with:
    # Line 4379:     organic: '100% organies'
    # Line 4380:   }
    # Line 4381:   }
    # Line 4382:   }
    # Line 4383:   };
    
    # It should end with:
    # Line 4379:     organic: '100% organies'
    # Line 4380:   }     <- closes features
    # Line 4381:   }     <- closes af language
    # Line 4382: };      <- closes translations object
    
    # So we need to remove ONE closing brace
    
    # Check the last 10 lines
    print("\nLast 10 lines BEFORE fix:")
    for i, line in enumerate(lines[-10:], start=len(lines)-9):
        print(f"  {i}: {line.rstrip()}")
    
    # Remove line 4381 (index 4380) which is the extra closing brace
    if len(lines) >= 4382 and lines[4380].strip() == '}':
        print(f"\n✅ Removing extra closing brace at line 4381")
        del lines[4380]
    
    # Write fixed content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    print(f"\n✅ Fixed content written to {file_path}")
    print(f"   New total lines: {len(lines)}")
    
    # Show last 10 lines after fix
    print("\nLast 10 lines AFTER fix:")
    for i, line in enumerate(lines[-10:], start=len(lines)-9):
        print(f"  {i}: {line.rstrip()}")
    
    print("=" * 60)

if __name__ == '__main__':
    fix_braces_precisely()
