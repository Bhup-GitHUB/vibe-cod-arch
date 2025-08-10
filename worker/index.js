"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_auto_scaling_1 = require("@aws-sdk/client-auto-scaling");
if (!process.env.AWS_ACCESS_KEY || !process.env.AWS_ACCESS_SECRET) {
    throw new Error("AWS credentials are missing from .env");
}
const client = new client_auto_scaling_1.AutoScalingClient({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_ACCESS_SECRET,
    },
});
(async () => {
    const command = new client_auto_scaling_1.SetDesiredCapacityCommand({
        AutoScalingGroupName: "vscode-asg",
        DesiredCapacity: 2,
        HonorCooldown: true,
    });
    const data = await client.send(command);
    console.log(data);
})();
