#!/usr/bin/env python3

def read_file(path):
    with open(path, 'r') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w') as f:
        f.write(content)

i18n_path = '/Users/sydneyrolandabouna/.gemini/antigravity/scratch/project/src/lib/i18n.ts'
es_keys_path = '/tmp/product_keys_es.ts'

i18n_content = read_file(i18n_path)
es_keys_content = read_file(es_keys_path)

# Split i18n_content into lines
lines = i18n_content.split('\n')

# Find the Spanish validation line (we need to recalculate after FR insertion)
# Search for "es: {" then find the next "validation: {"
es_start = None
es_validation = None
for i, line in enumerate(lines):
    if 'es: {' in line and es_start is None:
        es_start = i
    if es_start is not None and 'validation: {' in line and i > es_start:
        es_validation = i
        break

if es_validation is None:
    print("Could not find ES validation block")
    exit(1)

print(f"Found ES validation at line {es_validation + 1}")

# Insert ES keys before validation
indented_es_keys = '\n'.join('    ' + line if line.strip() else line for line in es_keys_content.split('\n'))
lines.insert(es_validation, indented_es_keys)

# Join and write
final_content = '\n'.join(lines)
write_file(i18n_path, final_content)
print("Successfully inserted Spanish product keys into i18n.ts")
