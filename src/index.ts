import cityRepository from "./CityRepository";
import { CreateWeather, CityReturn, CrawlerWeatherReturn } from "./schema";
import crawlerService from "./crawler";
import weatherRepository from "./WeatherRepository";
import logger from "./logger";

const formatWeatherData = (
  weatherData: CrawlerWeatherReturn[]
): CreateWeather[] => {
  return weatherData.map((weather) => {
    return {
      ...weather,
      air_quality: {
        create: weather.air_quality,
      },
    };
  });
};

const updateWeather = async (): Promise<void> => {
  logger.info("Bắt đầu cập nhật thời tiết lúc " + new Date().toISOString());

  const cities: CityReturn[] = await cityRepository.findAllCities();

  const chunkSize = 5;
  const chunks: CityReturn[][] = [];

  for (let i = 0; i < cities.length; i += chunkSize) {
    chunks.push(cities.slice(i, i + chunkSize));
  }

  for (const chunk of chunks) {
    // Crawl dữ liệu thời tiết
    const weatherData: CrawlerWeatherReturn[] = (
      await Promise.all(
        chunk.map((city) => crawlerService.crawlCurrentWeather(city))
      )
    ).filter((result) => result !== null);

    const formattedWeatherData: CreateWeather[] =
      formatWeatherData(weatherData);

    await Promise.all(
      formattedWeatherData.map((weatherData) =>
        weatherRepository.createWeather(weatherData)
      )
    );
  }
  logger.info("Cập nhật thời tiết hoàn tất lúc " + new Date().toISOString());
  return;
};

const main = async () => {
  await updateWeather();
  process.exit(0);
};

main().catch(console.error);
