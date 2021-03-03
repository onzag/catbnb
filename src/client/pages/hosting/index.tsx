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
import { List, ListItemText, IconButton, ListItem, Badge, createStyles, withStyles, WithStyles, EditIcon, DoneOutlineIcon, Typography } from "@onzag/itemize/client/fast-prototyping/mui-core";
import Link from "@onzag/itemize/client/components/navigation/Link";
import AddIcon from "@material-ui/icons/Add";
import { SubmitButton } from "@onzag/itemize/client/fast-prototyping/components/buttons";
import SubmitActioner from "@onzag/itemize/client/components/item/SubmitActioner";
import Snackbar from "@onzag/itemize/client/fast-prototyping/components/snackbar";
import Reader from "@onzag/itemize/client/components/property/Reader";
import SearchLoader from "@onzag/itemize/client/components/search/SearchLoader";
import { Avatar } from "../../components/avatar";

interface IApproveDenyRequestProps {
  match: {
    params: {
      id: string;
      rid: string;
    };
  };
}

export function ApproveDenyRequest(props: IApproveDenyRequestProps) {
  const unitId = props.match.params.id;
  const requestId = props.match.params.rid;

  return (
    <ItemProvider
      itemDefinition="unit"
      forId={unitId}
      properties={[
        "title",
        "image",
        "unit_type",
      ]}
    >
      <View id="unit_type" />
      <View id="title" />
      <View id="image" />

      <hr />

      <ItemProvider
        itemDefinition="request"
        forId={requestId}
        properties={[
          "message",
          "check_in",
          "check_out",
          "status",
        ]}
      >
        <Reader id="created_by">
          {(createdBy: string) => (
            <ModuleProvider
              module="users"
            >
              <ItemProvider
                itemDefinition="user"
                properties={[
                  "username",
                  "profile_picture",
                  "app_country",
                  "role",
                ]}
                forId={createdBy}
                disableExternalChecks={true}
              >
                <Avatar size="large" hideFlag={true} fullWidth={true} />
                <View id="username" />
              </ItemProvider>
            </ModuleProvider>
          )}
        </Reader>

        <View id="message" />
        <View id="check_in" />
        <View id="check_out" />     
        <View id="status" />

        <Reader id="status">
          {(status: string) => {
            if (status === "WAIT") {
              return (
                <>
                  <hr />
                  <SubmitButton
                    i18nId="approve"
                    options={{
                      properties: [
                        "status",
                      ],
                      unpokeAfterSuccess: true,
                      propertyOverrides: [{
                        id: "status",
                        value: "APPROVED",
                      }],
                    }}
                    buttonVariant="contained"
                    buttonColor="primary"
                    buttonStartIcon={<DoneOutlineIcon />}
                  />
                  <SubmitButton
                    i18nId="deny"
                    options={{
                      properties: [
                        "status",
                      ],
                      unpokeAfterSuccess: true,
                      propertyOverrides: [{
                        id: "status",
                        value: "DENIED",
                      }],
                    }}
                    buttonVariant="contained"
                    buttonColor="secondary"
                    buttonStartIcon={<DoneOutlineIcon />}
                  />
                </>
              );
            }
            return null;
          }}
        </Reader>

        <SubmitActioner>
          {(actioner) => (
            <>
              <Snackbar
                id="request-update-error"
                severity="error"
                i18nDisplay={actioner.submitError}
                open={!!actioner.submitError}
                onClose={actioner.dismissError}
              />
              <Snackbar
                id="request-update-success"
                severity="success"
                i18nDisplay="change_success"
                open={actioner.submitted}
                onClose={actioner.dismissSubmitted}
              />
            </>
          )}
        </SubmitActioner>
      </ItemProvider>
    </ItemProvider>
  );
}

/**
 * Some styles for the list of units
 */
