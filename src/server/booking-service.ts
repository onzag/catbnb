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

    for (const activeRequest of allActiveRequests) {
      await this.globalRawDB.performBatchRawDBUpdate(
        "hosting/unit",
        {
          whereCriteriaSelector: (qb) => {
            qb.andWhereColumn("id", activeRequest.parent_id).andWhereColumn("version", "").andWhereColumn("booked", null)
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