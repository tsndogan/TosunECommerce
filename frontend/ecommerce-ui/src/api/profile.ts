import {api} from "./client";

export type MeDto = {
    Email? : string | null;
    FullName? : string | null;
    Role? : string | null;
    IsSeller? : boolean;
    Description? : string | null;
    ShopName? : string | null;
};

export type BecomeSellerDto = {
    ShopName : string;
    Description? : string;
}

export async function getMe() : Promise<MeDto> {
    const {data} = await api.get("api/profile/me");
    return data;
}

export async function becomeSeller(dto:BecomeSellerDto) {
    const {data} = await api.post("api/profile/become-seller",dto);
    return data;
}