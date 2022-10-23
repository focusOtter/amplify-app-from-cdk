#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { AmplifyAppFromCdkStack } from '../lib/amplify-app-from-cdk-stack'
import { config } from '../project-config'
import { AmplifyStack } from '../lib/amplify-frontend-stack'

const app = new cdk.App()

const backendApp = new AmplifyAppFromCdkStack(
	app,
	`AmplifyAppFromCdkStack-${config.env.dev.stageName}`,
	{
		stage: config.env.dev.stageName,
	}
)

const amplifyApp = new AmplifyStack(
	app,
	`AmplifyStack-${config.env.dev.stageName}`,
	{
		stage: config.env.dev.stageName,
	}
)
