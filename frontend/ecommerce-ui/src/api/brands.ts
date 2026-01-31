import { api } from "./client";

export type BrandDto = {
  Id: number;
  Name: string;
};

export async function getBrands(): Promise<BrandDto[]> {
  const { data } = await api.get("/api/brands");
  return data;
}
