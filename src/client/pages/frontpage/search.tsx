import React from "react";

import { ModuleProvider } from "@onzag/itemize/client/providers/module";
import { ItemProvider } from "@onzag/itemize/client/providers/item";
import Entry from "@onzag/itemize/client/components/property/Entry";

import { ListItem, ListItemText, withStyles, WithStyles } from "@onzag/itemize/client/fast-prototyping/mui-core";
import { SearchButton } from "@onzag/itemize/client/fast-prototyping/components/buttons";
import { SearchLoaderWithPagination } from "@onzag/itemize/client/fast-prototyping/components/search-loader-with-pagination";
import Link from "@onzag/itemize/client/components/navigation/Link";
import View from "@onzag/itemize/client/components/property/View";
import Reader from "@onzag/itemize/client/components/property/Reader";

/**
 * The search style
 */
const searchStyle = {
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
  container: {
    width: "100%",
  },
};

/**
 * The search component will allow us to perform searches to the place we want to travel to
 */
export const Search = withStyles(searchStyle)((props: WithStyles<typeof searchStyle>) => {
  return (
    <ModuleProvider module="hosting">
      <ItemProvider
        itemDefinition="unit"
        loadSearchFromNavigation="frontpage-search"
        searchCounterpart={true}
        properties={[
          "address",
          "unit_type",
          // we need to ensure to give these properties
          // a state
          "planned_check_in",
          "planned_check_out",

          "price",
        ]}
        cleanOnDismount={{
          cleanSearchResultsOnAny: true,
        }}
      >
        {/**
         * This is what we are adding regarding our search specific properties
         */}
        <Entry id="planned_check_in" />
        <Entry id="planned_check_out" />
        <Entry id="address" searchVariant="location" />
        <Entry id="address" searchVariant="radius" />
        <Entry id="unit_type" searchVariant="search" />
        <Entry id="price" searchVariant="from"/>
        <Entry id="price" searchVariant="to"/>

        <SearchButton
          buttonVariant="contained"
          buttonColor="primary"
          i18nId="search"
          options={{
            limit: 200,
            offset: 0,
            requestedProperties: [
              "title",
              "address",
              "image",
              "price",
            ],
            searchByProperties: [
              "address",
              "unit_type",
              // and we need to be sure to search by them
              // so they are pushed into the search
              "planned_check_in",
              "planned_check_out",

              "price",
            ],
            orderBy: {
              address: {
                direction: "asc",
                priority: 0,
                nulls: "last",
              },
            },
            storeResultsInNavigation: "frontpage-search",
          }}
        />

        <Reader id="planned_check_in">
          {(checkIn: string) => (
            <Reader id="planned_check_out">
              {(checkOut: string) => (
                <div className={props.classes.container}>
                  <SearchLoaderWithPagination id="search-loader" pageSize={12}>
                    {(arg, pagination, noResults) => (
                      <>
                        {
                          arg.searchRecords.map((r) => (
                            <ItemProvider {...r.providerProps}>
                              <Link to={
                                // we are changing the way the link works
                                checkIn && checkOut ?
                                  `/reserve/${r.id}?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}` :
                                  `/reserve/${r.id}`
                              }>
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
                                    primary={<>
                                      <View id="price" />
                                      {" "}
                                      <View id="title" />
                                    </>}
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
                </div>
              )}
            </Reader>
          )}
        </Reader>

      </ItemProvider>
    </ModuleProvider>
  );
});
