import { z } from "zod";

export const createWeatherSchema = z.object({
  city_id: z.string(),
  city_name: z.string(),
  temp_current: z.number(),
  temp_min: z.number(),
  temp_max: z.number(),
  temp_feels_like: z.number(),
  description: z.string(),
  humidity: z.number(),
  visibility: z.number(),
  wind_speed: z.number(),
  uv: z.number(),
  rain_amount: z.number(),
  air_quality: z.object({
    create: z.object({
      quality: z.string(),
      co: z.number(),
      nh3: z.number(),
      no: z.number(),
      no2: z.number(),
      o3: z.number(),
      so2: z.number(),
      pm2_5: z.number(),
      pm10: z.number(),
    }),
  }),
});

export const createWeatherReturnSchema = z.object({
  city_id: z.string(),
  temp_current: z.number(),
  temp_min: z.number(),
  temp_max: z.number(),
  temp_feels_like: z.number(),
  description: z.string(),
  humidity: z.number(),
  visibility: z.number(),
  wind_speed: z.number(),
  uv: z.number(),
  rain_amount: z.number(),
  created_at: z.date(),
  updated_at: z.date(),
  air_quality: z.object({
    quality: z.string(),
    co: z.number(),
    nh3: z.number(),
    no: z.number(),
    no2: z.number(),
    o3: z.number(),
    so2: z.number(),
    pm2_5: z.number(),
    pm10: z.number(),
  }),
});

export const crawlerWeatherReturnSchema = z.object({
  city_name: z.string(),
  city_id: z.string(),
  temp_current: z.number(),
  temp_min: z.number(),
  temp_max: z.number(),
  temp_feels_like: z.number(),
  description: z.string(),
  humidity: z.number(),
  visibility: z.number(),
  wind_speed: z.number(),
  uv: z.number(),
  rain_amount: z.number(),
  air_quality: z.object({
    quality: z.string(),
    co: z.number(),
    nh3: z.number(),
    no: z.number(),
    no2: z.number(),
    o3: z.number(),
    so2: z.number(),
    pm2_5: z.number(),
    pm10: z.number(),
  }),
});

export const cityReturnSchema = z.object({
  city_id: z.string(),
  city_name: z.string(),
  slug: z.string(),
  region_id: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type CityReturn = z.infer<typeof cityReturnSchema>;
export type CreateWeather = z.infer<typeof createWeatherSchema>;
export type CreateWeatherReturn = z.infer<typeof createWeatherReturnSchema>;
export type CrawlerWeatherReturn = z.infer<typeof crawlerWeatherReturnSchema>;
