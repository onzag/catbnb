/**
 * This file contains the fragments that are used accross the application
 * to create content fragments in different languages, if you don't need fragments
 * feel free do delete them from the schema and delete this file as well as remove
 * all the references from the cms/index.tsx file
 */

import React from "react";

import { ItemProvider } from "@onzag/itemize/client/providers/item";
import Entry from "@onzag/itemize/client/components/property/Entry";
import LocationStateReader from "@onzag/itemize/client/components/navigation/LocationStateReader";
import SubmitActioner from "@onzag/itemize/client/components/item/SubmitActioner";

import {
  Paper, createStyles, withStyles, WithStyles,
  Container, Box, List, ListItem, ListItemText,
  ExtensionIcon, ListItemIcon,
} from "@onzag/itemize/client/fast-prototyping/mui-core";
import { SubmitButton } from "@onzag/itemize/client/fast-prototyping/components/buttons";
import Snackbar from "@onzag/itemize/client/fast-prototyping/components/snackbar";
import { ITemplateArgsContext, ITemplateArg } from "@onzag/itemize/client/fast-prototyping/components/slate";
import Route from "@onzag/itemize/client/components/navigation/Route";
import Link from "@onzag/itemize/client/components/navigation/Link";
import { LanguagePicker } from "@onzag/itemize/client/fast-prototyping/components/language-picker";
import { ModuleProvider } from "@onzag/itemize/client/providers/module";
import { button, buttonOptions, buttonToolbarPrescence } from "../../components/ui-handlers";
import View from "@onzag/itemize/client/components/property/View";
import { createCurrencyValue, createFakeFileValue, createLocationValue } from "@onzag/itemize/util";

/**
 * This is going to be the search wrapper that wraps
 * our search based fragments
 * @param children 
 */
function searchWrapper(children: React.ReactNode) {
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
      >
        {children}
      </ItemProvider>
    </ModuleProvider>
  );
}

/**
 * These are the basic properties that we will have everywhere
 * in our fragments
 */
const basicFieldsProperties: {[key: string]: ITemplateArg} = {
  check_in_date_entry: {
    label: "Check in date Entry",
    type: "html",
    htmlDisplay: (<Entry id="planned_check_in" />),
    nonRootInheritable: true,
  },
  check_out_date_entry: {
    label: "Check out date Entry",
    type: "html",
    htmlDisplay: (<Entry id="planned_check_out" />),
    nonRootInheritable: true,
  },
  location_entry: {
    label: "Location Entry",
    type: "html",
    htmlDisplay: (<Entry id="address" searchVariant="location" rendererArgs={{disableMapAndSearch: true}}/>),
    nonRootInheritable: true,
  },
  search_radius_entry: {
    label: "Search Radius Entry",
    type: "html",
    htmlDisplay: (<Entry id="address" searchVariant="radius" />),
    nonRootInheritable: true,
  },
  unit_type_entry: {
    label: "Unit Type Entry",
    type: "html",
    htmlDisplay: (<Entry id="unit_type" searchVariant="search" />),
    nonRootInheritable: true,
  },
  min_price_entry: {
    label: "Min Price Entry",
    type: "html",
    htmlDisplay: (<Entry id="price" searchVariant="from"/>),
    nonRootInheritable: true,
  },
  max_price_entry: {
    label: "Max Price Entry",
    type: "html",
    htmlDisplay: (<Entry id="price" searchVariant="to"/>),
    nonRootInheritable: true,
  },
  button: {
    label: "Button",
    type: "ui-handler",
    handler: button,
  },
};

/**
 * This is the frontpage only specific notice how this one
 * has the go to search page function in it
 */
const frontpageProperties: {[key: string]: ITemplateArg} = {
  ...basicFieldsProperties,
  go_to_search_page: {
    label: "Go To Search Page",
    type: "function",
  },
};

/**
 * Now these are for the one where we are searching for a place to reserve
 */
