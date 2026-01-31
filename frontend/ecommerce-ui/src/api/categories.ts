import {api} from "./client";

export type CategoryDto = {
    Id: number;
    Name:string;
};

export async function getCategories() : Promise<CategoryDto[]> {
    const res = await api.get("/api/categories");
    return res.data;
}