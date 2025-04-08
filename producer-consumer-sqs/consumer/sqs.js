import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
const oktetoDivertHeader = "baggage.okteto-divert";
const client = new SQSClient({ region: process.env.AWS_REGION || "us-west-2" });
const queueUrl = process.env.SQS_QUEUE_URL;
const divertKey = getDivertKey();

function getDivertKey() {
  return process.env.OKTETO_NAMESPACE;
}

function buildDivertKey(headers) {
  var tk = process.env.OKTETO_NAMESPACE;

  // if the request comes from a diverted environment, it will have this header
  if (headers[oktetoDivertHeader]) {
    tk = headers[oktetoDivertHeader];
  }

  return tk;
}

// each environment has a different groupId to allow all environments from consuming from the same SQS queue
function shouldConsumeMessage(messageAttributes) {
  if (messageAttributes == undefined) {
    return false;
  }

  const divertAttribute = messageAttributes[oktetoDivertHeader];
  if (divertAttribute && divertAttribute.StringValue == divertKey) {
    return true;
  }

  console.log(`Skipping message since it has divertKey ${divertAttribute}`);

  return false;
}

export async function startConsumer(messageCallback) {
  console.log("🟢 Starting consumer");

  const params = {
    QueueUrl: queueUrl,
    MessageAttributeNames: ["All"],
    MaxNumberOfMessages: 10,
    VisibilityTimeout: 20,
    WaitTimeSeconds: 20,
  };

  while (true) {
    console.log("🚸 Waiting for messages");
    const messages = await client.send(new ReceiveMessageCommand(params));

    if (messages.Messages !== undefined) {
      messages.Messages.forEach(async (message) => {
        if (shouldConsumeMessage(message.MessageAttributes)) {
          messageCallback(message.Body);
          const deleteParams = {
            QueueUrl: queueUrl,
            ReceiptHandle: message.ReceiptHandle,
          };

          await client.send(new DeleteMessageCommand(deleteParams));
        }
      });
    }
  }
}
