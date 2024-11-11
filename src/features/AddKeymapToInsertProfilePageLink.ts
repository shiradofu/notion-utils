import type { TriggeredByKeymap } from "../conductors/KeymapManager";
import type { FeatureConfig } from "../config/feature";
import { AppCrawler } from "../crawlers/AppCrawler";
import { OverlaysCrawler } from "../crawlers/OverlaysCrawler";
import { createCrawlerFn } from "../crawlers/create";
import { Log } from "../utils/log";

export class AddKeymapToInsertProfilePageLink implements TriggeredByKeymap {
  private processing = false;

  constructor(
    private config: FeatureConfig["addKeymapToInsertProfilePageLink"],
  ) {}

  keymaps = {
    [this.config.keymap]: (e: KeyboardEvent) => {
      e.stopPropagation();
      this.run().finally(() => {
        this.processing = false;
      });
    },
  };

  @Log.thrownInMethodAsync
  private async run() {
    if (this.processing) return;
    this.processing = true;

    const currentNode = getSelection()?.anchorNode;
    const focusedEl =
      currentNode instanceof HTMLElement
        ? currentNode
        : currentNode?.parentElement;
    if (!focusedEl || !focusedEl.isContentEditable) return;

    document.execCommand("insertText", false, "[");
    setTimeout(() => {
      document.execCommand(
        "insertText",
        false,
        `[${this.config.profilePageTitle}`,
      );
    }, 10);

    const app = new AppCrawler();
    const overlaysEl = app.getOverlayContainer("must");
    const overlays = new OverlaysCrawler(overlaysEl);
    overlays.ensureCount("must", { args: [1], wait: "short" });

    const target = await createCrawlerFn(() => {
      const items = overlaysEl.querySelectorAll<HTMLElement>("[role=menuitem]");
      for (const item of items) {
        if (item.textContent?.startsWith(this.config.profilePageTitle)) {
          return item;
        }
      }
    }, "failed to get profile page link in candidate items")("must", {
      wait: "short",
    });

    target.click();
  }
}