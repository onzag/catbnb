import { ISQLTableRowValue } from "@onzag/itemize/base/Root/sql";
import { ServiceProvider, ServiceProviderType } from "@onzag/itemize/server/services";

export default class BookingService extends ServiceProvider<null> {
  static getType() {
    return ServiceProviderType.GLOBAL;
  }
  public getRunCycleTime() {
    // run will run every hour
    return 3600000;
  }
  public async run() {
    // we are going to remove the booked, booked by and booked until
    // when the booking is done
    await this.globalRawDB.performBatchRawDBUpdate(
      "hosting/unit",
      {
        whereCriteriaSelector: (qb) => {
          qb.andWhereColumn("booked_until", "<=", ["CURRENT_DATE", []]);
        },
        itemTableUpdate: {
          booked: false,
          booked_by: null,
          booked_until: null,
        }
      }
    );

    // we are going to pick all approved requests that exist within the requests
    // within the check in and out date
    const allActiveRequests: ISQLTableRowValue[] = await this.globalRawDB.performRawDBSelect(
      "hosting/request",
      (selecter) => {
        selecter.select("created_by", "parent_id", "check_out");
        selecter.whereBuilder
          .andWhereColumn("status", "APPROVED")
          .andWhereColumn("check_in", "<=", ["CURRENT_DATE", []])
          .andWhereColumn("check_out", ">", ["CURRENT_DATE", []]);
      }
    );

    // and then we are going to update the units with that data
    for (const activeRequest of allActiveRequests) {
      // we will use performBatchRawDBUpdate rather than a single row update
      // because we will be updating 0 or 1 row, so we have a different criteria
      // than just id and version
      await this.globalRawDB.performBatchRawDBUpdate(
        "hosting/unit",
        {
          whereCriteriaSelector: (qb) => {
            qb.andWhereColumn("id", activeRequest.parent_id).andWhereColumn("version", "").andWhereColumn("booked", false);
          },
          itemTableUpdate: {
            booked: true,
            booked_by: activeRequest.created_by,
            booked_until: activeRequest.check_out,
          }
        }
      );
    }
  }
}