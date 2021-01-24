import { initializeServer } from "@onzag/itemize/server";
import { formatDate, localeReplacer } from "@onzag/itemize/util";

// Check the client for info on these, we are replicating what is used in the client somewhat
import React from "react";
import App from "../client/app";
import { rendererContext } from "@onzag/itemize/client/fast-prototyping/renderers";
import { appWrapper, mainWrapper } from "@onzag/itemize/client/fast-prototyping/wrappers";
import { styleCollector } from "@onzag/itemize/client/fast-prototyping/collectors";
import { IOTriggerActions } from "@onzag/itemize/server/resolvers/triggers";
import { CONNECTOR_SQL_COLUMN_ID_FK_NAME, CONNECTOR_SQL_COLUMN_VERSION_FK_NAME } from "@onzag/itemize/constants";

// Itemize server isn't hot, it won't refresh in realtime and it
// isn't recommended to attempt to set it up that way

// for a given build number all the resources are considered equal,
// resources are contained within the /rest/resources/ endpoint during
// development of the app remember to disable service workers by making it
// bypass for network or otherwise the content you will get will always be the
// same, this bypasses the build number functionality on the client side
// but only after reload

// some changes require a server reload as well, such as enforcing a new build number
// adding new languages, changing API keys, etc... and of course, changing server code

// itemize is heavily offline so it always attempts not to call the server, itemize
// apps are also aware of when they are not connected to the server and it doesn't make
// them crash (except in development mode with service workers off)

// when a new version of an itemize app is deployed the client can realize that
// due to a new build number that doesn't match its internal build number, which will
// trigger the refresh of all the resources and wipes the client side caches a refresh
// is requested, if the app is just being launched when that is detected, it will refresh
// immediately and load the new version, otherwise if it happens while the user uses the app
// it will mark the app as outdated and you can have custom logic for outdated apps
// outdated apps only exists for that session

