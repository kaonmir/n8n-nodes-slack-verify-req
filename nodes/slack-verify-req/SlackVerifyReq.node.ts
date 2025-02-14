import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import crypto from 'crypto';

const verifySlackRequest = (
	slackSignature: string,
	timestamp: string,
	body: any,
	SLACK_SIGNING_SECRET: string,
) => {
	const time = Math.floor(new Date().getTime() / 1000);

	// 요청이 5분 이상 지났는지 확인하여 재생 공격 방지
	if (Math.abs(time - Number(timestamp)) > 300) {
		return false;
	}

	// 서명 기반 문자열 생성
	const sigBasestring = `v0:${timestamp}:${JSON.stringify(body)}`;

	// HMAC SHA256을 사용하여 서명 생성
	const mySignature = `v0=${crypto
		.createHmac('sha256', SLACK_SIGNING_SECRET)
		.update(sigBasestring, 'utf8')
		.digest('hex')}`;

	// 서명 비교를 위한 안전한 시간 비교
	const isValid = crypto.timingSafeEqual(
		Buffer.from(mySignature, 'utf8'),
		Buffer.from(slackSignature, 'utf8'),
	);

	return isValid;
};

export class SlackVerifyReq implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Slack Verify Request',
		name: 'slackVerifyReq',
		icon: 'file:slackVerifyReq.svg',
		group: ['transform'],
		version: 1,
		description: 'Use Slack Verify Request',
		subtitle: '',
		defaults: {
			name: 'Slack Verify Request',
		},
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: [{ displayName: '', type: NodeConnectionType.Main }],
		// eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'slackVerifyReqCredentialsApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Slack Signature',
				name: 'slackSignature',
				type: 'string',
				default: '',
				required: true,
				description: 'The signature from Slack request header (x-slack-signature)',
			},
			{
				displayName: 'Timestamp',
				name: 'timestamp',
				type: 'string',
				default: '',
				required: true,
				description: 'The timestamp from Slack request header (x-slack-request-timestamp)',
			},
			{
				displayName: 'Request Body',
				name: 'body',
				type: 'json',
				default: '',
				required: true,
				description: 'The body of the Slack request',
			},
		],
	};

	methods = {};
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const credentials = await this.getCredentials('slackVerifyReqCredentialsApi');

		if (!credentials?.slackSigningSecret) {
			throw new NodeOperationError(this.getNode(), 'No valid Slack signing secret provided');
		}

		try {
			for (let i = 0; i < items.length; i++) {
				const slackSignature = this.getNodeParameter('slackSignature', i) as string;
				const timestamp = this.getNodeParameter('timestamp', i) as string;
				const body = this.getNodeParameter('body', i);

				const isValid = verifySlackRequest(
					slackSignature,
					timestamp,
					body,
					credentials.slackSigningSecret as string,
				);

				if (!isValid) {
					throw new NodeOperationError(this.getNode(), 'Invalid Slack request');
				}
			}
		} catch (error: any) {
			throw new NodeOperationError(this.getNode(), `General execution error: ${error.message}`);
		}

		return [items];
	}
}
