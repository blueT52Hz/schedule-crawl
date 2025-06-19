import { PrismaClient } from "@prisma/client";
import prisma from "./prisma";
import { CityReturn } from "./schema";
import { cityReturnSchema } from "./schema";

class CityRepository {
  constructor(private prisma: PrismaClient) {}

  async findAllCities(): Promise<CityReturn[]> {
    const cities = await this.prisma.city.findMany();
    return cities.map((city) => cityReturnSchema.parse(city));
  }
}

const cityRepository = new CityRepository(prisma);
export default cityRepository;
