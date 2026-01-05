from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    # Create image with pirate/card theme colors
    img = Image.new('RGB', (size, size), color='#1a1a2e')
    draw = ImageDraw.Draw(img)
    
    # Draw gold circle background
    margin = size // 10
    draw.ellipse([margin, margin, size-margin, size-margin], fill='#ffd700')
    
    # Draw red inner circle
    margin2 = size // 5
    draw.ellipse([margin2, margin2, size-margin2, size-margin2], fill='#d32f2f')
    
    # Draw anchor symbol (simplified)
    center_x = size // 2
    center_y = size // 2
    
    # Anchor vertical line
    line_width = size // 20
    draw.rectangle([center_x - line_width, center_y - size//3, 
                   center_x + line_width, center_y + size//4], fill='white')
    
    # Anchor crossbar
    draw.rectangle([center_x - size//4, center_y, 
                   center_x + size//4, center_y + line_width*2], fill='white')
    
    # Anchor bottom hooks
    hook_size = size // 8
    draw.ellipse([center_x - size//4 - hook_size, center_y + size//6,
                 center_x - size//4 + hook_size, center_y + size//6 + hook_size*2], 
                 fill='white')
    draw.ellipse([center_x + size//4 - hook_size, center_y + size//6,
                 center_x + size//4 + hook_size, center_y + size//6 + hook_size*2], 
                 fill='white')
    
    # Save
    img.save(filename, 'PNG')
    print(f'Created {filename}')

# Create icons
create_icon(192, 'icon-192.png')
create_icon(512, 'icon-512.png')

print('Icons created successfully!')