const reserveSearchProperties: {[key: string]: ITemplateArg | ITemplateArgsContext } = {
  ...basicFieldsProperties,
  /**
   * We add the function for the button or whatever to perform the search
   * to actually do such search
   */
  perform_search: {
    label: "Perform Search",
    type: "function",
    nonRootInheritable: true,
  },

  /**
   * And then define this loop for the search results the search results exist within a context
   * that is loopable
   */
  search_results: {
    type: "context",
    label: "Search Results",

    // we make it loopable and emulate 3 items
    loopable: true,
    loopEmulation: 3,

    /**
     * We want to wrap everything that is inside this context and because
     * we are loop wrapping we have index emulation
     * @param n this is basically the node we are wrapping
     * @param emulatedIndex and this is the index we are emulating, we have 3, so [0, 1, 2] will be our indexes
     */
    wrapper: (n, emulatedIndex) => (
      // we are going to change the context of our item provider
      <ItemProvider
        itemDefinition="unit"
        // using a version in order to ensure they hold different states
        forVersion={"rich-test-" + emulatedIndex}
        // we need to use these properties
        properties={[
          "title",
          "image",
          "address",
          "unit_type",
          "price",
        ]}
        cleanOnDismount={true}
        // and we are going to set using emulated values
        // this means that these items will have such values which will allow
        // for variety
        setters={[
          {
            id: "address",
            value: createLocationValue("Sample Address " + emulatedIndex, "Sample Address Specification " + emulatedIndex),
          },
          {
            id: "title",
            value: ["Sample Title", "Another Title", "Yet another Title"][emulatedIndex],
          },
          {
            id: "image",
            // note how we are using this strange url as the source of our file
            // we will have to create and put such file as a resource
            value: createFakeFileValue("SAMPLE_FILE", "Sample image " + emulatedIndex, "/rest/resource/image/sample.jpg", "image/jpeg"),
          },
          {
            id: "unit_type",
            value: ["room", "apartment", "house"][emulatedIndex],
          },
          {
            id: "price",
            value: createCurrencyValue(100 * (emulatedIndex + 1), ["EUR", "USD", "CHF"][emulatedIndex]),
          }
        ]}
      >
        {n}
      </ItemProvider>
    ),

    // now we can set these properties here
    // this is what we are using for searching
    properties: {
      address: {
        label: "Address",
        type: "html",
        htmlDisplay: (<View id="address" rendererArgs={{hideMap: true}} />),
      },
      title: {
        label: "Title",
        type: "html",
        htmlDisplay: (<View id="title" />),
      },
      unit_type: {
        label: "Unit Type",
        type: "html",
        htmlDisplay: (<View id="unit_type" />),
      },
      unit_price: {
        label: "Price Of Unit",
        type: "html",
        htmlDisplay: (<View id="price" />),
      },
      image: {
        label: "Image Of Unit",
        type: "html",
        htmlDisplay: (<View id="image" rendererArgs={{imageClassName: "element-view", disableImageLinking: true}}/>),
      },
      go_to_view_listing: {
        label: "Go to View Listing Page",
        type: "function",
      },
    }
  }
};

/**
 * The most important bit that defines what fragments are available to modify
 * from within the CMS, these use custom keys; and you might add as many of
 * them as you like, they are defined by template args since every fragment
 * is allowed to be a template and can be rendered as such (even if it doesn't have to)
 * in cms/index.propext.json you can find out the content property and what it
 * supports
 */
export const FRAGMENTS: { [key: string]: ITemplateArgsContext } = {
  /**
   * In this example you can see the header, the header uses a custom ID
   * and is loaded in the frontpage by passing it as ID for the fragment
   * item definition
   * 
   * This defines the context, now we are using hardcoded contexts in here
   * that don't support for multilingual design, because of the labels
   * we are giving in, which are in english
   * 
   * Labels can however also be i18n element types, as react nodes are allowed
   * so that enables multilingual functionality if required, for the purpose
   * of this basic CMS simple strings are used
   */
  "HEADER": {
    type: "context",
    label: "Header",
    wrapper: searchWrapper,
    properties: frontpageProperties,
  },
  "BODY": {
    type: "context",
    label: "Body",
    wrapper: searchWrapper,
    properties: frontpageProperties,
  },
  "RESERVE_SEARCH": {
    type: "context",
    label: "Reservation Search Page",
    wrapper: searchWrapper,
    properties: reserveSearchProperties,
  },
  "ACCOUNT_VALIDATION_EMAIL": {
    type: "context",
    label: "Account Validation Email",
    properties: {
      validate_account_link: {
        type: "link",
        label: "Validation Link",
      },
      username: {
        type: "text",
        label: "Username",
      },
    },
  },
  "ACCOUNT_RECOVERY_EMAIL": {
    type: "context",
    label: "Account Recovery Email",
    properties: {
      forgot_password_link: {
        type: "link",
        label: "Recovery Link",
      },
      username: {
        type: "text",
        label: "Username",
      },
    },
  },
  "NOTIFICATION_EMAIL": {
    type: "context",
    label: "Request notification email",
    properties: {
      request_notification_requester: {
        type: "text",
        label: "Requester",
      },
      request_notification_check_in: {
        type: "text",
        label: "Check in time",
      },
      request_notification_check_out: {
        type: "text",
        label: "Check out time",
      },
    },
  },
  "APPROVAL_EMAIL": {
    type: "context",
    label: "Request approval email",
    properties: {
      request_notification_host: {
        type: "text",
        label: "Host",
      },
    },
  },
  "DENIAL_EMAIL": {
    type: "context",
    label: "Request denial email",
    properties: {
      request_notification_host: {
        type: "text",
        label: "Host",
      },
    },
  },
}
const ALL_FRAGMENTS = Object.keys(FRAGMENTS);

