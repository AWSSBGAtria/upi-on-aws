export type Vec3 = [number, number, number];

export type NodeId =
  | "client"
  | "cloudfront"
  | "route53"
  | "waf"
  | "apigateway"
  | "cognito"
  | "kms"
  | "lambda"
  | "sqs"
  | "dynamodb"
  | "settlement"
  | "cloudwatch"
  | "xray"
  | "quicksight";

export type AzId = "az-1" | "az-2" | "az-3";

export type Phase = "loading" | "intro" | "title" | "ready";

export type NavId = "explore" | "simulate" | "architecture" | "about";

export type Theme = "dark" | "light";

export type SimMode = "idle" | "payment" | "high-traffic" | "failure" | "trace";

export type ViewId =
  | "overview"
  | "payment"
  | "security"
  | "data"
  | "observability"
  | "ha";

export type TxStatus =
  | "IDLE"
  | "INITIATING"
  | "AUTHENTICATING"
  | "ROUTING"
  | "PROCESSING"
  | "QUEUED"
  | "WRITING"
  | "SETTLING"
  | "CONFIRMING"
  | "CONFIRMED"
  | "BLOCKED"
  | "REROUTED";

export type AzState = "OPERATIONAL" | "DEGRADED" | "FAILED" | "RECOVERING";

export type NodeDef = {
  id: NodeId;
  name: string;
  aws: string;
  layer: string;
  role: string;
  behavior: string;
  scaling: string;
  connected: string[];
  latency: string;
  costLabel: string;
  costNote: string;
  color: "orange" | "blue" | "green" | "red" | "purple" | "cyan";
  position: Vec3;
  inspect: { position: Vec3; target: Vec3 };
  collider: Vec3;
};

export type CameraShot = {
  position: Vec3;
  target: Vec3;
  fov?: number;
};

export type StoryBeat = {
  index: number;
  kicker: string;
  title: string;
  body: string;
  view: ViewId;
  sim?: SimMode;
};

export type Metrics = {
  rps: number;
  active: number;
  latency: number;
  success: number;
  queue: number;
  compute: number;
  errors: number;
};

export type TxConsole = {
  id: string;
  status: TxStatus;
  latency: number;
  requestId: string;
  elapsed: number;
  services: string[];
  region: string;
  az: string;
};
