import React from "react";

import { ModuleProvider } from "@onzag/itemize/client/providers/module";
import { IActionResponseWithId, ItemProvider } from "@onzag/itemize/client/providers/item";
import I18nRead from "@onzag/itemize/client/components/localization/I18nRead";
import TitleSetter from "@onzag/itemize/client/components/util/TitleSetter";
import Route from "@onzag/itemize/client/components/navigation/Route";
import UserDataRetriever from "@onzag/itemize/client/components/user/UserDataRetriever";
import Entry from "@onzag/itemize/client/components/property/Entry";
import { SearchLoaderWithPagination } from "@onzag/itemize/client/fast-prototyping/components/search-loader-with-pagination";
import View from "@onzag/itemize/client/components/property/View";
import { List, ListItemText, IconButton, withStyles, WithStyles, createStyles, ListItem } from "@onzag/itemize/client/fast-prototyping/mui-core";
import Link from "@onzag/itemize/client/components/navigation/Link";
import AddIcon from "@material-ui/icons/Add";
import { SubmitButton } from "@onzag/itemize/client/fast-prototyping/components/buttons";
import SubmitActioner from "@onzag/itemize/client/components/item/SubmitActioner";
import Snackbar from "@onzag/itemize/client/fast-prototyping/components/snackbar";

/**
 * triggers when sucesfully created a new hosting unit
 * @param data a simplified response from the server on data creation
 * @returns a string that represents the redirect
 */
const newHostingRedirectCallback = (data: IActionResponseWithId) => `/hosting/edit/${data.id}`;

interface INewEditHostingProps {
  match: {
    params: {
      id: string;
    };
  };
}

/**
 * Page to add or edit a hosting unit
 */
export function NewEditHosting(props: INewEditHostingProps) {
  const idToEdit = props.match.params.id || null;
  return (
    <ItemProvider
      itemDefinition="unit"
      // we are adding the id here that we plan to load
      // the null slot is the same as not specified
      forId={idToEdit}
      // these are the properties that
      // we have a state for
      properties={[
        "title",
        "description",
        "attachments",
        "image",
        "address",
        "unit_type",
        "booked",
      ]}
      // and we want to set the booked
      // property to false, it is not settable
      // by the user
      setters={[
        {
          id: "booked",
          value: false,
        },
      ]}
    >
      <Entry id="unit_type" />
      <Entry id="title" />
      <Entry id="description" />
      <Entry id="image" />
      <Entry id="address" />

      {/* The submit button is a fast prototyping component
      that implements the standard SubmitActioner component
      under the hood, this button is just a convenience
      button that offers quite some functionality and a nice
      look */}
      <SubmitButton
        i18nId={idToEdit ? "edit" : "submit"}
        buttonColor="primary"
        buttonVariant="contained"
        options={{
          properties: [
            "title",
            "description",
            "attachments",
            "image",
            "address",
            "unit_type",
            "booked",
          ],
          // we will only submit differing properties
          // if we are editing, it makes no sense to
          // resubmit if nothing is to change
          differingOnly: idToEdit ? true : false,
          // wipe everything we have written in here
          // remember that otherwise it will remain in memory
          restoreStateOnSuccess: true,
        }}
        // on success we want to redirect there if we are not editing
        redirectOnSuccess={idToEdit ? null : newHostingRedirectCallback}
        // and replace wherever we redirect
        redirectReplace={true}
      />

      {/* Here we grab the submit actioner that is used by the submit
      button, the reason is that, we need to get some states from it
      that are of course not available by the button */}
      <SubmitActioner>
        {(actioner) => (
          <>
            {/* we simply want to show an error in case our action fails
            and we will use this snackbar, and take the error right
            from the actioner, the i18nDisplay component can display
            errors in a localized form, this snackbar uses that */}
            <Snackbar
              id="unit-create-edit-error"
              severity="error"
              i18nDisplay={actioner.submitError}
              open={!!actioner.submitError}
              onClose={actioner.dismissError}
            />
            {/* when we are editing we want to show a message when we have
            succesfully edited */}
            {idToEdit ? <Snackbar
              id="unit-edit-success"
              severity="success"
              i18nDisplay="edit_success"
              open={actioner.submitted}
              onClose={actioner.dismissSubmitted}
            /> : null}
          </>
        )}
      </SubmitActioner>
    </ItemProvider>
  );
}
