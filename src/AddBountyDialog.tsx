import {
  Button,
  Classes,
  Dialog,
  InputGroup,
  Intent,
  Label,
  NumericInput,
} from "@blueprintjs/core";
import { isOpen } from "@blueprintjs/core/lib/esm/components/context-menu/contextMenu";
import React, { useState } from "react";
import {
  createBlock,
  getChildrenLengthByPageUid,
  getCurrentPageUid,
  getCurrentUserUid,
  getDisplayNameByUid,
} from "roam-client";
import { createOverlayRender, useSubTree } from "roamjs-components";

type Props = { pageUid: string };

const AddBountyDialog = ({
  pageUid,
  onClose,
}: Props & { onClose: () => void }) => {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [compensation, setCompensation] = useState(0);
  return (
    <Dialog
      title={"Add DAO Bounty"}
      onClose={onClose}
      isOpen={true}
      canEscapeKeyClose
      canOutsideClickClose
    >
      <div className={Classes.DIALOG_BODY}>
        {step === 0 && (
          <Label>
            Enter the title of the bounty
            <InputGroup
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && setStep(step + 1)}
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
              onKeyDown={(e) => e.key === 'Enter' && setStep(step + 1)}
            />
          </Label>
        )}
        {step === 2 && (
          <Label>
            Connect your wallet and enter compensation
            <NumericInput
              value={compensation}
              onValueChange={(v) => setCompensation(v)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && setStep(step + 1)}
            />
          </Label>
        )}
        {step === 3 && (
          <>
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
          </>
        )}
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button text={"Cancel"} onClick={onClose} intent={Intent.NONE} />
          {step === 3 ? (
            <Button
              text={"Create"}
              intent={Intent.SUCCESS}
              onClick={() => {
                const order = getChildrenLengthByPageUid(pageUid);
                createBlock({
                  node: {
                    text: `Bounty Board:: [[${title}]]`,
                    children: [
                      { text: `Description:: ${description}` },
                      { text: `Compensation:: ${compensation} $CABIN` },
                      {
                        text: `Bounty manager(s):: ${getDisplayNameByUid(
                          getCurrentUserUid()
                        )}`,
                      },
                      { text: `Bounty hunter(s):: {{CLAIM BOUNTY}}` },
                      {
                        text: `Bounty source:: Should output address source here`,
                      },
                    ],
                  },
                  parentUid: pageUid,
                  order,
                });
                setTimeout(onClose, 100);
              }}
            />
          ) : (
            <Button
              text={"Next"}
              intent={Intent.PRIMARY}
              onClick={() => setStep(step + 1)}
            />
          )}
        </div>
      </div>
    </Dialog>
  );
};

export const render = createOverlayRender("add-bounty", AddBountyDialog);

export default AddBountyDialog;
