import "dotenv/config";
import {
  AutoScalingClient,
  SetDesiredCapacityCommand,
  DescribeAutoScalingInstancesCommand,
  
} from "@aws-sdk/client-auto-scaling";
import { Request, Response } from "express";
import express from "express";
import { EC2Client, DescribeInstancesCommand
 
} from "@aws-sdk/client-ec2";

const app = express();


app.get("/", async (req: Request, res: Response) => {
  res.send("Welcome to the server");
  await refreshMachineList(); 
});


type Machine = {
  ip: string;
  isUsed: boolean;
  assignedProject?: string;
};

const ALL_MACHINE: Machine[] = [];


const client = new AutoScalingClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_ACCESS_SECRET!,
  },
  

});


async function  refreshMachineList() {
  const command = new DescribeAutoScalingInstancesCommand({});
  try {
    const data = await client.send(command);
    console.log(data);

    //do this for all instance it check weather it exist in array and if its doesnt it will push otherwise it wont push in the array
    // ALL_MACHINE.push(data.AutoScalingInstances);


    // const ec2InsatcnceCOmmandnew= new DescribeInstancesCommand({
    //   InstanceIds:data.AutoScalingInstances?.map(x => x.InstanceId)
    // })

    // const ec2Response = awiat EC2Client.send(ec2InsatcnceCOmmandnew)   //idk why this is not working will figure out later
    // console.timeLog();
  
  } catch (error) {
    console.error("Error fetching auto-scaling instances:", error);
  }
}


refreshMachineList();
setInterval(refreshMachineList, 1000 * 10); 


if (!process.env.AWS_ACCESS_KEY || !process.env.AWS_ACCESS_SECRET) {
  throw new Error("AWS credentials are missing from .env");
}


app.listen(4000)
