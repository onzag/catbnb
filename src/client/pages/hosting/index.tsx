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

/**
 * This is our main hosting function that defines
 * the entry point
 */
export function Hosting() {
  return (
    <ModuleProvider module="hosting">
      {/* this part reads the name from the module hosting as it is in the properties file */}
      <I18nRead id="name" capitalize={true}>
        {(i18nCMS: string) => {
          return (
            <TitleSetter>
              {i18nCMS}
            </TitleSetter>
          );
        }}
      </I18nRead>
      {/* now we define a route for the unit list */}
      <Route
        path="/hosting"
        exact={true}
        component={UnitList}
      />
      <Route
        path="/hosting/new"
        exact={true}
        component={NewEditHosting}
      />
      <Route
        path="/hosting/edit/:id"
        exact={true}
        component={NewEditHosting}
      />
    </ModuleProvider>
  );
}

/**
 * Some styles for the list of units
 */
const unitListStyles = createStyles({
  image: {
    width: "30%",
    display: "inline-block",
  },
  listingText: {
    padding: "0 1rem",
  },
  listing: {
    "transition": "background-color 0.3s",
    "cursor": "pointer",
    "&:hover": {
      backgroundColor: "#eee",
    },
  },
  paginator: {
    paddingTop: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

/**
 * This will be displayed when we are in /hosting main route
 */
const UnitList = withStyles(unitListStyles)((props: WithStyles<typeof unitListStyles>) => {
  // first we need to get the user data to find the current user that we
  // are
  return (
    <UserDataRetriever>
      {(userData) => (
        // Now we need an item provider to provide for our units
        <ItemProvider
          itemDefinition="unit"
          searchCounterpart={true}
          // this is very important, we need a state for the title property
          // otherwise if a state is not provided, our entry will not work
          // holding a state is expensive for itemize, so keep it effective
          properties={
            [
              "title",
            ]
          }
          automaticSearch={
            {
              // we search by title, as we allow that as user input
              searchByProperties: [
                "title",
              ],
              // we request, title, address, and image
              requestedProperties: [
                "title",
                "address",
                "image",
              ],
              // we start from offset 0
              offset: 0,
              // and limit our search until 500, which is the maximum itemize allows
              // on non-traditional search (it can be changed)
              limit: 500,
              // we specify that the creator must be us
              createdBy: userData.id,
              // and we want the search results to be stored
              // in the navigation itself, when the search is done
              // the results will be stored and as such we will be able to go
              // back and forth, this is often recommended, this id is just
              // a random unique id for the navigation
              storeResultsInNavigation: "unit-search",
            }
          }
          // now we tell here what to load, we will use the same id
          // as before, the item will avoid search if it finds that a search
          // result already exists in navigation, and will load from there
          // note that searches are entire stateful values and will
          // affect even the values of entries, so our text field id="title"
          // will be affected to reflect the search
          loadSearchFromNavigation="unit-search"
          // this is the memory management that is defined in itemize itself
          // itemize will cache on memory unless told to release such data
          // this is useful, for example, for some forms, that you might just
          // want to keep on the same value forever, but in this case, we want to wipe
          // anyway search results will be stored in navigation history
          cleanOnDismount={{
            cleanSearchResultsOnAny: true,
          }}
        >
          <Link to="/hosting/new">
            <IconButton>
              <AddIcon />
            </IconButton>
          </Link>
          {/* This little entry here will allows us to filter by title, you might notice
          there's no state handling, it's uncessary, itemize will handle the state
          and event listeners for you */}
          <Entry id="title" searchVariant="search" />
          <List>
            {/* Now we need to load the search results, this is a fast prototyping component
            that loads the search results and adds a pagination element, you should be able
            to use a standard search loader otherwise, all of them are paged, but you can put
            a rather large search size, keep in mind that the search loader when the search
            was made in a non traditional way needs to fetch from the server again per page
            you load, in offline mode, if caching is enabled it will use indexed db */}
            <SearchLoaderWithPagination id="unit-search-loader" pageSize={12}>
              {(arg, pagination, noResults) => (
                <>
                  {
                    arg.searchRecords.map((r) => (
                      <ItemProvider {...r.providerProps}>
                        <Link to={`/hosting/edit/${r.id}`}>
                          <ListItem className={props.classes.listing}>
                            <View
                              id="image"
                              rendererArgs={
                                {
                                  // we do not want to link images with with <a> tags like
                                  // the active renderer does by default
                                  disableImageLinking: true,
                                  // we want the image size to load by 30 viewport width
                                  // this is used to choose what image resolution to load
                                  // so they load faster, we want tiny images
                                  imageSizes: "30vw",
                                  imageClassName: props.classes.image,
                                }
                              }
                            />
                            <ListItemText
                              className={props.classes.listingText}
                              primary={<View id="title" />}
                              secondary={<View id="address" rendererArgs={{ hideMap: true }} />}
                            />
                          </ListItem>
                        </Link>
                      </ItemProvider>
                    ))
                  }
                  <div className={props.classes.paginator}>
                    {pagination}
                  </div>
                </>
              )}
            </SearchLoaderWithPagination>
          </List>
        </ItemProvider>
      )}
    </UserDataRetriever>
  );
});
