import { toConfig, runExtension, getCurrentPageUid } from "roam-client";
import { createConfigObserver } from "roamjs-components";
import { render } from './AddBountyDialog';

const ID = "daogigs";
const CONFIG = toConfig(ID);
runExtension(ID, () => {
  createConfigObserver({ title: CONFIG, config: { tabs: [] } });

  window.roamAlphaAPI.ui.commandPalette.addCommand({
    label: 'Add DAO Bounty',
    callback: () => {
      const pageUid = getCurrentPageUid();
      render({pageUid});
    }
  })
});
