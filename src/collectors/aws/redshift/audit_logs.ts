import * as AWS from "aws-sdk";
import { RedshiftClustersCollector } from ".";
import { CollectorUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class RedshiftAuditLogsCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAuditLogs();
    }

    private async getAuditLogs() {

        const self = this;

        const serviceName = "Redshift";
        const redshiftRegions = self.getRegions(serviceName);
        const redshiftClustersCollector = new RedshiftClustersCollector();
        redshiftClustersCollector.setSession(self.getSession());
        const audit_logs = {};

        try {
            const clustersData = await CollectorUtil.cachedCollect(redshiftClustersCollector);

            for (const region of redshiftRegions) {
                try {
                    const redshift = self.getClient(serviceName, region) as AWS.Redshift;
                    audit_logs[region] = {};
                    const regionClusters = clustersData.clusters[region];
                    for (const cluster of regionClusters) {
                        const loggingStatus:
                            AWS.Redshift.LoggingStatus =
                            await redshift.describeLoggingStatus
                                ({ ClusterIdentifier: cluster.ClusterIdentifier }).promise();
                        audit_logs[region][cluster.ClusterIdentifier] = loggingStatus;
                    }
                } catch (error) {
                    AWSErrorHandler.handle(error);
                }
            }
        } catch (error) {
            AWSErrorHandler.handle(error);
        }
        return { audit_logs };
    }
}
