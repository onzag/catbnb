import React from "react";

import Route from "@onzag/itemize/client/components/navigation/Route";

import { Navbar } from "@onzag/itemize/client/fast-prototyping/components/navbar";
import { IMenuEntry } from "@onzag/itemize/client/fast-prototyping/components/navbar/menu";
import { ImportantDevicesIcon, HomeIcon, LibraryBooksIcon } from "@onzag/itemize/client/fast-prototyping/mui-core";

import { Frontpage } from "./pages/frontpage";
import { Contact } from "./pages/contact";
import { PrivacyPolicy } from "./pages/privacy-policy";
import { TermsAndConditions } from "./pages/terms-and-conditions";
import { ResetPassword } from "./pages/reset-password";
import { Profile } from "./pages/profile";
import { Preferences } from "./pages/preferences";
import { MyProfile } from "./pages/my-profile";
import { ChangePassword } from "./pages/change-password";
import { News } from "./pages/news";
import { CMS } from "./pages/cms";

import { Avatar } from "./components/avatar";
import { Footer } from "./components/footer";
import { LoginDialog } from "./components/login-dialog";
import { SignupDialog } from "./components/signup-dialog";
import { RecoverDialog } from "./components/recover-dialog";

import HomeWorkIcon from "@material-ui/icons/HomeWork";
import EventSeatIcon from '@material-ui/icons/EventSeat';
import { Hosting } from "./pages/hosting";
import { ReserveHosting, ReserveHostingSearch } from "./pages/reserve";
import { Reservations } from "./pages/reservations";
import { ItemProvider } from "@onzag/itemize/client/providers/item";
import UserDataRetriever from "@onzag/itemize/client/components/user/UserDataRetriever";
import { ModuleProvider } from "@onzag/itemize/client/providers/module";
import Reader from "@onzag/itemize/client/components/property/Reader";

// Remember that when adding fast prototyping components they might demand
// localization data, if you get an error named
// Uncaught Error: Unknown key in context: xxxxxxx from localization.tsx
// this means this is a required localization key you need to go to your
// schema .properties file, depending on the context, and add the missing key
// keys are self descriptive on what they should contain, it might be data for
// hard hearing, tooltips or just display text

// you need to run npm run build-data to rebuild language packs if you are
// in development mode with the service worker set up as `bypass for network`
// it should work out of the box after a refresh

/**
 * The default admin entries
 */
export const MENU_ADMIN_ENTRIES: IMenuEntry[] = [
  {
    path: "/cms",
    icon: <ImportantDevicesIcon />,
    module: "cms",
    role: "ADMIN",
    i18nProps: {
      id: "name",
      capitalize: true,
    },
  },
];

/**
 * The default menu entries
 */
export const MENU_ENTRIES: IMenuEntry[] = [
  {
    path: "/",
    icon: <HomeIcon />,
    i18nProps: {
      id: "home",
      capitalize: true,
    },
  },
  {
    path: "/news",
    icon: <LibraryBooksIcon />,
    module: "cms",
    idef: "article",
    i18nProps: {
      id: "news",
      capitalize: true,
    },
  },
  {
    path: "/hosting",
    icon: <HomeWorkIcon />,
    badgeContent: (
      <UserDataRetriever>
        {(userData) => (
          <ModuleProvider module="users">
            <ItemProvider
              itemDefinition="user"
              forId={userData.id}
              properties={[
                "pending_requests_count"
              ]}
            >
              <Reader id="pending_requests_count">{(value: number) => (value || 0)}</Reader>
            </ItemProvider>
          </ModuleProvider>
        )}
      </UserDataRetriever>
    ),
    module: "hosting",
    idef: "unit",
    i18nProps: {
      id: "manage",
      capitalize: true,
    },
    roles: ["USER", "ADMIN"],
  },
  {
    path: "/reservations",
    icon: <EventSeatIcon />,
    module: "hosting",
    idef: "request",
    i18nProps: {
      id: "view_reservations",
      capitalize: true,
    },
    roles: ["USER", "ADMIN"],
  },
];

export default function App() {
  return (
    <>
      <Navbar
        LoginDialog={LoginDialog}
        SignupDialog={SignupDialog}
        RecoverDialog={RecoverDialog}
        menuEntries={MENU_ENTRIES}
        menuAdminEntries={MENU_ADMIN_ENTRIES}
        avatarContextProperties={
          [
            "username",
            "app_country",
            "email",
            "e_validated",
            "role",
            "address",
            "profile_picture",
          ]
        }
        AvatarComponent={Avatar}
        avatarProps={{
          cacheImage: true,
          profileURL: "/my-profile",
          showWarnings: true,
        }}
      />

      <Route path="/" exact={true} component={Frontpage} />

      <Route path="/profile/:id" component={Profile} />
      <Route path="/my-profile" component={MyProfile} />
      <Route path="/preferences" component={Preferences} />
      <Route path="/news" component={News} />

      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/change-password" component={ChangePassword} />

      <Route path="/cms" component={CMS} />

      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-and-conditions" component={TermsAndConditions} />
      <Route path="/contact" component={Contact} />

      <Route path="/hosting" component={Hosting} />

      <Route path="/reserve" component={ReserveHostingSearch} exact={true} />
      <Route path="/reserve/:id" component={ReserveHosting} exact={true} />
      <Route path="/reserve/:id/request/:rid" component={ReserveHosting} exact={true} />

      <Route path="/reservations" component={Reservations} />

      <Footer />
    </>
  );
}
