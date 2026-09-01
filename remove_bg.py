from PIL import Image
from collections import deque

def process_user_doctor_image(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()

    # Create mask for background transparency
    mask = Image.new("L", (width, height), 255)
    mask_pixels = mask.load()

    # Floodfill white background from edges
    queue = deque()
    visited = set()

    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))

    while queue:
        x, y = queue.popleft()
        if (x, y) in visited:
            continue
        visited.add((x, y))

        if 0 <= x < width and 0 <= y < height:
            r, g, b, a = pixels[x, y]
            # Outer white or transparent backdrop check
            if a < 10 or (r > 240 and g > 240 and b > 240):
                mask_pixels[x, y] = 0
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                        queue.append((nx, ny))

    img.putalpha(mask)
    img.save(output_path, "PNG")
    print(f"Successfully processed user uploaded doctor image: {output_path}")

if __name__ == "__main__":
    process_user_doctor_image("images/doctor_user.png", "images/doctor.png")
