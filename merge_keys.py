import re

def read_file(path):
    with open(path, 'r') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w') as f:
        f.write(content)

i18n_path = '/Users/sydneyrolandabouna/.gemini/antigravity/scratch/project/src/lib/i18n.ts'
keys_path = '/tmp/product_keys_en.ts'

i18n_content = read_file(i18n_path)
keys_content = read_file(keys_path)

# Extract existing irrigation block
irrigation_match = re.search(r'irrigation: \{.*?\n    \},', i18n_content, re.DOTALL)
if not irrigation_match:
    print("Could not find irrigation block in i18n.ts")
    exit(1)

existing_irrigation_block = irrigation_match.group(0)

# Extract controllers block from existing irrigation
controllers_match = re.search(r'controllers: \{.*?\n      \}', existing_irrigation_block, re.DOTALL)
if not controllers_match:
    print("Could not find controllers block in existing irrigation")
    # If not found, maybe it's formatted differently, but we saw it earlier.
    # Let's try to capture it more loosely or just assume we need to keep it.
    # Actually, we can just use the keys_content which has the new structure
    # and we need to inject the controllers block into it.
    pass

existing_controllers = controllers_match.group(0) if controllers_match else ""

# Parse keys_content to get greenhouse, irrigation (new), and substrates
# keys_content is not valid JSON, it's JS object properties.
# We can just manually construct the new content.

# We have keys_content looking like:
# greenhouse: { ... },
# irrigation: { ... },
# substrates: { ... }

# We need to insert existing_controllers into the new irrigation block.
# The new irrigation block in keys_content looks like:
# irrigation: {
#   drip: { ... },
#   sprinklers: { ... }
# }

# We want:
# irrigation: {
#   controllers: { ... },
#   drip: { ... },
#   sprinklers: { ... }
# }

# So we find "irrigation: {" in keys_content and append existing_controllers after it.
new_irrigation_start = keys_content.find('irrigation: {')
if new_irrigation_start == -1:
    print("Could not find irrigation in keys content")
    exit(1)

# Insert controllers after "irrigation: {"
insertion_point = new_irrigation_start + len('irrigation: {')
new_keys_content = keys_content[:insertion_point] + '\n' + existing_controllers + ',' + keys_content[insertion_point:]

# Now replace the old irrigation block in i18n.ts with new_keys_content
# The old block is existing_irrigation_block
# We replace it with new_keys_content

final_content = i18n_content.replace(existing_irrigation_block, new_keys_content)

write_file(i18n_path, final_content)
print("Successfully updated i18n.ts")
