"""add rsvps table

Revision ID: 9c3d2e5f7a1b
Revises: 8b2c1d4e5f6a
Create Date: 2026-07-28

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '9c3d2e5f7a1b'
down_revision: Union[str, Sequence[str], None] = '8b2c1d4e5f6a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'rsvps',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('contact', sa.String(), nullable=False),
        sa.Column('attending', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('dietary', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_rsvps_id'), 'rsvps', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_rsvps_id'), table_name='rsvps')
    op.drop_table('rsvps')
