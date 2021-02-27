import React from "react";

import { ModuleProvider } from "@onzag/itemize/client/providers/module";
import { ItemProvider } from "@onzag/itemize/client/providers/item";
import TitleSetter from "@onzag/itemize/client/components/util/TitleSetter";
import View from "@onzag/itemize/client/components/property/View";
import { createStyles, List, ListItem, ListItemText, Typography, withStyles, WithStyles } from "@onzag/itemize/client/fast-prototyping/mui-core";
import I18nRead from "@onzag/itemize/client/components/localization/I18nRead";
import UserDataRetriever from "@onzag/itemize/client/components/user/UserDataRetriever";
import { SearchLoaderWithPagination } from "@onzag/itemize/client/fast-prototyping/components/search-loader-with-pagination";
import Reader from "@onzag/itemize/client/components/property/Reader";
import Link from "@onzag/itemize/client/components/navigation/Link";
import Entry from "@onzag/itemize/client/components/property/Entry";

/**
 * Some styles for the list of units
 */
const hostingStyles = createStyles({
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
 * Page for reservations
 */
export const Reservations = withStyles(hostingStyles)((props: WithStyles<typeof hostingStyles>) => {
  return (
    <ModuleProvider module="hosting">
      <UserDataRetriever>
        {(userData) => (
          <ItemProvider
            itemDefinition="request"
            searchCounterpart={true}
            properties={[
              "status"
            ]}

            // we want our automatic search to be instant
            // the reason is that automatic searches when they are
            // refreshing would stack searches and only choose the last
            // one, this is to prevent search fields to send a new search
            // request on every keystroke, but our status is a select
            // not a entry where you type, so instant results are preferred
            // and make the app feel more snappy
            automaticSearchInstant={true}
            automaticSearch={{
              limit: 100,
              offset: 0,
              requestedProperties: [
                "status",
                "check_in",
                "check_out",
              ],
              searchByProperties: [
                "status",
              ],
              createdBy: userData.id,
            }}
            cleanOnDismount={{
              cleanSearchResultsOnAny: true,
            }}
          >
            <I18nRead id="view_reservations">
              {(i18nViewReservations: string) => (
                <TitleSetter>
                  {i18nViewReservations}
                </TitleSetter>
              )}
            </I18nRead>

            <Entry id="status" searchVariant="search"/>

            <List>
              <SearchLoaderWithPagination id="reservation-search-loader" pageSize={12}>
                {(arg, pagination, noResults) => (
                  <>
                    {
                      arg.searchRecords.map((r) => (
                        <ItemProvider {...r.providerProps}>
                          <Reader id="parent_id">
                            {(parentId: string) => (
                              <Link to={`/reserve/${parentId}/request/${r.id}`}>
                                <Typography variant="body1">
                                  <View id="status" />
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  <View id="check_in" />{" "}<View id="check_out" />
                                </Typography>
                                <ListItem className={props.classes.listing}>
                                  <ItemProvider
                                    itemDefinition="unit"
                                    forId={parentId}
                                    properties={[
                                      "image",
                                      "title",
                                      "address",
                                    ]}
                                  >
                                    <View
                                      id="image"
                                      rendererArgs={
                                        {
                                          // we do not want to link images with with <a> tags like
                                          // the active renderer does by default
                                          disableImageLinking: true,
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
                                  </ItemProvider>
                                </ListItem>
                              </Link>
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
    </ModuleProvider >
  );
});
