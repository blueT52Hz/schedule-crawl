import { Browser } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { crawlerWeatherReturnSchema } from "./schema";
import { CrawlerWeatherReturn } from "./schema";
import { City } from "@prisma/client";
import logger from "./logger";

puppeteer.use(StealthPlugin());

export class CrawlerService {
  private browser: Browser | null = null;

  constructor() {
    this.initBrowser();
  }

  private async initBrowser() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
      ],
    });
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async crawlCurrentWeather(city: City): Promise<CrawlerWeatherReturn | null> {
    if (!this.browser) {
      await this.initBrowser();
    }

    const page = await this.browser!.newPage();

    try {
      page.setDefaultNavigationTimeout(30000);
      await page.goto(`https://thoitiet.vn/${city.slug}`, {
        waitUntil: "domcontentloaded",
        referer: "https://www.google.com",
      });

      // Wait for the temperature element to appear
      await page.waitForSelector("h1.location-name-main", { timeout: 30000 });

      const weatherData = await page.evaluate(() => {
        // Get weather information (hardcoded for now)

        const temp_current = Number(
          document
            .querySelector("div.overview-current > span")
            ?.textContent?.slice(0, -1)
        );

        const [temp_min, temp_max] = document
          .querySelector(
            "div.weather-detail div.d-flex:first-child span.text-white"
          )
          ?.textContent?.split("/")
          .map((item) => Number(item.trim().slice(0, -1)) || 0) || [0, 0];

        const temp_feels_like = Number(
          document
            .querySelector(".overview-caption-summary-detail")
            ?.textContent?.split("Cảm giác như ")[1]
            .slice(0, -2) || 0
        );
        const description =
          document
            .querySelector(".overview-caption-item-detail")
            ?.textContent?.trim() || "";
        const humidity = Number(
          document
            .querySelector(
              "div.weather-detail > div.d-flex:nth-of-type(2) span.text-white"
            )
            ?.textContent?.slice(0, -1) || 0
        );
        const visibility =
          Number(
            document
              .querySelector(
                "div.weather-detail div.d-flex:nth-child(3) span.text-white"
              )
              ?.textContent?.split(" km")[0]
          ) || 0;
        const wind_speed = Number(
          document
            .querySelector(
              "div.weather-detail div.d-flex:nth-child(4) span.text-white"
            )
            ?.textContent?.split(" km/giờ")[0] || 0
        );
        const uv =
          Number(
            document.querySelector(
              "div.weather-detail div.d-flex:nth-child(6) span.text-white"
            )?.textContent
          ) || 0;

        // Get air quality information (hardcoded for now)
        const quality =
          document
            .querySelector(".air-title")
            ?.textContent?.trim()
            .split("Chất lượng không khí: ")[1] || "";
        const [co, nh3, no, no2, o3, so2, pm2_5, pm10] = Array.from(
          { length: 8 },
          (_, i) => i
        ).map((i) => {
          return Number(
            document
              .querySelectorAll(".air-components div div span")
              [i]?.textContent?.trim() || 0
          );
        });

        const rain_amount = Number(
          document
            .querySelector(".rain-volume")
            ?.textContent?.trim()
            .split("\n")[0] || 0
        );

        const weatherData: Omit<CrawlerWeatherReturn, "city_id" | "city_name"> =
          {
            temp_current,
            temp_min,
            temp_max,
            temp_feels_like,
            description,
            humidity,
            visibility,
            wind_speed,
            uv,
            rain_amount,
            air_quality: {
              quality,
              co,
              nh3,
              no,
              no2,
              o3,
              so2,
              pm2_5,
              pm10,
            },
          };

        return weatherData;
      });

      const result = crawlerWeatherReturnSchema.safeParse({
        ...weatherData,
        city_id: city.city_id,
        city_name: city.city_name,
      });
      if (!result.success) {
        throw new Error(
          "Lỗi khi lấy thông tin thời tiết thành phố " +
            city.city_name +
            " " +
            result.error.flatten().fieldErrors
        );
      }
      return result.data;
    } catch (error) {
      logger.error("Lỗi:", error);
      return null;
    } finally {
      await page.close();
    }
  }
}

const crawlerService = new CrawlerService();
export default crawlerService;
