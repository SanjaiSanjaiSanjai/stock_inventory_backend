"""add price column in products table

Revision ID: 374a145bcb95
Revises: 589e0923512e
Create Date: 2026-07-28 11:31:24.495429

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '374a145bcb95'
down_revision: Union[str, Sequence[str], None] = '589e0923512e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "products",
        sa.Column(
            "price",
            sa.Float,
            nullable=False,
            server_default="0.0",
        ),
    )
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
