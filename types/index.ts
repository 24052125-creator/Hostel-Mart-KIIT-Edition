export interface Product {
    _id?: string;
    name: string;
    image: string[];
    description?: string;
    size: string;
    tags?: ("fixed price" | "negotiable" | "doorstep delivery" | "at mrp")[];
    price: string;
    stock: number;
    userId?: string;
    storeId?: string;
}
