"""add guests column to rsvps

Revision ID: a1b2c3d4e5f6
Revises: 9c3d2e5f7a1b
Create Date: 2026-08-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '9c3d2e5f7a1b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('rsvps', sa.Column('guests', sa.Integer(), nullable=False, server_default='0'))
    op.alter_column('rsvps', 'guests', server_default=None)


def downgrade() -> None:
    op.drop_column('rsvps', 'guests')
