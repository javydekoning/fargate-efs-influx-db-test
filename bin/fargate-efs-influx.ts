#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { FargateEfsInfluxStack } from '../lib/fargate-efs-influx-stack';

const app = new cdk.App();
new FargateEfsInfluxStack(app, 'FargateEfsInfluxStack');
