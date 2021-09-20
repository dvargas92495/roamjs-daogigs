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
import React, { useEffect, useState } from "react";
import {
  createBlock,
  getChildrenLengthByPageUid,
  getCurrentUserUid,
  getDisplayNameByUid,
} from "roam-client";
import { createOverlayRender } from "roamjs-components";
import BountyFactory from "./abis/BountyFactory.json";
import Bounty from "./abis/Bounty.json";
import { AbiItem } from "web3-utils";
import { TransactionReceipt } from "web3-core";
import { ContractSendMethod } from "web3-eth-contract";

type Props = { pageUid: string };

const AddBountyDialog = ({
  pageUid,
  onClose,
}: Props & { onClose: () => void }) => {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [compensation, setCompensation] = useState(0);
  const [account, setAccount] = useState<string>();
  const [networkId, setNetworkId] = useState<number>();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    Promise.all([
      window.web3.eth.getAccounts(),
      window.web3.eth.net.getId(),
    ]).then(([accts, networkId]) => {
      setAccount(accts[0]);
      setNetworkId(networkId);
    });
  }, [setAccount, setNetworkId]);
  const onSubmit = () => {
    setLoading(true);
    const networkData = (
      BountyFactory.networks as Record<string, { address: string }>
    )[networkId.toString()];
    const factory = new window.web3.eth.Contract(
      BountyFactory.abi as AbiItem[],
      networkData.address
    );
    return new Promise((resolve) =>
      (factory.methods.deploy() as ContractSendMethod)
        .send({
          from: account,
          value: window.web3.utils.toWei(compensation.toString(), "ether"),
        })
        .once("receipt", (receipt: TransactionReceipt) =>
          resolve(
            (
              factory.methods.bounties(
                receipt.events.BountyDeployed.returnValues.id
              ) as ContractSendMethod
            ).call()
          )
        )
    )
      .then(async (address: string) => {
        const bounty = new window.web3.eth.Contract(
          Bounty.abi as AbiItem[],
          address
        );
        const order = getChildrenLengthByPageUid(pageUid);
        const sourceAmount = await (
          bounty.methods.sources(account) as ContractSendMethod
        )
          .call()
          .then((a: string) => window.web3.utils.fromWei(a, "ether"));
        createBlock({
          node: {
            text: `Bounty Board:: [[${title}]]`,
            children: [
              { text: `Description:: ${description}` },
              { text: `Compensation:: ${sourceAmount} ETHER` },
              {
                text: `Bounty manager(s):: ${getDisplayNameByUid(
                  getCurrentUserUid()
                )}`,
              },
              {
                text: `Bounty hunter(s):: {{CLAIM BOUNTY:${address}}}`,
              },
              {
                text: `Bounty sources:: {{FUND BOUNTY:${address}}}`,
                children: [
                  {
                    text: account,
                    children: [{ text: `${sourceAmount} ETHER` }],
                  },
                ],
              },
            ],
          },
          parentUid: pageUid,
          order,
        });
        setTimeout(onClose, 100);
      })
      .catch(() => {
        setLoading(false);
      });
  };
  return (
    <Dialog
      title={"Add DAO Bounty"}
      onClose={onClose}
      isOpen={true}
      canEscapeKeyClose
      canOutsideClickClose
    >
      <div
        className={Classes.DIALOG_BODY}
        tabIndex={-1}
        onKeyDown={(e) => step === 3 && e.key === "Enter" && onSubmit()}
      >
        {step === 0 && (
          <Label>
            Enter the title of the bounty
            <InputGroup
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && setStep(step + 1)}
            />
          </Label>
        )}
        {step === 1 && (
          <Label>
            Enter the description
            <InputGroup
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && setStep(step + 1)}
            />
          </Label>
        )}
        {step === 2 && (
          <Label>
            Enter compensation
            <NumericInput
              value={compensation}
              onValueChange={(v) => setCompensation(v)}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && setStep(step + 1)}
              minorStepSize={0.001}
              stepSize={0.01}
            />
          </Label>
        )}
        {step === 3 && (
          <div>
            <h4>Bounty Summary</h4>
            <p>
              <b>Title: </b>
              {title}
            </p>
            <p>
              <b>Description: </b>
              {description}
            </p>
            <p>
              <b>Compensation: </b>
              {compensation}
            </p>
          </div>
        )}
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          {loading && <Spinner size={SpinnerSize.SMALL} />}
          <div style={{ margin: "0 4px" }} />
          <Button text={"Cancel"} onClick={onClose} intent={Intent.NONE} />
          {step === 3 ? (
            <Button
              text={"Create"}
              intent={Intent.SUCCESS}
              autoFocus
              onClick={onSubmit}
            />
          ) : (
            <Button
              text={"Next"}
              intent={Intent.PRIMARY}
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 0 && !title) ||
                (step === 1 && !description) ||
                (step === 2 && compensation <= 0)
              }
            />
          )}
        </div>
      </div>
    </Dialog>
  );
};

export const render = createOverlayRender("add-bounty", AddBountyDialog);

export default AddBountyDialog;
