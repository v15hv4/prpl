/**
 * PRPL Extension
 *
 * Provides two slash commands:
 * - /redteam <roe.md> - Red team operations (requires rules of engagement file)
 * - /blueteam <directory> - Blue team operations (requires local directory)
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function prplExtension(pi: ExtensionAPI) {
  pi.registerCommand("redteam", {
    description: "Red team operations - requires a rules of engagement file (e.g., roe.md)",
    handler: async (args, ctx) => {
      const roePath = args.trim();

      if (!roePath) {
        ctx.ui.notify("Usage: /redteam <path-to-roe.md>", "error");
        return;
      }

      // Placeholder: future implementation will process the ROE file
      ctx.ui.notify(`Red team initialized with ROE: ${roePath}`, "info");
    },
  });

  pi.registerCommand("blueteam", {
    description: "Blue team operations - requires a local directory to defend",
    handler: async (args, ctx) => {
      const directory = args.trim();

      if (!directory) {
        ctx.ui.notify("Usage: /blueteam <directory>", "error");
        return;
      }

      // Placeholder: future implementation will analyze the directory
      ctx.ui.notify(`Blue team initialized for directory: ${directory}`, "info");
    },
  });
}
