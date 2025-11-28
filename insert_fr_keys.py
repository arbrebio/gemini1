#!/usr/bin/env python3

def read_file(path):
    with open(path, 'r') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w') as f:
        f.write(content)

i18n_path = '/Users/sydneyrolandabouna/.gemini/antigravity/scratch/project/src/lib/i18n.ts'
keys_path = '/tmp/product_keys_fr.ts'

i18n_content = read_file(i18n_path)
keys_content = read_file(keys_path)

# Split i18n_content into lines
lines = i18n_content.split('\n')

# Find line 2614 (0-indexed = 2613)
insertion_line = 2613

# Insert keys_content before line 2614
# Add proper indentation (4 spaces for top-level keys in fr block)
indented_keys = '\n'.join('    ' + line if line.strip() else line for line in keys_content.split('\n'))

# Insert before the validation line
lines.insert(insertion_line, indented_keys)

# Join back
final_content = '\n'.join(lines)

write_file(i18n_path, final_content)
print("Successfully inserted French product keys into i18n.ts")
