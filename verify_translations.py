#!/usr/bin/env python3
"""
Comprehensive Translation Verification Script
Scans all Astro pages for untranslated English content
"""
import re
import os
from pathlib import Path
from typing import List, Dict, Set

class TranslationVerifier:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.pages_dir = self.project_root / "src" / "pages" / "[lang]"
        self.issues = []
        
        # Common English words that shouldn't appear in translated pages
        self.english_indicators = [
            'the', 'and', 'for', 'with', 'our', 'your', 'about',
            'contact', 'home', 'services', 'products', 'solutions',
            'get started', 'learn more', 'read more', 'click here',
            'submit', 'send', 'email', 'phone', 'address',
            'privacy policy', 'terms', 'cookies', 'copyright'
        ]
        
    def scan_file(self, file_path: Path) -> List[Dict]:
        """Scan a single Astro file for untranslated content"""
        issues = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
            
            # Check for hardcoded English strings in HTML
            for i, line in enumerate(lines, 1):
                # Skip script/style sections
                if '<script' in line or '<style' in line or 'import' in line:
                    continue
                
                # Look for hardcoded text in HTML tags
                # Pattern: >English Text<
                html_text_pattern = r'>([A-Z][a-zA-Z\s]{3,})<'
                matches = re.findall(html_text_pattern, line)
                for match in matches:
                    if any(word in match.lower() for word in self.english_indicators):
                        issues.append({
                            'file': str(file_path.relative_to(self.project_root)),
                            'line': i,
                            'type': 'hardcoded_text',
                            'content': match.strip(),
                            'severity': 'high'
                        })
                
                # Look for hardcoded strings in attributes
                # Pattern: placeholder="English" or title="English"
                attr_pattern = r'(?:placeholder|title|alt|aria-label)=["\']([^"\']{5,})["\']'
                matches = re.findall(attr_pattern, line)
                for match in matches:
                    if any(char.isalpha() for char in match) and not match.startswith('{'):
                        if any(word in match.lower() for word in self.english_indicators):
                            issues.append({
                                'file': str(file_path.relative_to(self.project_root)),
                                'line': i,
                                'type': 'hardcoded_attribute',
                                'content': match.strip(),
                                'severity': 'medium'
                            })
                
                # Check for missing t() function usage
                # If we see English-like text but no t() call nearby
                if any(word in line.lower() for word in ['button', 'link', 'heading']):
                    if 't(' not in line and 'const' not in line:
                        # Potential untranslated element
                        pass  # This is a heuristic, may have false positives
        
        except Exception as e:
            print(f"Error scanning {file_path}: {e}")
        
        return issues
    
    def scan_all_pages(self) -> Dict:
        """Scan all Astro pages"""
        all_issues = []
        files_scanned = 0
        
        # Find all .astro files
        for astro_file in self.pages_dir.rglob("*.astro"):
            files_scanned += 1
            file_issues = self.scan_file(astro_file)
            all_issues.extend(file_issues)
        
        # Group issues by file
        issues_by_file = {}
        for issue in all_issues:
            file = issue['file']
            if file not in issues_by_file:
                issues_by_file[file] = []
            issues_by_file[file].append(issue)
        
        return {
            'total_files': files_scanned,
            'total_issues': len(all_issues),
            'issues_by_file': issues_by_file,
            'high_severity': len([i for i in all_issues if i['severity'] == 'high']),
            'medium_severity': len([i for i in all_issues if i['severity'] == 'medium'])
        }
    
    def generate_report(self, results: Dict) -> str:
        """Generate a formatted report"""
        report = []
        report.append("=" * 70)
        report.append("TRANSLATION VERIFICATION REPORT")
        report.append("=" * 70)
        report.append(f"\nFiles Scanned: {results['total_files']}")
        report.append(f"Total Issues Found: {results['total_issues']}")
        report.append(f"  - High Severity: {results['high_severity']}")
        report.append(f"  - Medium Severity: {results['medium_severity']}")
        report.append("\n" + "=" * 70)
        
        if results['total_issues'] == 0:
            report.append("\n✅ NO ISSUES FOUND! All pages appear to be properly translated.")
        else:
            report.append("\n⚠️  ISSUES FOUND:\n")
            
            for file, issues in sorted(results['issues_by_file'].items()):
                report.append(f"\n📄 {file}")
                report.append(f"   Issues: {len(issues)}")
                
                for issue in issues[:5]:  # Show first 5 issues per file
                    report.append(f"   Line {issue['line']}: [{issue['type']}] {issue['content'][:50]}")
                
                if len(issues) > 5:
                    report.append(f"   ... and {len(issues) - 5} more issues")
        
        report.append("\n" + "=" * 70)
        return "\n".join(report)

def main():
    project_root = "/Users/sydneyrolandabouna/.gemini/antigravity/scratch/project"
    
    print("Starting translation verification...")
    print(f"Project root: {project_root}\n")
    
    verifier = TranslationVerifier(project_root)
    results = verifier.scan_all_pages()
    report = verifier.generate_report(results)
    
    print(report)
    
    # Save report to file
    report_file = Path(project_root) / "translation_verification_report.txt"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\n📝 Report saved to: {report_file}")
    
    return results['total_issues']

if __name__ == "__main__":
    exit_code = main()
    exit(0 if exit_code == 0 else 1)
