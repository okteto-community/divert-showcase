import { Kafka } from "kafkajs";

const kafkaBroker = process.env.KAFKA_BROKER || "kafka:9092";
const kafkaTopic = process.env.KAFKA_TOPIC || "messages";
const oktetoDivertHeader = "baggage.okteto-divert";

const kafka = new Kafka({
  clientId: "producer-service",
  brokers: [kafkaBroker],
});

function buildDivertKey(headers) {
  var tk = process.env.OKTETO_NAMESPACE;

  // if the request comes from a diverted environment, it will have this header
  if (headers[oktetoDivertHeader]) {
    tk = headers[oktetoDivertHeader];
  }

  return tk;
}

export async function sendMesage(message, headers) {
  const producer = kafka.producer();
  await producer.connect();
  const divertKey = buildDivertKey(headers);

  try {
    const kafkaMessage = {
      value: JSON.stringify({
        text: message,
        headers: {
          "baggage.okteto-divert": divertKey,
        },
      }),
    };
    await producer.send({
      topic: kafkaTopic,
      messages: [kafkaMessage],
    });
    console.log(`sent message: ${kafkaMessage.value}`);
  } catch (error) {
    throw `failed to send message: ${error}`;
  } finally {
    producer.disconnect();
  }
}
