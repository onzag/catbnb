import React from "react";
import I18nRead from "@onzag/itemize/client/components/localization/I18nRead";
import TitleSetter from "@onzag/itemize/client/components/util/TitleSetter";
import Entry from "@onzag/itemize/client/components/property/Entry";
import View from "@onzag/itemize/client/components/property/View";
import { ModuleProvider } from "@onzag/itemize/client/providers/module";
import AppLanguageRetriever from "@onzag/itemize/client/components/localization/AppLanguageRetriever";
import { ItemProvider } from "@onzag/itemize/client/providers/item";
import { button, buttonOptions, buttonToolbarPrescence } from "../../components/ui-handlers";
import { localizedRedirectTo } from "@onzag/itemize/client/components/navigation";
import { TemplateArgs } from "@onzag/itemize/client/internal/text/serializer/template-args";
import { FragmentLoader } from "@onzag/itemize/client/fast-prototyping/components/fragment-loader";
import { FRAGMENTS } from "../cms/fragment";

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
      >
        {children}
      </ItemProvider>
    </ModuleProvider>
  );
}

const templateArgs = new TemplateArgs({
  check_in_date_entry: <Entry id="planned_check_in" />,
  check_out_date_entry: <Entry id="planned_check_out" />,
  location_entry: <Entry id="address" searchVariant="location" rendererArgs={{disableMapAndSearch: true}}/>,
  search_radius_entry: <Entry id="address" searchVariant="radius" />,
  unit_type_entry: <Entry id="unit_type" searchVariant="search" />,
  min_price_entry: <Entry id="price" searchVariant="from" />,
  max_price_entry: <Entry id="price" searchVariant="to" />,
  button,
  go_to_search_page: () => localizedRedirectTo("reserve"),
}).wrappedBy(templateContextWrapper);

/**
 * Provides the frontpage
 */
export function Frontpage() {
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
              <>
                <ItemProvider
                  itemDefinition="fragment"
                  forId="HEADER"
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
                  <FragmentLoader
                    roles={["ADMIN"]}
                    viewRendererArgs={{ makeTemplate: true, templateArgs }}
                    entryRendererArgs={{
                      context: FRAGMENTS.HEADER,
                      toolbarExtras: [
                        buttonToolbarPrescence,
                      ],
                      drawerUIHandlerExtras: [
                        ...buttonOptions,
                      ],
                      disjointedMode: true,
                    }}
                  />
                </ItemProvider>
                <ItemProvider
                  itemDefinition="fragment"
                  forId="BODY"
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
              </>
            )}
          </AppLanguageRetriever>
        </ModuleProvider>
      </div>
    </>
  );
}
