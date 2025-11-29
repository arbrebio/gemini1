#!/usr/bin/env python3
"""
Surgical fix for i18n.ts - find and fix the exact brace mismatch
"""
from pathlib import Path

def surgical_fix():
    file_path = Path('src/lib/i18n.ts')
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    print("=" * 70)
    print("SURGICAL BRACE FIX")
    print("=" * 70)
    
    # Track braces line by line
    brace_balance = 0
    problem_lines = []
    
    for i, line in enumerate(lines, 1):
        line_open = line.count('{')
        line_close = line.count('}')
        brace_balance += (line_open - line_close)
        
        # Track where balance goes negative or gets too high
        if brace_balance < 0:
            problem_lines.append((i, brace_balance, 'negative'))
        elif brace_balance > 50:  # Suspiciously high
            problem_lines.append((i, brace_balance, 'too_high'))
    
    print(f"\nFinal brace balance: {brace_balance}")
    print(f"Total lines: {len(lines)}")
    
    if problem_lines:
        print(f"\nProblem lines found: {len(problem_lines)}")
        for line_num, balance, issue in problem_lines[:10]:
            print(f"  Line {line_num}: balance={balance}, issue={issue}")
            print(f"    Content: {lines[line_num-1].rstrip()}")
    
    # The file has +1 unclosed brace, meaning we need to add 1 closing brace
    # Find the best place to add it - likely at the end before the final };
    
    if brace_balance == 1:
        print("\n✅ Confirmed: 1 unclosed opening brace")
        print("   Adding closing brace before final };")
        
        # Find the line with final };
        for i in range(len(lines) - 1, -1, -1):
            if lines[i].strip() == '};':
                print(f"   Found final }}; at line {i+1}")
                # Insert a closing brace before it
                indent = '  '  # Assuming 2-space indent
                lines.insert(i, indent + '}\n')
                print(f"   Inserted closing brace at line {i+1}")
                break
        
        # Write fixed content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        
        print(f"\n✅ Fixed! New total lines: {len(lines)}")
        return True
    
    print("=" * 70)
    return False

if __name__ == '__main__':
    success = surgical_fix()
    if success:
        print("\n🎉 Surgical fix complete!")
    else:
        print("\n❌ Could not apply surgical fix!")
