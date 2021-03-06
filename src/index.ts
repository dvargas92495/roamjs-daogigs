import {
  toConfig,
  runExtension,
  getCurrentPageUid,
  createButtonObserver,
  getUidsFromButton,
  getTextByBlockUid,
} from "roam-client";
import { createConfigObserver, renderToast } from "roamjs-components";
import { render } from "./AddBountyDialog";
import { render as fundRender } from "./FundBountyDialog";
import Web3 from "web3";
import { Intent } from "@blueprintjs/core";

declare global {
  interface Window {
    ethereum: ConstructorParameters<typeof Web3>[0] & {
      enable: () => Promise<void>;
    };
    web3: Web3;
  }
}

const loadWeb3 = () => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    return window.ethereum.enable();
  } else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
  } else {
    renderToast({
      id: "daogigs-eth-warning",
      content:
        "Non-Ethereum browser detected. You should consider trying MetaMask!",
      intent: Intent.WARNING,
    });
  }
};

const ID = "daogigs";
const CONFIG = toConfig(ID);
runExtension(ID, () => {
  createConfigObserver({
    title: CONFIG,
    config: {
      tabs: [
        {
          id: "home",
          fields: [
            {
              title: "tokens",
              type: "multitext",
              description: "The list of ERC20",
              defaultValue: ["ETHER"],
            },
          ],
        },
      ],
    },
  });

  loadWeb3().then(() => {
    window.roamAlphaAPI.ui.commandPalette.addCommand({
      label: "Add DAO Bounty",
      callback: () => {
        const pageUid = getCurrentPageUid();
        render({ pageUid });
      },
    });
  });

  createButtonObserver({
    attribute: "fund-bounty",
    render: fundRender,
  });

  createButtonObserver({
    attribute: "claim-bounty",
    render: (b) => {
      const { blockUid } = getUidsFromButton(b);
      const text = getTextByBlockUid(blockUid);
      const address = text.split(":")[1];
      if (address) {

      } else {

      }
    },
  });
});
