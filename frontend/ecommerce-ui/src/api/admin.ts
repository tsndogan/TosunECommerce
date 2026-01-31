import {api} from "./client";
export type PendingSellerDto = {
    Id:number;
    FullName? :string | null;
    Email? : string | null;
    ShopName? : string | null;
    Description? : string | null;
}

export async function getPendingSellers() : Promise<PendingSellerDto[]> {
const {data} = await api.get("/api/admin/pending-sellers");
return data;
}

export async function approveSeller(id:number) {
    const {data} = await api.post(`/api/admin/approve-seller/${id}`);
    return data;
}