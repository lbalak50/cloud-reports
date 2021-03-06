import * as AWS from "aws-sdk";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class TopicsCollector extends BaseCollector {
    public collect() {
        return this.getAllTopics();
    }
    private async getAllTopics() {

        const serviceName = "SNS";
        const snsRegions = this.getRegions(serviceName);
        const topics = {};

        for (const region of snsRegions) {
            try {
                const sns = this.getClient(serviceName, region) as AWS.SNS;
                topics[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const topicsResponse: AWS.SNS.ListTopicsResponse =
                        await sns.listTopics({ NextToken: marker }).promise();
                    if (topicsResponse.Topics) {
                        topics[region] = topics[region].concat(topicsResponse.Topics);
                    }
                    marker = topicsResponse.NextToken;
                    fetchPending = marker !== undefined && marker !== null;
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { topics };
    }

}
