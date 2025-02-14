import { IAuthenticateGeneric, ICredentialType, INodeProperties } from 'n8n-workflow';

export class SlackVerifyReqApi implements ICredentialType {
	name = 'slackVerifyReqCredentialsApi';
	displayName = 'Slack Verify Request API';
	properties: INodeProperties[] = [
		{
			displayName: 'Slack Signing Secret',
			name: 'slackSigningSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Slack 앱의 Signing Secret',
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {},
		},
	};
}
