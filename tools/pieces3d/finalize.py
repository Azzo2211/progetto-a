import sys, os
from PIL import Image, ImageFilter, ImageChops
src, dst = sys.argv[1], sys.argv[2]
W = int(sys.argv[3]) if len(sys.argv) > 3 else 256
style = sys.argv[4] if len(sys.argv) > 4 else 'real'
os.makedirs(dst, exist_ok=True)
for color in 'wb':
  for t in 'KQRBNP':
    im = Image.open(f'{src}/{color}{t}.png').convert('RGBA')
    a = im.split()[3]
    if style == 'anime':
      # il contorno a inchiostro c'e' gia': solo un alone chiaro leggero sul Nero
      halo = a.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.4))
      tint, k = ((255, 255, 255, 0), 0.0) if color == 'w' else ((205, 225, 255, 0), 0.28)
      layer = Image.new('RGBA', im.size, tint)
      layer.putalpha(halo.point(lambda v: int(v * k)))
    elif color == 'w':
      halo = a.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.GaussianBlur(1.2))
      layer = Image.new('RGBA', im.size, (36, 30, 48, 0))
      layer.putalpha(halo.point(lambda v: int(v * 0.62)))
    else:
      halo = a.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
      layer = Image.new('RGBA', im.size, (230, 214, 190, 0))
      layer.putalpha(halo.point(lambda v: int(v * 0.22)))
    out = Image.alpha_composite(layer, im)
    h = round(W * im.size[1] / im.size[0])
    out = out.resize((W, h), Image.LANCZOS)
    out.save(f'{dst}/{color}{t}.webp', 'WEBP', quality=90, method=6)
    out.save(f'{dst}/{color}{t}.png')
print('ok')