const viewHostingStyles = createStyles({
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

interface IViewHostingProps extends WithStyles<typeof viewHostingStyles> {
  match: {
    params: {
      id: string;
    };
  };
}

export const ViewHosting = withStyles(viewHostingStyles)((props: IViewHostingProps) => {
  const idToView = props.match.params.id || null;

  return (
    <ItemProvider
      itemDefinition="unit"
      forId={idToView}
      longTermCaching={true}
      markForDestructionOnLogout={true}
      properties={[
        "title",
        "image",
        "unit_type",
        "booked",
        "booked_until",
        "booked_by",
      ]}
    >
      <Link to={`/hosting/edit/${idToView}`}>
        <IconButton>
          <EditIcon />
        </IconButton>
      </Link>

      <View id="unit_type" />
      <View id="title" />
      <View id="image" cacheFiles={true} />

      <Reader id="booked">
        {(booked: boolean) => {
          if (!booked) {
            return null;
          }

          return (
            <Typography variant="body1" color="textSecondary">
              <I18nRead
                id="booked"
                args={[
                  <View id="booked_by" />,
                  <View id="booked_until" />
                ]}
              />
            </Typography>
          );
        }}
      </Reader>

      <hr />

      <ItemProvider
        itemDefinition="request"
        searchCounterpart={true}
        properties={[
          "status"
        ]}
        automaticSearchInstant={true}
        automaticSearch={{
          // on a traditional search by default the max amount
          // of records you can pull is limited to 50, this can
          // be changed but 50 will do right now
          limit: 50,
          offset: 0,
          requestedProperties: [
            "check_in",
            "check_out",
          ],
          searchByProperties: [
            "status",
          ],
          parentedBy: {
            id: props.match.params.id,
            version: null,
            item: "hosting/unit"
          },
          // we are performing a traditional search,
          // normally when itemize does a search it request
          // a list of records and then requests each page
          // one by one, this is good if you wish to only download
          // what is necessary while keeping the search state to that
          // point in time, however we will display all the results
          // so we need all the data, in this case, it will be cheaper
          // to use a traditional search
          traditional: true,

          // we will aso just for demonstration use a by parent listen policy
          // which means that the search will be realtime as well, a traditional
          // by parent search is expensive, and normally you wouldn't do that, you
          // would want a standard search with a cachePolicy as well; anyway a by parent listen policy will update
          // via the parent context, every time the parent gets added, deleted or modified a child
          // the search considers itself obsolete, because it is a traditional search
          // it has no other way to update other than by calling the server again
          // if we had a cache policy it would actually figure out the difference and only
          // request the new records, but we will study that on the optimization/offline sections
          listenPolicy: "by-parent",
        }}
        cleanOnDismount={{
          cleanStateOnAny: true,
        }}
      >
        <Entry id="status" searchVariant="search" />

        <List>
          {/**
         * Note how we use the standard search loader rather than a paged search loader
         * this one is standard and not fast prototyping and it is what the paged loader
         * is built upon, it also uses pages, but it has no pagination element built in
         * because we are anyway displaying the entire thing, we will just use a page the exact
         * size of our limit
         */}
          <SearchLoader
            pageSize={50}
            currentPage={0}

            // we are making the search results be static and do not bind to listen for changes
            // you might wonder how is this compatible with the listen realtime policy well this is because
            // we are telling "individual" results not to update; the search loader keeps results up
            // to date by itself because it listens to changes of the records as we have a listen policy
            // so we should always use TOTAL when we are listening otherwise you are wasting memory cycles
            static="TOTAL"
          >
            {(arg) => (
              arg.searchRecords.map((r) => (
                <ItemProvider {...r.providerProps}>
                  <Link to={`/hosting/view/${idToView}/request/${r.id}`}>
                    <ListItem className={props.classes.listing}>

                      {/**
                     * We will read the creator of this record
                     */}
                      <Reader id="created_by">
                        {(createdBy: string) => (
                          // and now we will render the item
                          <ListItemText
                            className={props.classes.listingText}
                            primary={
                              <ModuleProvider
                                module="users"
                              >
                                <ItemProvider
                                  itemDefinition="user"
                                  properties={[
                                    "username"
                                  ]}
                                  // wait and merge basically means collect as many of these as possible
                                  // and request them all at once, this will prevent having to do a round
                                  // trip per user, as the server is able to process many requests
                                  // at once, it also ensures that if the user is the exact same, then no
                                  // new request will be made and they'll use the same value, wait and merge
                                  // is quite effective to reducing network requests, but it comes at a cost
                                  // 70 ms of delay during collection
                                  waitAndMerge={true}
                                  forId={createdBy}

                                  // the user contains an externally checked property (unique index)
                                  // that is the username, and the item provider tries to determine
                                  // if the state is adequate by default, this will cause a network
                                  // request, that is totally unecessary because we don't care whether
                                  // the username is unique or not, we aren't modifying it
                                  disableExternalChecks={true}
                                >
                                  <View id="username" />
                                </ItemProvider>
                              </ModuleProvider>
                            }
                            secondary={
                              <span>
                                <View id="check_in" /><span>{" - "}</span><View id="check_out" />
                              </span>
                            }
                          />
                        )}
                      </Reader>
                    </ListItem>
                  </Link>
                </ItemProvider>
              ))
            )}
          </SearchLoader>
        </List>
      </ItemProvider>
    </ItemProvider>
  );
});

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
      // we add long term caching here as specified
      // in the section about caching
      longTermCaching={true}
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
        // we added the price
        "price",
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
      {/* We add the entry for the price */}
      <Entry id="price" />

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
            // we add the price in the properties to submit too
            "price",
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
        path="/hosting/view/:id"
        exact={true}
        component={ViewHosting}
      />
      <Route
        path="/hosting/view/:id/request/:rid"
        exact={true}
        component={ApproveDenyRequest}
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
                "pending_requests_count",
              ],
              // we start from offset 0
              offset: 0,
              // and limit our search until 500, which is the maximum itemize allows
              // on non-traditional search (it can be changed)
              limit: 500,
              // we specify that the creator must be us
              createdBy: userData.id,
              // we specify a cache policy
              cachePolicy: "by-owner",
              // our data is sensitive do not keep on the cache
              // when the user logs out
              markForDestructionOnLogout: true,
            }
          }
          // this is the memory management that is defined in itemize itself
          // itemize will cache on memory unless told to release such data
          // this is useful
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
                        <Reader id="pending_requests_count">
                          {(count: number) => (
                            <Badge color="primary" badgeContent={count || 0}>
                              <Link to={`/hosting/view/${r.id}`}>
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
                                    cacheFiles={true}
                                  />
                                  <ListItemText
                                    className={props.classes.listingText}
                                    primary={<View id="title" />}
                                    secondary={<View id="address" rendererArgs={{ hideMap: true }} />}
                                  />
                                </ListItem>
                              </Link>
                            </Badge>
                          )}
                        </Reader>
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
