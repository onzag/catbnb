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
import { getToday, parseDate } from "@onzag/itemize/util";
import SetVar from "@onzag/itemize/client/components/util/SetVar";
import ReadVar from "@onzag/itemize/client/components/util/ReadVar";
import SearchLoader from "@onzag/itemize/client/components/search/SearchLoader";
import LocationStateReader from "@onzag/itemize/client/components/navigation/LocationStateReader";

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
                    return <Entry id="check_out" rendererArgs={{ shouldDisableDate }} prefillWith={state.checkOut}/>
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
