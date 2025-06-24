// Ficheiro: src/types.ts

export type MenuItem = {
    id: number;
    name: string;
    description: string;
    price: number;
};

export type OrderItem = {
    id: number;
    quantity: number;
    menu_items: { // O item de menu relacionado
        id: number;
        name: string;
    }
};