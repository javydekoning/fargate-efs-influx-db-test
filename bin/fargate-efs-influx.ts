#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { FargateEfsInfluxStack } from '../lib/fargate-efs-influx-stack';

const prod: cdk.StackProps = {
    env: { account: "922457306128", region: "eu-west-1" }
  };

const app = new cdk.App();
new FargateEfsInfluxStack(app, 'FargateEfsInfluxStack', prod);
