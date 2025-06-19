import { PrismaClient } from "@prisma/client";
import {
  CreateWeather,
  CreateWeatherReturn,
  createWeatherReturnSchema,
} from "./schema";
import prisma from "./prisma";
import logger from "./logger";
import { omit } from "lodash";

class WeatherRepository {
  constructor(private prisma: PrismaClient) {}
  async createWeather(data: CreateWeather): Promise<CreateWeatherReturn> {
    const newWeather = await this.prisma.weatherHistory.create({
      data: omit(data, "city_name"),
      include: {
        air_quality: true,
      },
    });
    logger.info("Cập nhật thời tiết thành phố " + data.city_name);
    return createWeatherReturnSchema.parse(newWeather);
  }
}

const weatherRepository = new WeatherRepository(prisma);
export default weatherRepository;
