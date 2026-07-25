"""add approved column to submissions

Revision ID: 8b2c1d4e5f6a
Revises: 7477faa41a36
Create Date: 2026-07-23

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '8b2c1d4e5f6a'
down_revision: Union[str, Sequence[str], None] = '7477faa41a36'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # server_default true grandfathers existing rows as approved; new rows come
    # in via the ORM with approved=False and need admin confirmation.
    op.add_column('submissions', sa.Column(
        'approved', sa.Boolean(), nullable=False, server_default=sa.true()))
    op.alter_column('submissions', 'approved', server_default=None)


def downgrade() -> None:
    op.drop_column('submissions', 'approved')
