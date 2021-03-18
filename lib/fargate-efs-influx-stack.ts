import * as cdk from '@aws-cdk/core';
import * as ecsp from '@aws-cdk/aws-ecs-patterns';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as efs from '@aws-cdk/aws-efs';

export class FargateEfsInfluxStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, 'defvpc', {isDefault: true})
    
    const fs = new efs.FileSystem(this, 'nfs-fs', {
      vpc,
      throughputMode: efs.ThroughputMode.PROVISIONED,
      provisionedThroughputPerSecond: cdk.Size.mebibytes(8),
    })

    const volume: ecs.Volume = {
      name: 'volume',
      efsVolumeConfiguration: {
        fileSystemId: fs.fileSystemId}
      }

    const mountPoint = {
        containerPath: "/var/lib/influxdb",
        sourceVolume: volume.name,
        readOnly: false
      }

    const taskDefinition = new ecs.TaskDefinition(this, 'taskdef', {
      compatibility: ecs.Compatibility.FARGATE,
      cpu: '1024',
      memoryMiB: '4096',
      volumes: [volume],
    })


    const influxContainer = taskDefinition.addContainer('influx', {
      image: ecs.ContainerImage.fromRegistry('public.ecr.aws/influxdb/influxdb:1.8'),
      logging: new ecs.AwsLogDriver({
        streamPrefix: "/ecs/influx",
      }),
      //environment: {'INFLUXDB_ADMIN_USER_PASSWORD': 'YouShouldNotDoThis!', 'INFLUXDB_ADMIN_USER_TOKEN': 'admintoken123'}
    })

    influxContainer.addPortMappings({
      containerPort: 8086,
      protocol: ecs.Protocol.TCP
    })
    
    const svc = new ecsp.NetworkLoadBalancedFargateService(this, 'influx', {
      listenerPort: 8086,
      vpc,
      taskDefinition,
    })

    fs.connections.allowFrom(svc.service.connections.securityGroups[0], ec2.Port.tcp(2049))

    svc.taskDefinition.defaultContainer?.addMountPoints(mountPoint)
    svc.service.connections.allowFrom(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(8086))
  }
}
