import { Stack, StackProps, SecretValue, CfnOutput } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import {
	App,
	CustomRule,
	GitHubSourceCodeProvider,
	RedirectStatus,
} from '@aws-cdk/aws-amplify-alpha'
import { config } from '../project-config'
import { BuildSpec } from 'aws-cdk-lib/aws-codebuild'

interface AmplifyStackProps extends StackProps {
	readonly stage: string
}

export class AmplifyStack extends Stack {
	public readonly amplifyAppId: CfnOutput

	constructor(scope: Construct, id: string, props: AmplifyStackProps) {
		super(scope, id, props)

		const amplifyApp = new App(this, `SampleAmplifyApp-${props.stage}`, {
			sourceCodeProvider: new GitHubSourceCodeProvider({
				owner: config.env.dev.frontendConfig.repoOwner,
				repository: config.env.dev.frontendConfig.repoName,
				oauthToken: SecretValue.secretsManager('github-amplify-token'),
			}),
			environmentVariables: {
				REGION: this.region,
			},
			buildSpec: BuildSpec.fromObjectToYaml({
				// Alternatively add a `amplify.yml` to the frontend repo
				version: 1,
				frontend: {
					phases: {
						preBuild: {
							commands: ['npm ci', 'echo "hello there"'],
						},
						build: {
							commands: ['npm run build'],
						},
					},
					artifacts: {
						baseDirectory: '.next',
						files: ['**/*'],
					},
					cache: {
						paths: ['node_modules/**/*'],
					},
				},
			}),
		})

		const mainBranch = amplifyApp.addBranch('main')

		amplifyApp.addCustomRule(CustomRule.SINGLE_PAGE_APPLICATION_REDIRECT)
		amplifyApp.addCustomRule({
			source: '/posts/<*>',
			target: '/posts/[id].html',
			status: RedirectStatus.REWRITE,
		})

		amplifyApp.addCustomRule({
			source: '/<*>',
			target: '/index.html',
			status: RedirectStatus.NOT_FOUND_REWRITE,
		})

		new CfnOutput(this, 'AmplifyAppName', {
			value: amplifyApp.appName,
		})

		this.amplifyAppId = new CfnOutput(this, 'AmplifyAppId', {
			value: amplifyApp.appId,
		})

		new CfnOutput(this, 'AmplifyURL', {
			value: `https://${mainBranch.branchName}.${amplifyApp.defaultDomain}`,
		})
	}
}