/**
 * The fragment styles that are used
 * in the page itself
 */
const fragmentStyles = createStyles({
  paper: {
    padding: "1rem",
  },
  container: {
    paddingTop: "1rem",
  },
  box: {
    paddingBottom: "1rem",
  },
  listItem: {
    borderBottom: "solid 1px #ccc",
    transition: "backgroundColor 0.3s",
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.05)",
    },
  },
});

const FragmentIndex = withStyles(fragmentStyles)((props: WithStyles<typeof fragmentStyles>) => {
  return (
    <Container maxWidth="md" className={props.classes.container}>
      <Paper className={props.classes.paper}>
        <List>
          {ALL_FRAGMENTS.map((f) => {
            const fragmentContext = FRAGMENTS[f];
            return (
              <Link to={"/cms/fragment/" + f} key={f}>
                <ListItem className={props.classes.listItem}>
                  <ListItemIcon>
                    <ExtensionIcon />
                  </ListItemIcon>
                  <ListItemText primary={fragmentContext.label} secondary={f} />
                </ListItem>
              </Link>
            );
          })}
        </List>
      </Paper>
    </Container>
  );
});

export function Fragment() {
  return (
    <>
      <Route
        path="/cms/fragment"
        exact={true}
        component={FragmentIndex}
      />
      <Route path="/cms/fragment/:id"
        exact={true}
        component={SingleFragment}
      />
    </>
  );
};

interface ISingleFragmentProps extends WithStyles<typeof fragmentStyles> {
  match: {
    params: {
      id: string;
    };
  };
}

/**
 * The fragment section itself that allows modifying and creating new fragments
 * @param props the fragment styles
 * @returns a react element
 */
const SingleFragment = withStyles(fragmentStyles)((props: ISingleFragmentProps) => {
  const fragmentId = props.match.params.id;
  return (
    <LocationStateReader defaultState={{ version: "" }} stateIsInQueryString={true}>
      {(locationState, setState) => {
        // here we will use a language picker down there to specify the version
        // of the fragment so multiple version fragments can be loaded
        const updateVersionState = (code: string) => {
          setState({
            version: code,
          }, true);
        };
        return (
          <ItemProvider
            itemDefinition="fragment"
            properties={[
              "title",
              "content",
              "attachments",
            ]}
            includePolicies={false}
            longTermCaching={false}
            forId={fragmentId}
            forVersion={locationState.version || null}
          >
            <Container maxWidth="md" className={props.classes.container + " trusted"}>
              <Paper className={props.classes.paper}>
                <Box className={props.classes.box}>
                  <LanguagePicker
                    currentCode={locationState.version || null}
                    allowUnspecified={true}
                    handleLanguageChange={updateVersionState}
                  />
                </Box>

                <Entry id="title" />
                <Entry
                  id="content"
                  rendererArgs={{
                    context: FRAGMENTS[fragmentId] || null,
                    toolbarExtras: [
                      buttonToolbarPrescence,
                    ],
                    drawerUIHandlerExtras: [
                      ...buttonOptions,
                    ],
                  }}
                />

                <SubmitButton
                  i18nId="submit"
                  buttonVariant="contained"
                  buttonColor="primary"
                  options={{
                    properties: [
                      "title",
                      "content",
                      "attachments",
                    ],
                  }}
                />

              </Paper>
            </Container>

            <SubmitActioner>
              {(actioner) => (
                <>
                  <Snackbar
                    id="submit-fragment-error"
                    severity="error"
                    i18nDisplay={actioner.submitError}
                    open={!!actioner.submitError}
                    onClose={actioner.dismissError}
                  />
                  <Snackbar
                    id="submit-fragment-success"
                    severity="success"
                    i18nDisplay="success"
                    open={actioner.submitted}
                    onClose={actioner.dismissSubmitted}
                  />
                </>
              )}
            </SubmitActioner>

          </ItemProvider>);
      }}
    </LocationStateReader>
  );
});
