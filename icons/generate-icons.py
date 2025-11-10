"""
Python script to generate PNG icons from SVG
Requires: pip install cairosvg pillow
"""

try:
    import cairosvg
    from PIL import Image
    import io
    import os
except ImportError:
    print("Error: Required packages not installed.")
    print("Please run: pip install cairosvg pillow")
    exit(1)

def generate_icons():
    """Generate PNG icons from SVG at different sizes"""
    
    svg_file = 'icon128.svg'
    sizes = [16, 32, 48, 128]
    
    if not os.path.exists(svg_file):
        print(f"Error: {svg_file} not found!")
        return
    
    for size in sizes:
        try:
            # Convert SVG to PNG at specific size
            png_data = cairosvg.svg2png(
                url=svg_file,
                output_width=size,
                output_height=size
            )
            
            # Save PNG file
            output_file = f'icon{size}.png'
            with open(output_file, 'wb') as f:
                f.write(png_data)
            
            print(f'✓ Generated {output_file}')
            
        except Exception as e:
            print(f'✗ Failed to generate icon{size}.png: {str(e)}')
    
    print('\nAll icons generated successfully!')

if __name__ == '__main__':
    generate_icons()
