import {
  Button,
  Classes,
  Dialog,
  InputGroup,
  Intent,
  Label,
  NumericInput,
  Spinner,
  SpinnerSize,
} from "@blueprintjs/core";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  createBlock,
  getChildrenLengthByPageUid,
  getCurrentUserUid,
  getDisplayNameByUid,
  getTextByBlockUid,
  getUidsFromButton,
} from "roam-client";
import {
  createComponentRender,
  createOverlayRender,
  setInputSetting,
} from "roamjs-components";
import BountyFactory from "./abis/BountyFactory.json";
import Bounty from "./abis/Bounty.json";
import { AbiItem } from "web3-utils";
import { TransactionReceipt } from "web3-core";
import { ContractSendMethod } from "web3-eth-contract";
import ReactDOM from "react-dom";

const FundBountyDialog = ({ blockUid }: { blockUid: string }) => {
  const address = useMemo(() => {
    const text = getTextByBlockUid(blockUid);
    return /{{fund bounty:(0x[a-fA-f0-9]+)}}/i.exec(text)?.[1];
  }, [blockUid]);
  const [compensation, setCompensation] = useState(0);
  const [account, setAccount] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = useCallback(() => setIsOpen(true), [setIsOpen]);
  const onClose = useCallback(() => setIsOpen(false), [setIsOpen]);
  useEffect(() => {
    window.web3.eth.getAccounts().then((accts) => {
      setAccount(accts[0]);
    });
  }, [setAccount]);
  const onSubmit = () => {
    setLoading(true);
    const bounty = new window.web3.eth.Contract(
      Bounty.abi as AbiItem[],
      address
    );
    return new Promise((resolve) =>
      (bounty.methods.fund() as ContractSendMethod)
        .send({
          from: account,
          value: window.web3.utils.toWei(compensation.toString(), "ether"),
        })
        .once("receipt", () =>
          resolve(
            (bounty.methods.sources(account) as ContractSendMethod).call()
          )
        )
    )
      .then((a: string) => window.web3.utils.fromWei(a, "ether"))
      .then((amount) => {
        setInputSetting({
          key: account,
          value: `${amount} ETHER`,
          blockUid,
          index: getChildrenLengthByPageUid(blockUid),
        });
        onClose();
      })
      .catch((e) => setError(e.message));
  };
  return (
    <>
      <Button text={"Fund Bounty"} intent={Intent.SUCCESS} onClick={onOpen} />
      <Dialog
        title={"Add DAO Bounty"}
        onClose={onClose}
        isOpen={isOpen}
        canEscapeKeyClose
        canOutsideClickClose
      >
        <div className={Classes.DIALOG_BODY}>
          <Label>
            Enter compensation
            <NumericInput
              value={compensation}
              onValueChange={(v) => setCompensation(v)}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
              minorStepSize={0.001}
              stepSize={0.01}
            />
          </Label>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            {error && <span style={{ color: "darkred" }}>{error}</span>}
            {loading && <Spinner size={SpinnerSize.SMALL} />}
            <div style={{ margin: "0 4px" }} />
            <Button text={"Cancel"} onClick={onClose} intent={Intent.NONE} />
            <Button text={"Fund"} intent={Intent.SUCCESS} onClick={onSubmit} />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export const render = (b: HTMLButtonElement) => {
  const { blockUid } = getUidsFromButton(b);
  ReactDOM.render(<FundBountyDialog blockUid={blockUid} />, b.parentElement);
};

export default FundBountyDialog;
