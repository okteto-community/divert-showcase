import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
const oktetoDivertHeader = "baggage.okteto-divert";
const client = new SQSClient({ region: process.env.AWS_REGION || "us-west-2" });
const queueUrl = process.env.SQS_QUEUE_URL;

function buildDivertKey(headers) {
  var tk = process.env.OKTETO_NAMESPACE;

  // if the request comes from a diverted environment, it will have this header
  if (headers[oktetoDivertHeader]) {
    tk = headers[oktetoDivertHeader];
  }

  return tk;
}

export async function sendMesage(message, headers) {
  const divertKey = buildDivertKey(headers);

  try {
    const sqsMessage = {
      QueueUrl: queueUrl,
      MessageBody: message,
      MessageAttributes: {
        "baggage.okteto-divert": {
          DataType: "String",
          StringValue: divertKey,
        },
      },
    };

    const command = new SendMessageCommand(sqsMessage);
    const response = await client.send(command);

    console.log(`sent message id: ${response.MessageId}`);
  } catch (error) {
    throw `failed to send message to ${queueUrl}: ${error}`;
  }
}
