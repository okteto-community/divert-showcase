import {
  SQSClient,
  ChangeMessageVisibilityCommand,
  DeleteMessageCommand,
  ReceiveMessageCommand,
} from "@aws-sdk/client-sqs";

const oktetoDivertHeader = "baggage.okteto-divert";
const client = new SQSClient({ region: process.env.AWS_REGION || "us-west-2" });
const divertKey = getDivertKey();

function getQueueUrl() {
  var namespace = process.env.OKTETO_NAMESPACE;
  if (process.env.SHARED_NAMESPACE) {
    namespace = process.env.SHARED_NAMESPACE;
  }

  return `https://sqs.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_ACCOUNT_NUMBER}/${namespace}-divert-showcase-sqs`;
}

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

  console.log(
    `Skipping message since it has divertKey ${divertAttribute.StringValue}`,
  );

  return false;
}

export async function startConsumer(messageCallback) {
  console.log(`🟢 Starting consumer on queue ${getQueueUrl()}`);

  const params = {
    QueueUrl: getQueueUrl(),
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
            QueueUrl: getQueueUrl(),
            ReceiptHandle: message.ReceiptHandle,
          };

          await client.send(new DeleteMessageCommand(deleteParams));
        } else {
          const changeVisibilityParams = {
            QueueUrl: queueUrl,
            ReceiptHandle: message.ReceiptHandle,
            VisibilityTimeout: 0, // Setting to 0 makes it immediately visible to other workers
          };

          await client.send(
            new ChangeMessageVisibilityCommand(changeVisibilityParams),
          );
        }
      });
    }
  }
}