initializeServer(
  {
    // These are the same as of the client side
    rendererContext,
    mainComponent: React.createElement(App, null),
    mainWrapper,
    appWrapper,
    // the style collector which collects style for material UI SSR
    collector: styleCollector,
  },
  {
    seoRules: {
      "/": {
        crawable: true,
      },
      "profile/:id": {
        crawable: true,
        collect: [
          {
            module: "users",
            item: "user",
          },
        ],
      },
    },
  },
  {
    customRoles: [
      {
        role: "OWNER_OF_UNIT",
        item: ["unit"],
        module: ["hosting"],
        grant: async (arg) => {
          // if there's no parent
          // we give false
          if (!arg.parent) {
            return false;
          }

          const parentItem = await arg.cache.requestValue(
            arg.parent.type,
            arg.parent.id,
            arg.parent.version,
            {
              // the memory cache is a volatile and extremely fast but not realtime
              // cache that sits directly into the ram, usually values are requested
              // from redis, and redis is kept in realtime, but the memory cache is static
              // however it lives only for a couple of milliseconds, in practique, specially
              // when you expect to reuse the same value several times on a row on
              // different operations, using memory cache is endorsed, honestly small
              // millisecond windows of non-realtimeness is barely an inconvenience for
              // all the extra speed this adds; on critical operations, you might not
              // want to use it
              useMemoryCache: true,
            }
          );

          // if we get no parent, weird, because there should be one
          // always but who knows about that one edge case, we return false
          if (!parentItem) {
            return false;
          }

          // now we are the owner if the parent is our requester
          return parentItem.created_by === arg.tokenData.id;
        }
      }
    ],
    customTriggers: {
      item: {
        io: {
          "hosting/request": async (arg) => {
            // this will trigger before creating when
            // the endpoint is attempting to create a new item
            if (arg.action === IOTriggerActions.CREATE) {
              const checkIn: string = arg.requestedUpdate.check_in as string;
              const checkOut: string = arg.requestedUpdate.check_out as string;
              // The CONNECTOR_SQL_COLUMN_ID_FK_NAME is basically the id, remember that item definition
              // data has its own table and module as well, but we want to be cheap and not do a join
              // so we will use this reference to the foreign key of the id because we are cheap
              const oneOverlappingRequest = await arg.appData.knex.first(CONNECTOR_SQL_COLUMN_ID_FK_NAME)
                // the table name is the qualified name
                .from(arg.itemDefinition.getQualifiedPathName())
                // and we are going to search for an overlap between check in and check out
                .where("status", "APPROVED")
                .andWhere((clause) => {
                  clause.where((subclause) => {
                    subclause.where("check_in", ">=", checkIn).andWhere("check_out", "<", checkIn);
                  }).orWhere((subclause) => {
                    subclause.where("check_in", ">", checkOut).andWhere("check_out", "<=", checkOut);
                  });
                });

              if (oneOverlappingRequest) {
                // we put the id in the error message, the user doesn't see forbidden messages anyway
                // but it's good for debugging
                arg.forbid("This request is overlapping with another request " + oneOverlappingRequest[CONNECTOR_SQL_COLUMN_ID_FK_NAME])
              }
            }

            // before an edition has happened
            if (arg.action === IOTriggerActions.EDIT) {
              // if the status is being updated
              if (
                arg.requestedUpdate.status &&
                arg.originalValue.status !== "WAIT"
              ) {
                arg.forbid("You cannot change the status once it has been approved or denied");
              }
            }

            // when the action refers to a creation that is the item
            // has been created succesfully
            if (arg.action === IOTriggerActions.CREATED) {
              // let's get the user that did the request itself
              const requesterUser = await arg.appData.cache.requestValue(
                "users/user",
                // this is the request, the arg.newValue
                arg.newValue.created_by as string,
                null,
              );
              // the unit that was to be hosted, that of course, relates to the parent
              const hostingUnit = await arg.appData.cache.requestValue(
                "hosting/unit",
                arg.newValue.parent_id as string,
                arg.newValue.parent_version as string,
              );
              // and the user that is the hosting person
              const targetUser = await arg.appData.cache.requestValue(
                "users/user",
                hostingUnit.created_by,
                null,
              );

              // let's get the request item definition to read some data from it
              const requestIdef = arg.appData.root.registry["hosting/request"];
              const i18nData = requestIdef.getI18nDataFor(targetUser.app_language);

              // now let's use the mail service to send a template email
              // based on a fragment
              arg.appData.mailService.sendTemplateEmail({
                // this is the email handle to be sent from [user]@mysite.com
                fromEmailHandle: i18nData.custom.request_notification_email_handle,
                // this is the username that it will be sent as
                fromUsername: i18nData.custom.request_notification_email_username,
                // the subject line
                subject: localeReplacer(i18nData.custom.request_notification_email_subject, hostingUnit.title),
                // whether the user can unsubscribe via email address, allow users
                // to unsubscribe as a norm unless they are very critical emails
                canUnsubscribe: true,
                // where is the subscription state stored, we will reuse the e_notifications
                // boolean that exist within the user, if this boolean is false, the email
                // won't be sent because the user is unsubscribed
                subscribeProperty: "e_notifications",
                // the unsubscription email will be sent, but it will not check if the user
                // is unsubscribed
                ignoreUnsubscribe: false,
                // other important properties in order to send the message, we want to ensure
                // the user is validated and not just spam
                confirmationProperties: ["e_validated"],
                // arguments to render the template
                args: {
                  request_notification_requester: requesterUser.username,
                  request_notification_check_in: formatDate(targetUser.app_language, arg.newValue.check_in as string),
                  request_notification_check_out: formatDate(targetUser.app_language, arg.newValue.check_out as string),
                },
                // the item definition that we will use as template, we will use a fragment
                itemDefinition: "cms/fragment",
                // the id of the item definition we want to use, this is a custom id
                id: "NOTIFICATION_EMAIL",
                // the version, so we have different versions per language
                version: targetUser.app_language,
                // the property we want to pull from that item definition
                property: "content",
                // who we are sending to, passing a value from the cache is more efficient
                to: targetUser,
              });

              // we are going to do a raw database update, even if we have hostingUnit already
              // and we can calculate what the +1 value will be for the counter using hostingUnit.pending_requests_count
              // and we could use requestUpdateSimple in order to update this value we want to do it this way
              // to show it's possible to do raw updates to the database, also a raw update disables race conditions
              // while a +1 mechanism can not be optimal your query can be as complex as necessary in order to avoid
              // race conditions
              await arg.appData.rawDB.performRawDBUpdate(
                "hosting/unit",
                hostingUnit.id,
                hostingUnit.version,
                {
                  itemTableUpdate: {
                    // this for example could be changed with a subquery to a count
                    // but we are just going to leave it like this
                    // a count itself would be better for consistency
                    // but this is just for a tutorial
                    pending_requests_count: arg.appData.knex.raw("?? + 1", "pending_requests_count"),
                  }
                }
              );
              await arg.appData.rawDB.performRawDBUpdate(
                "users/user",
                targetUser.id,
                targetUser.version,
                {
                  itemTableUpdate: {
                    pending_requests_count: arg.appData.knex.raw("?? + 1", "pending_requests_count"),
                  }
                }
              );
            }

            if (
              arg.action === IOTriggerActions.EDITED &&
              arg.originalValue.status === "WAIT" &&
              arg.newValue.status !== "WAIT"
            ) {
              // yes we can grab the updated value from here, while you might wonder
              // why is itemize fetching the entire thing, well, in order to update
              // the caches.
              const hostingUnit = await arg.appData.rawDB.performRawDBUpdate(
                "hosting/unit",
                arg.newValue.parent_id as string,
                arg.newValue.parent_version as string,
                {
                  itemTableUpdate: {
                    pending_requests_count: arg.appData.knex.raw("?? - 1", "pending_requests_count"),
                  }
                }
              );

              // so we can use the creator on a new raw database update
              await arg.appData.rawDB.performRawDBUpdate(
                "users/user",
                hostingUnit.created_by,
                null,
                {
                  itemTableUpdate: {
                    pending_requests_count: arg.appData.knex.raw("?? - 1", "pending_requests_count"),
                  }
                }
              );
            }

            return null;
          }
        }
      }
    }
  },
);
