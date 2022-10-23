import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'

interface ProjectProps extends StackProps {
	readonly stage: string
}
export class AmplifyAppFromCdkStack extends Stack {
	constructor(scope: Construct, id: string, props?: ProjectProps) {
		super(scope, id, props)
	}
}
