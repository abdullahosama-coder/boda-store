import time
from sqlalchemy import String, Integer, Float, Boolean, Text, JSON, BigInteger
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base


def now_ms() -> int:
    return int(time.time() * 1000)


class Category(Base):
    __tablename__ = "categories"
    name: Mapped[str] = mapped_column(String(120), primary_key=True)
    icon: Mapped[str] = mapped_column(String(16), default="")
    img: Mapped[str] = mapped_column(Text, default="")
    shop: Mapped[str] = mapped_column(String(160), default="")
    desc: Mapped[str] = mapped_column(Text, default="")
    long: Mapped[str] = mapped_column(Text, default="")
    subs: Mapped[list] = mapped_column(JSON, default=list)


class Product(Base):
    __tablename__ = "products"
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    name: Mapped[str] = mapped_column(String(200), index=True)
    cat: Mapped[str] = mapped_column(String(120), index=True)
    sub: Mapped[str] = mapped_column(String(120), default="")
    price: Mapped[float] = mapped_column(Float)
    old: Mapped[float] = mapped_column(Float, default=0)
    qty: Mapped[int | None] = mapped_column(Integer, nullable=True)
    brand: Mapped[str] = mapped_column(String(120), default="")
    condition: Mapped[str] = mapped_column(String(20), default="new")
    colors: Mapped[list] = mapped_column(JSON, default=list)
    sizes: Mapped[list] = mapped_column(JSON, default=list)
    components: Mapped[list] = mapped_column(JSON, default=list)
    warranty: Mapped[str] = mapped_column(String(120), default="")
    options: Mapped[list] = mapped_column(JSON, default=list)
    img: Mapped[str] = mapped_column(Text, default="")
    gallery: Mapped[list] = mapped_column(JSON, default=list)
    desc: Mapped[str] = mapped_column(Text, default="")
    long: Mapped[str] = mapped_column(Text, default="")
    features: Mapped[list] = mapped_column(JSON, default=list)
    badge: Mapped[str] = mapped_column(String(60), default="")
    stock: Mapped[bool] = mapped_column(Boolean, default=True)
    hidden: Mapped[bool] = mapped_column(Boolean, default=False)
    created: Mapped[int] = mapped_column(BigInteger, default=now_ms)


class Order(Base):
    __tablename__ = "orders"
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    phone: Mapped[str] = mapped_column(String(40))
    email: Mapped[str] = mapped_column(String(160), default="")
    city: Mapped[str] = mapped_column(String(120), default="")
    address: Mapped[str] = mapped_column(Text, default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    items: Mapped[list] = mapped_column(JSON, default=list)
    total: Mapped[float] = mapped_column(Float, default=0)
    status: Mapped[str] = mapped_column(String(20), default="new", index=True)
    created: Mapped[int] = mapped_column(BigInteger, default=now_ms, index=True)


class Message(Base):
    __tablename__ = "messages"
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(160), default="")
    phone: Mapped[str] = mapped_column(String(40), default="")
    subject: Mapped[str] = mapped_column(String(200), default="")
    message: Mapped[str] = mapped_column(Text)
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created: Mapped[int] = mapped_column(BigInteger, default=now_ms, index=True)


class AdminUser(Base):
    __tablename__ = "admin_users"
    username: Mapped[str] = mapped_column(String(80), primary_key=True)
    pw_hash: Mapped[str] = mapped_column(String(300))
