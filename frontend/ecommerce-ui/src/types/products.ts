export enum ErgonomyLevel {
    Low = "Low",
    Medium = "Medium",
    High = "High"
}

export type ProductDto = {
    id : number;
    name? : string | null;
    stock : number;
    price : number;
    imageUrl? : string | null;
    description? : string | null;
    categoryName? : string | null;
    brandName? : string | null;
    sellerShopName? : string | null;
    warrantyMonths : number;
    ergonomyLevel? : ErgonomyLevel | null;
    connectivityType : string | null;
    supportedOS : string | null;
}