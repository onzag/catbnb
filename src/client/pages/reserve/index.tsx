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
import { createUnitValue, getToday, parseDate } from "@onzag/itemize/util";
import SetVar from "@onzag/itemize/client/components/util/SetVar";
import ReadVar from "@onzag/itemize/client/components/util/ReadVar";
import SearchLoader from "@onzag/itemize/client/components/search/SearchLoader";
import LocationStateReader from "@onzag/itemize/client/components/navigation/LocationStateReader";
import { TemplateArgs, MutatingTemplateArgs, MutatingFunctionArg } from "@onzag/itemize/client/internal/text/serializer/template-args";
import { button } from "../../components/ui-handlers";
import AppLanguageRetriever from "@onzag/itemize/client/components/localization/AppLanguageRetriever";
import I18nRead from "@onzag/itemize/client/components/localization/I18nRead";
import SearchActioner from "@onzag/itemize/client/components/search/SearchActioner";
import Link from "@onzag/itemize/client/components/navigation/Link";

/**
 * These are our search arguments
 */
const searchArgs = {
  limit: 50,
  offset: 0,
  requestedProperties: [
    "address",
    "title",
    "unit_type",
    "price",
    "image",
  ],
  searchByProperties: [
    "address",
    "unit_type",
    "planned_check_in",
    "planned_check_out",
    "price",
  ],
  traditional: true,
  storeResultsInNavigation: "search-results",
};

/**
 * This is the wrapper that will wrap the entire template mechanism
 * all our template html will be under this
 */
const templateContextWrapper = (children: React.ReactNode) => {
  return (
    <ModuleProvider module="hosting">
      <ItemProvider
        itemDefinition="unit"
        searchCounterpart={true}
        properties={[
          "address",
          "unit_type",
          "planned_check_in",
          "planned_check_out",
          "price",
        ]}
        setters={[
          {
            id: "address",
            searchVariant: "radius",
            value: createUnitValue(50, "km", "km"),
          }
        ]}

        // we will automatically search when hitting this page
        // but only the first time
        automaticSearch={searchArgs}
        automaticSearchIsOnlyInitial={true}
        loadSearchFromNavigation="search-results"
      >
        {children}
      </ItemProvider>
    </ModuleProvider>
  );
}

/**
 * These are the template args for our search result, a single
 * one, each one of them in the loop, yes they are all the same
 * because they are contextual, so they don't need to be recalculated in the context
 */
const searchResultTemplateArgs = new TemplateArgs({
  address: <View id="address" rendererArgs={{ hideMap: true }} />,
  title: <View id="title" />,
  unit_type: <View id="unit_type" />,
  unit_price: <View id="price" />,
  image: <View id="image" rendererArgs={{ imageClassName: "element-view", disableImageLinking: true }} />,

  // this is an uncommon way to handle a function but also possible
  // instead of passing a function we pass null and handle it ourselves as a link
  // component
  go_to_view_listing: new MutatingFunctionArg((children) => {
    // we can even handle events differently if we fancy
    // we are not even passing a function we just wrap the component
    // in a link
    return (
      <Reader id="id">
        {(id: string) => (
          <Link to={`/reserve/${id}`}>
            {children(null)}
          </Link>
        )}
      </Reader>
    );
  })
});

/**
 * These are our root template args for the search where we define our entries
 * that were specified by the designer and how they are assigned as html content
 */
const templateArgs = new TemplateArgs({
  check_in_date_entry: <Entry id="planned_check_in" />,
  check_out_date_entry: <Entry id="planned_check_out" />,
  location_entry: <Entry id="address" searchVariant="location" rendererArgs={{ disableMapAndSearch: true }} />,
  search_radius_entry: <Entry id="address" searchVariant="radius" />,
  unit_type_entry: <Entry id="unit_type" searchVariant="search" />,
  min_price_entry: <Entry id="price" searchVariant="from" />,
  max_price_entry: <Entry id="price" searchVariant="to" />,
  // this is our good old ui handler
  button,

  // and this is special this is the perform search function, now as you know
  // we need to use the SearchActioner in order to trigger a search within a
  // item context, so we create a mutating function arg where we can grab
  // this context and pass the function to the children they will recognize that
  // the function is about that
  perform_search: new MutatingFunctionArg((children) => {
    return (
      <SearchActioner>
        {(actioner) => {
          const fn = () => actioner.search(searchArgs);
          return children(fn);
        }}
      </SearchActioner>
    );
  }),

  // now the search results are also dynamic and they vary and we retrieve
  // them from our search loader, so they are mutating as well, this is a loopable
  // element if you remember, but for what template args consists
  // there's no dinstintion, you must simply return an array and call the children
  // as many times as they are required with the new context that they are in
  search_results: new MutatingTemplateArgs((children) => {
    return (
      <SearchLoader
        currentPage={0}
        pageSize={50}
        cleanOnDismount={true}
      >
        {(loader) => {
          return loader.searchRecords.map((r) => (
            <ItemProvider {...r.providerProps}>
              {children(searchResultTemplateArgs)}
            </ItemProvider>
          ));
        }}
      </SearchLoader>
    );
  })
}).wrappedBy(templateContextWrapper);

