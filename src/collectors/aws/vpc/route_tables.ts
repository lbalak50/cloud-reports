import * as AWS from "aws-sdk";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class RouteTablesCollector extends BaseCollector {

    public async collect() {
        const serviceName = "EC2";
        const ec2Regions = this.getRegions(serviceName);
        const self = this;
        const route_tables = {};
        for (const region of ec2Regions) {
            try {
                const ec2 = self.getClient(serviceName, region) as AWS.EC2;
                const routeTablesResponse: AWS.EC2.DescribeRouteTablesResult =
                    await ec2.describeRouteTables().promise();
                route_tables[region] = routeTablesResponse.RouteTables;
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { route_tables };
    }
}
