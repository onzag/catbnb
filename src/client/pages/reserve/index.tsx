import React from "react";

import { ModuleProvider } from "@onzag/itemize/client/providers/module";
import { IActionResponseWithId, ItemProvider } from "@onzag/itemize/client/providers/item";
import TitleSetter from "@onzag/itemize/client/components/util/TitleSetter";
import Entry from "@onzag/itemize/client/components/property/Entry";
import View from "@onzag/itemize/client/components/property/View";
import { Typography } from "@onzag/itemize/client/fast-prototyping/mui-core";
import { SubmitButton } from "@onzag/itemize/client/fast-prototyping/components/buttons";
import SubmitActioner from "@onzag/itemize/client/components/item/SubmitActioner";
import Snackbar from "@onzag/itemize/client/fast-prototyping/components/snackbar";
import Reader from "@onzag/itemize/client/components/property/Reader";

interface IReserveHostingProps {
  match: {
    params: {
      id: string;
    };
  };
}

/**
 * Page to add or edit a hosting unit
 */
export function ReserveHosting(props: IReserveHostingProps) {
  const idToReserve = props.match.params.id || null;
  const newRequestRedirectCallback = (data: IActionResponseWithId) => `/reserve/${idToReserve}/request/${data.id}`;
  return (
    <ModuleProvider module="hosting">
      <ItemProvider
        itemDefinition="unit"
        // we are adding the id here that we plan to load
        // the null slot is the same as not specified
        forId={idToReserve}
        // these are the properties that
        // we have a state for
        properties={[
          "title",
          "description",
          "attachments",
          "image",
          "address",
          "unit_type",
        ]}
      >
        {/* we will use the title property and read it raw and use such
        property value as the title value for the window */}
        <Reader id="title">
          {(title: string) => (
            <TitleSetter>
              {title}
            </TitleSetter>
          )}
        </Reader>
        <Typography variant="caption">
          <View id="unit_type" />
        </Typography>
        <Typography variant="h2">
          <View id="title" />
        </Typography>
        <View id="description" />
        <View id="image" />
        <View id="address" />
      </ItemProvider>

      <hr />

      <ItemProvider
        itemDefinition="request"
        properties={[
          "message",
          "check_in",
          "check_out",
        ]}
      >
        <Entry id="message" />
        <Entry id="check_in" />
        <Entry id="check_out" />

        <SubmitButton
          i18nId="request"
          buttonColor="primary"
          buttonVariant="contained"
          options={{
            properties: [
              "message",
              "check_in",
              "check_out",
            ],
            restoreStateOnSuccess: true,
            parentedBy: {
              module: "hosting",
              itemDefinition: "unit",
              id: idToReserve,
            }
          }}
          redirectOnSuccess={newRequestRedirectCallback}
          redirectReplace={true}
        />

        <SubmitActioner>
          {(actioner) => (
            <Snackbar
              id="request-error"
              severity="error"
              i18nDisplay={actioner.submitError}
              open={!!actioner.submitError}
              onClose={actioner.dismissError}
            />
          )}
        </SubmitActioner>
      </ItemProvider>
    </ModuleProvider>
  );
}
