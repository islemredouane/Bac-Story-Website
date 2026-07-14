import os

file_path = r"c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\tools.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "<!-- Calculator Section \n"
if start_marker not in content:
    start_marker = "<!-- Calculator Section \r\n"

start_idx = content.find(start_marker)
if start_idx == -1:
    print("Could not find start marker.")
    exit(1)

end_marker = "    <!-- Weighted Average Calculator -->"
end_idx = content.find(end_marker, start_idx)
if end_idx == -1:
    print("Could not find end marker.")
    exit(1)

# Backtrack to find the -->
close_comment_idx = content.rfind("-->", start_idx, end_idx)

# Extract the commented block
block = content[start_idx:close_comment_idx + 3]

# Fix the start
new_block = block.replace(start_marker, "<!-- Calculator Section -->\n", 1)

# Fix the end
new_block = new_block[:-3] # remove trailing -->

# Fix inner comments
new_block = new_block.replace(" --\n", " -->\n")
new_block = new_block.replace(" --\r\n", " -->\r\n")

# Reconstruct
new_content = content[:start_idx] + new_block + content[close_comment_idx + 3:]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Done updating tools.html")
