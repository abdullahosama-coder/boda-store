from pydantic import BaseModel, Field, ConfigDict


class ProductIn(BaseModel):
    id: str | None = Field(default=None, max_length=40)
    name: str = Field(min_length=1, max_length=200)
    cat: str
    sub: str = ""
    price: float = Field(ge=0)
    old: float = Field(default=0, ge=0)
    qty: int | None = Field(default=None, ge=0)
    brand: str = ""
    warranty: str = ""
    options: list[str] = []
    img: str = ""
    gallery: list[str] = []
    desc: str = ""
    long: str = ""
    features: list[str] = []
    badge: str = ""
    stock: bool = True
    hidden: bool = False


class ProductOut(ProductIn):
    model_config = ConfigDict(from_attributes=True)
    id: str


class ProductPatch(BaseModel):
    stock: bool | None = None
    hidden: bool | None = None
    price: float | None = Field(default=None, ge=0)
    old: float | None = Field(default=None, ge=0)
    qty: int | None = Field(default=None, ge=0)
    img: str | None = None


class CategoryIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    icon: str = ""
    shop: str = ""
    desc: str = ""
    long: str = ""
    subs: list[str] = []


class CategoryOut(CategoryIn):
    model_config = ConfigDict(from_attributes=True)


class LoginIn(BaseModel):
    username: str
    password: str


class OrderItemIn(BaseModel):
    id: str
    qty: int = Field(ge=1, le=100)


class OrderIn(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    phone: str = Field(min_length=5, max_length=40)
    email: str = ""
    city: str = ""
    address: str = ""
    notes: str = ""
    items: list[OrderItemIn] = Field(min_length=1)


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    phone: str
    email: str
    city: str
    address: str
    notes: str
    items: list
    total: float
    status: str
    created: int


class StatusIn(BaseModel):
    status: str


class MessageIn(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    email: str = ""
    phone: str = ""
    subject: str = ""
    message: str = Field(min_length=1, max_length=5000)


class MessageOut(MessageIn):
    model_config = ConfigDict(from_attributes=True)
    id: str
    read: bool
    created: int


class BulkIds(BaseModel):
    ids: list[str] = Field(min_length=1, max_length=500)
