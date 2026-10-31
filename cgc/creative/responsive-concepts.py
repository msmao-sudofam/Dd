"""Export lighter responsive variants; retain all original concept assets."""
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]/'site/assets/concepts'
for name in ['entrance-light','storefront-before','storefront-after','office-before','office-after','curtain-wall-before','curtain-wall-after']:
    image=Image.open(root/(name+'.webp')).convert('RGB')
    image.thumbnail((768,768),Image.Resampling.LANCZOS)
    image.save(root/(name+'-sm.webp'),quality=72,method=6)
    print(name,(root/(name+'-sm.webp')).stat().st_size)
