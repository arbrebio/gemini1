import re

def read_file(path):
    with open(path, 'r') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w') as f:
        f.write(content)

i18n_path = '/Users/sydneyrolandabouna/.gemini/antigravity/scratch/project/src/lib/i18n.ts'
keys_path = '/tmp/controllers_keys.ts'

i18n_content = read_file(i18n_path)
keys_content = read_file(keys_path)

# Find "irrigation: {"
irrigation_start = i18n_content.find('irrigation: {')
if irrigation_start == -1:
    print("Could not find irrigation block in i18n.ts")
    exit(1)

# Insert keys_content after "irrigation: {"
insertion_point = irrigation_start + len('irrigation: {')
# Add a newline before keys_content for formatting
final_content = i18n_content[:insertion_point] + '\n' + keys_content + ',' + i18n_content[insertion_point:]

write_file(i18n_path, final_content)
print("Successfully restored controllers in i18n.ts")
