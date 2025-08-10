# Vibe Coding Platform — Cloud Workers (ASG + VS Code Web)

[![Node](https://img.shields.io/badge/node-%E2%89%A518-brightgreen?logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.x-black?logo=express&logoColor=white)](https://expressjs.com/)
[![AWS SDK v3](https://img.shields.io/badge/AWS%20SDK-v3-orange?logo=amazonaws&logoColor=white)](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
[![Region](https://img.shields.io/badge/Region-ap--south--1-1f73b7?logo=amazonaws&logoColor=white)](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)
[![ASG](https://img.shields.io/badge/ASG-vscode--asg-8a2be2?logo=amazonaws&logoColor=white)](https://docs.aws.amazon.com/autoscaling/)

A production‑ready worker service that programmatically scales an AWS Auto Scaling Group (ASG) hosting ephemeral VS Code Web (code‑server) instances. It powers the “Workers” area of the Vibe Coding Platform by allocating an editor VM on‑demand and scaling the pool up/down based on usage.

---

### Why this project?
- Create on‑demand development environments in seconds
- Keep costs low by scaling to zero and expanding only when needed
- Simple API surface that can be plugged into any chat/queue driven product


### Highlights
- **ASG control**: Increase/decrease `DesiredCapacity` via AWS SDK v3
- **Pool awareness**: Periodically discovers instances and maintains an in‑memory pool
- **Worker allocation API**: Returns a worker IP for a given project/session
- **Safe teardown**: Endpoint to terminate a worker and decrement desired capacity
- **Typed Node stack**: TypeScript + Express 5 with modern tooling


### Architecture (at a glance)
- An ASG named `vscode-asg` in region `ap-south-1` launches EC2 instances from a VS Code Web launch template
- This worker exposes HTTP endpoints to allocate and release machines
- It periodically reconciles current ASG/EC2 state and updates its local pool

![Architecture sketch](image.png)

---

## Screenshots

- Auto Scaling Group

  ![ASG Console](asg.png)

- Successful AWS API call (200 OK)

  ![AWS SDK output](code.png)

- VS Code Web running on a worker

  ![VS Code Web](vscode.png)

---

## Tech Stack
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express 5
- **Cloud**: AWS Auto Scaling, EC2
- **SDK**: AWS SDK for JavaScript v3

---

## Repository Structure
```text
.
├─ worker/
│  ├─ index.ts            # Main worker service
│  ├─ dist/index.js       # Compiled output
│  ├─ .env.example        # Environment template
│  ├─ package.json        # Dependencies & scripts
│  └─ tsconfig.json       # TypeScript configuration
├─ asg.png
├─ code.png
├─ image.png
└─ vscode.png
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- An AWS account with IAM permissions for:
  - `autoscaling:SetDesiredCapacity`
  - `autoscaling:Describe*`
  - `ec2:DescribeInstances`
  - `autoscaling:TerminateInstanceInAutoScalingGroup`

### Clone & Install
```bash
cd worker
npm install
```

### Configure environment
Copy `worker/.env.example` to `worker/.env` and set the following:

| Variable | Description |
|---|---|
| `AWS_ACCESS_KEY` | Access key ID for an IAM user/role with permissions above |
| `AWS_ACCESS_SECRET` | Secret access key |

Recommended: Prefer using an instance role/task role over long‑lived static keys.

### Run the worker
- Build and run from TypeScript:

```bash
cd worker
npx tsc -b
node dist/index.js
```

- Or using the provided script:
```bash
cd worker
npm run dev
```

By default the service listens on port `4000`.

---

## Configuration
These values are currently set in `worker/index.ts`:
- `region`: `ap-south-1`
- `AutoScalingGroupName`: `vscode-asg`
- Desired capacity is adjusted dynamically based on allocation logic

---

## API
> Note: This API surface is intentionally small and can be placed behind your platform’s gateway/auth layer.

- `GET /:Id`
  - Returns an available worker from the local pool and marks it as used
  - Triggers a scale‑up if no idle worker exists
  - Response sample:

```json
{
  "ip": "i-0abc123def4567890"
}
```

- `POST /delete/:Id`
  - Body: `{ "machineID": "<instance-id>" }`
  - Terminates the instance via `TerminateInstanceInAutoScalingGroup` and decrements desired capacity

---

## How it works
1. On boot, the worker calls `DescribeAutoScalingInstances` to discover current instances
2. Optionally looks up EC2 metadata for each instance (AMI, state, IP)
3. Maintains an in‑memory array of machines: `{ ip, isUsed, assignedProject }`
4. On allocation, it returns an idle machine or increases ASG desired capacity
5. On release, it terminates the instance and decrements the capacity
6. A background interval (10s) keeps the pool in sync with ASG state

---

## Production notes
- Place this service behind your API Gateway or a private ALB with auth
- Use an IAM role for credentials; avoid static keys in `.env`
- Consider target tracking policies for automatic elasticity (e.g., CPU, queue depth)
- Add persistence/state if you need resilience across restarts (Redis/DynamoDB)
- Add health checks to drain and recycle unhealthy workers

---

## Cost & Scaling
- Scale to zero when no sessions are active
- Set ASG min/max (e.g., `min=1`, `max=3`) to cap costs
- Use Spot Instances for non‑critical/editor workloads if acceptable

---

## Roadmap
- Authentication/authorization for worker endpoints
- Replace in‑memory pool with Redis/DynamoDB
- Smarter placement and warm pool pre‑scaling
- Observability (CloudWatch dashboards and alarms)
- Graceful draining via lifecycle hooks

---

## Security
- `.env` is ignored by Git. Never commit real credentials
- Rotate any leaked credentials immediately and replace with IAM roles
- Apply least‑privilege IAM policies scoped to your ASG and region

---

## Attribution
- Built with AWS SDK v3, Express, and TypeScript
- VS Code Web (code‑server) runs on the EC2 instances launched by the ASG

---

If you’d like a live walkthrough or have questions about the architecture, feel free to reach out. This project is production‑oriented and easy to extend for classroom platforms, cloud IDEs, or ephemeral dev environments.
