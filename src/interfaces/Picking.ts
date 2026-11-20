export interface PickingItem {
    product: string;
    curva_Produto: string;
    quantity: number;
    location: string;
    createdAt: string;
    map_Id: number;
    total_Posicao: number;
    curva_Posicao: "A" | "B" | "C" | "D";
}