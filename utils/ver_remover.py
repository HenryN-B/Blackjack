import os
import re

base_path = "/Users/henrynorton-bower/Documents/Programing/Blackjack/static/images"
version = "1.1.0"
extensions = [".css", ".js", ".png", ".jpeg",".mp3"]

# Match .v2 repeated before the file extension, e.g., .v2.v2.v2.png
pattern = re.compile(rf"(\.{version})+(\.\w+)$")

for filename in os.listdir(base_path):
    name, ext = os.path.splitext(filename)
    if ext in extensions:
        fixed_name = re.sub(pattern, r"\2", filename)
        if filename != fixed_name:
            old_path = os.path.join(base_path, filename)
            new_path = os.path.join(base_path, fixed_name)
            print(f"Renaming {filename} -> {fixed_name}")
            os.rename(old_path, new_path)