export function ReserveHostingSearch() {
  return (
    <>
      <I18nRead id="app_name" capitalize={true}>
        {(i18nAppName: string) => {
          return (
            <TitleSetter>
              {i18nAppName}
            </TitleSetter>
          );
        }}
      </I18nRead>
      <div className="trusted">
        <ModuleProvider module="cms">
          <AppLanguageRetriever>
            {(languageData) => (
              <ItemProvider
                itemDefinition="fragment"
                forId="RESERVE_SEARCH"
                forVersion={languageData.currentLanguage.code}
                loadUnversionedFallback={true}
                longTermCaching={true}
                properties={
                  [
                    "content",
                    "attachments",
                  ]
                }
                static="NO_LISTENING"
              >
                <View id="content" rendererArgs={{ makeTemplate: true, templateArgs }} />
              </ItemProvider>
            )}
          </AppLanguageRetriever>
        </ModuleProvider>
      </div>
    </>
  );
}

interface IReserveHostingProps {
  match: {
    params: {
      id: string;
      rid: string;
    };
  };
}

/**
 * Page to add or edit a hosting unit
 */
export function ReserveHosting(props: IReserveHostingProps) {
  const idToReserve = props.match.params.id || null;
  const reservationId = props.match.params.rid || null;
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
          "price",
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
        <Typography variant="h3">
          <View id="price" />
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
          "status",
        ]}
        forId={reservationId}
      >
        {
          reservationId ?
            <Typography variant="h3">
              <View id="status" />
            </Typography>
            : null
        }

        {
          reservationId ? <View id="message" /> : <Entry id="message" />
        }

        {
          !reservationId ?
            // We are adding this code in order to be able to search
            // for the date ranges that are already reserved for
            <ItemProvider
              itemDefinition="request"
              searchCounterpart={true}
              setters={[
                // We search from the checkout date of everything
                // that check outs since today to the future
                {
                  id: "check_out",
                  searchVariant: "from",
                  value: getToday(),
                },
                // and that of course is approved
                {
                  id: "status",
                  searchVariant: "search",
                  value: "APPROVED",
                },
              ]}
              automaticSearch={{
                // we do an automatic traditional search for 50 results
                // with the given properties
                limit: 50,
                offset: 0,
                traditional: true,
                requestedProperties: [
                  "check_in",
                  "check_out"
                ],
                searchByProperties: [
                  "check_out",
                  "status",
                ],
                parentedBy: {
                  item: "hosting/unit",
                  id: idToReserve,
                },
              }}
            >
              <SearchLoader
                static="TOTAL"
                pageSize={50}
                currentPage={0}
                cleanOnDismount={true}
              >
                {(arg) => {
                  // when we load the search results instead of rendering
                  // them like it would be usual, we are going to take advantage
                  // of the traditional search capability to provide results in
                  // the loader itself, and we grab the data from that and set it
                  // in a variable that will be ported
                  const allCheckInsAndOuts = arg.searchRecords.map((r) => {
                    return {
                      checkIn: r.searchResult.DATA && parseDate((r.searchResult.DATA as any).check_in),
                      checkOut: r.searchResult.DATA && parseDate((r.searchResult.DATA as any).check_out),
                    };
                  });

                  // using set var we are able to transfer a variable to any part of the
                  // document, in this case we transfer the data for the date ranges
                  return <SetVar id="all_check_ins_and_outs" value={allCheckInsAndOuts} />;
                }}
              </SearchLoader>
            </ItemProvider> :
            null
        }

        {
          reservationId ?
            <View id="check_in" /> :
            // and we read it here
            <LocationStateReader
              stateIsInQueryString={true}
              defaultState={{ checkIn: undefined as string }}
            >
              {(state) => (
                <ReadVar id="all_check_ins_and_outs">
                  {(value) => {
                    // so we can build a function to disable the dates
                    const shouldDisableDate = (checkInTheUserWants: moment.Moment) => {
                      return value.some((v: any) => {
                        const checkIn: moment.Moment = v.checkIn;
                        const checkOut: moment.Moment = v.checkOut;

                        return checkInTheUserWants.isSameOrAfter(checkIn) && checkInTheUserWants.isBefore(checkOut);
                      });
                    }

                    // and we pass it as a renderer arg, note that renderer args are specific to the
                    // renderer, itemize default which is the material ui default supports date disabling
                    // so it's a renderer property, that only that renderer supports, if you write your own
                    // custom renderer you might use other args
                    return <Entry id="check_in" rendererArgs={{ shouldDisableDate }} prefillWith={state.checkIn} />
                  }}
                </ReadVar>
              )}
            </LocationStateReader>
        }
        {
          reservationId ?
            <View id="check_out" /> :
            <LocationStateReader
              stateIsInQueryString={true}
              defaultState={{ checkOut: undefined as string }}
            >
              {(state) => (
                <ReadVar id="all_check_ins_and_outs">
                  {(value) => {
                    const shouldDisableDate = (checkOutTheUserWants: moment.Moment) => {
                      return value.some((v: any) => {
                        const checkIn: moment.Moment = v.checkIn;
                        const checkOut: moment.Moment = v.checkOut;

                        return checkOutTheUserWants.isAfter(checkIn) && checkOutTheUserWants.isSameOrBefore(checkOut);
                      });
                    }
                    return <Entry id="check_out" rendererArgs={{ shouldDisableDate }} prefillWith={state.checkOut} />
                  }}
                </ReadVar>
              )}
            </LocationStateReader>
        }

        {
          !reservationId ?
            <>
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
                    item: "hosting/unit",
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
            </> :
            null
        }
      </ItemProvider>
    </ModuleProvider>
  );
}
