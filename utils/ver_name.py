import os

version = "1.2.0"
extensions = [".css", ".js", ".png", ".jpeg"]
folder = "/Users/henrynorton-bower/Documents/Programing/Blackjack/static/images"

for filename in os.listdir(folder):
    name, ext = os.path.splitext(filename)
    if ext in extensions:
        old_path = os.path.join(folder, filename)
        new_name = f"{name}.{version}{ext}"
        new_path = os.path.join(folder, new_name)
        os.rename(old_path, new_path)