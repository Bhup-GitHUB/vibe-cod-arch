import "dotenv/config";
import {
  AutoScalingClient,
  DescribePoliciesCommand,
} from "@aws-sdk/client-auto-scaling";

if (!process.env.AWS_ACCESS_KEY || !process.env.AWS_ACCESS_SECRET) {
  throw new Error("AWS credentials are missing from .env");
}

const client = new AutoScalingClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_ACCESS_SECRET,
  },
});

(async () => {
  const data = await client.send(new DescribePoliciesCommand({}));
  console.log(data);
})();
