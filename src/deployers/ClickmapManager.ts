import { ClickmapCrawler } from "../crawlers/ClickmapCrawler";
import type { FeatureInstanceArrRO } from "../features";
import { Log } from "../utils/log";
import type { Deployer } from "./types";

type MouseEventHandler = (e: MouseEvent) => void;

export interface TriggeredByClick {
  clickmaps: Partial<Record<keyof ClickmapCrawler, MouseEventHandler>>;
}
const uniqueKey: keyof TriggeredByClick = "clickmaps";

export class ClickmapManager implements Deployer {
  private crawler = new ClickmapCrawler();
  private elAndhandlers: [HTMLElement, MouseEventHandler][] = [];
  private log = new Log(this.constructor.name);

  deploy(deployableFeatures: FeatureInstanceArrRO) {
    const targetFeatures = deployableFeatures.filter((f) => uniqueKey in f);
    for (const f of targetFeatures) {
      for (const [crawlerFnName, handler] of Object.entries(f.clickmaps)) {
        if (!this.checkCrawlerFnName(crawlerFnName)) {
          this.log.err(
            `invalid clickmap key found in ${f.constructor.name}: ${crawlerFnName}`,
          );
          continue;
        }

        this.crawler[crawlerFnName]({ wait: "long" }).then((el) => {
          if (!el) {
            this.log.err(`element not found: ${crawlerFnName}`);
            return;
          }
          this.elAndhandlers.push([el, handler]);
          el.addEventListener("click", handler);
        });
      }
    }
  }

  cleanup() {
    for (const [el, h] of this.elAndhandlers) {
      el.removeEventListener("click", h);
    }
  }

  private checkCrawlerFnName(name: string): name is keyof ClickmapCrawler {
    const bool = name in this.crawler;
    return bool;
  }
}
