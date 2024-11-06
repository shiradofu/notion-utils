import { createCrawlerFn } from "./create";

export class AppCrawler {
  getOverlayContainer = createCrawlerFn(
    () => document.querySelector<HTMLElement>(".notion-overlay-container"),
    "overlay container not found",
  );

  getI18nedTeamspace = createCrawlerFn(
    () =>
      document.querySelector<HTMLElement>(".notion-outliner-team-header")
        ?.textContent,
    "failed to get translated name of 'Teamspace'",
  );

  getCurrentTeamspaceName = createCrawlerFn(
    () =>
      document.querySelector<HTMLElement>("header .notion-record-icon + *")
        ?.textContent,
    "current teamspace name not found",
  );

  getSidebar = createCrawlerFn(
    () => document.querySelector<HTMLLIElement>(".notion-sidebar"),
    "sidebar not found",
  );
}
