"""Product-specific business helpers."""

import re
from uuid import uuid4


def build_product_image_filename(product_name: str, extension: str) -> str:
    """Create a safe, collision-resistant filename for an uploaded product image."""
    slug = re.sub(r"[^a-z0-9]+", "-", product_name.lower().strip()).strip("-")
    return f"{slug or 'product'}-{uuid4().hex[:8]}{extension}"
