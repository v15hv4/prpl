import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import registerRedteam from "./extensions/redteam/extension";

export default function prplExtension(pi: ExtensionAPI) {
  registerRedteam(pi);

  pi.registerCommand("blueteam", {
    description: "Blue team operations - requires a local directory to defend",
    handler: async (args, ctx) => {
      const directory = args.trim();
      if (!directory)
        return ctx.ui.notify("Usage: /blueteam <directory>", "error");
      ctx.ui.notify(
        `Blue team initialized for directory: ${directory}`,
        "info",
      );
    },
  });
}
